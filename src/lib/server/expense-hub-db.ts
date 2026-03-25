import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  createSeedStateForIdentity,
  syncStateWithIdentity,
  type AuthIdentity,
  type ExpenseHubState,
} from "@/lib/expense-hub-core";

const defaultDbPath = join(process.cwd(), "data", "expense-hub.sqlite");
const databasePath = process.env.EXPENSE_HUB_DB_PATH || defaultDbPath;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "expense-hub";
const supabaseObjectPath =
  process.env.SUPABASE_STORAGE_PATH || "state";

let database: DatabaseSync | null = null;

function usingHostedStorage() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

function getDatabase() {
  if (database) {
    return database;
  }

  mkdirSync(dirname(databasePath), { recursive: true });
  database = new DatabaseSync(databasePath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      user_id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return database;
}

function getUserScopedObjectPath(userId: string) {
  if (supabaseObjectPath.endsWith(".json")) {
    return supabaseObjectPath.replace(/\.json$/, `-${userId}.json`);
  }
  return `${supabaseObjectPath.replace(/\/$/, "")}/${userId}.json`;
}

async function supabaseRequest(
  path: string,
  init?: RequestInit & { expectedStatuses?: number[] }
) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      apikey: `${supabaseServiceRoleKey}`,
      ...(init?.headers || {}),
    },
  });

  if (init?.expectedStatuses?.includes(response.status)) {
    return response;
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with ${response.status}.`);
  }

  return response;
}

async function ensureSupabaseBucket() {
  await supabaseRequest("/storage/v1/bucket", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: supabaseBucket,
      name: supabaseBucket,
      public: false,
    }),
    expectedStatuses: [200, 201, 409, 400],
  });
}

async function readSupabaseState(identity: AuthIdentity) {
  await ensureSupabaseBucket();
  const response = await supabaseRequest(
    `/storage/v1/object/${supabaseBucket}/${getUserScopedObjectPath(identity.id)}`,
    { method: "GET", expectedStatuses: [404] }
  );

  if (response.status === 404) {
    const seededState = createSeedStateForIdentity(identity);
    await writeSupabaseState(identity, seededState, false);
    return seededState;
  }

  const storedState = (await response.json()) as ExpenseHubState;
  return syncStateWithIdentity(storedState, identity);
}

async function writeSupabaseState(
  identity: AuthIdentity,
  state: ExpenseHubState,
  updateExisting: boolean = true
) {
  await ensureSupabaseBucket();
  await supabaseRequest(
    `/storage/v1/object/${supabaseBucket}/${getUserScopedObjectPath(identity.id)}`,
    {
      method: updateExisting ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        "x-upsert": "true",
      },
      body: JSON.stringify(syncStateWithIdentity(state, identity)),
    }
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
  if (usingHostedStorage()) {
    return readSupabaseState(identity);
  }
  return readLocalState(identity);
}

export async function writeExpenseHubState(
  identity: AuthIdentity,
  state: ExpenseHubState
) {
  if (usingHostedStorage()) {
    await writeSupabaseState(identity, state);
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
