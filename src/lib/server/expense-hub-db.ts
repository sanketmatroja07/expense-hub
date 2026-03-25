import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  createSeedStateForIdentity,
  syncStateWithIdentity,
  type AuthIdentity,
  type ExpenseHubState,
} from "@/lib/expense-hub-core";
import { getMongoDb, usingMongoDb } from "@/lib/server/mongodb";

interface AppStateDocument {
  userId: string;
  data: ExpenseHubState;
  updatedAt: string;
}

const defaultDbPath = process.env.VERCEL
  ? join("/tmp", "expense-hub.sqlite")
  : join(process.cwd(), "data", "expense-hub.sqlite");
const databasePath = process.env.EXPENSE_HUB_DB_PATH || defaultDbPath;
let database: DatabaseSync | null = null;

function getDatabase() {
  if (database) {
    return database;
  }

  mkdirSync(dirname(databasePath), { recursive: true });
  database = new DatabaseSync(databasePath);
  const existingColumns = database
    .prepare("PRAGMA table_info(app_state)")
    .all() as Array<{ name: string }>;
  const hasUserScopedSchema = existingColumns.some(
    (column) => column.name === "user_id"
  );

  if (existingColumns.length > 0 && !hasUserScopedSchema) {
    database.exec("DROP TABLE app_state;");
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      user_id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return database;
}

async function readMongoState(identity: AuthIdentity) {
  const db = await getMongoDb();
  const record = await db
    .collection<AppStateDocument>("app_state")
    .findOne({ userId: identity.id });

  if (!record?.data) {
    const seededState = createSeedStateForIdentity(identity);
    await writeMongoState(identity, seededState);
    return seededState;
  }

  return syncStateWithIdentity(record.data, identity);
}

async function writeMongoState(identity: AuthIdentity, state: ExpenseHubState) {
  const db = await getMongoDb();
  const syncedState = syncStateWithIdentity(state, identity);

  await db.collection<AppStateDocument>("app_state").replaceOne(
    { userId: identity.id },
    {
      userId: identity.id,
      data: syncedState,
      updatedAt: new Date().toISOString(),
    },
    { upsert: true }
  );
}

function readLocalState(identity: AuthIdentity): ExpenseHubState {
  const db = getDatabase();
  const row = db
    .prepare("SELECT data FROM app_state WHERE user_id = ?")
    .get(identity.id) as { data?: string } | undefined;

  if (!row?.data) {
    const seededState = createSeedStateForIdentity(identity);
    writeLocalState(identity, seededState);
    return seededState;
  }

  return syncStateWithIdentity(JSON.parse(row.data) as ExpenseHubState, identity);
}

function writeLocalState(identity: AuthIdentity, state: ExpenseHubState) {
  const db = getDatabase();
  db.prepare(
    "INSERT OR REPLACE INTO app_state (user_id, data, updated_at) VALUES (?, ?, ?)"
  ).run(
    identity.id,
    JSON.stringify(syncStateWithIdentity(state, identity)),
    new Date().toISOString()
  );
}

export async function readExpenseHubState(
  identity: AuthIdentity
): Promise<ExpenseHubState> {
  if (usingMongoDb()) {
    return readMongoState(identity);
  }

  return readLocalState(identity);
}

export async function writeExpenseHubState(
  identity: AuthIdentity,
  state: ExpenseHubState
) {
  if (usingMongoDb()) {
    await writeMongoState(identity, state);
    return;
  }

  writeLocalState(identity, state);
}

export async function mutateExpenseHubState(
  identity: AuthIdentity,
  mutator: (state: ExpenseHubState) => ExpenseHubState
) {
  const nextState = mutator(await readExpenseHubState(identity));
  await writeExpenseHubState(identity, nextState);
  return nextState;
}
