import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { seedState, type ExpenseHubState } from "@/lib/expense-hub-core";

const defaultDbPath = join(process.cwd(), "data", "expense-hub.sqlite");
const databasePath = process.env.EXPENSE_HUB_DB_PATH || defaultDbPath;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "expense-hub";
const supabaseObjectPath =
  process.env.SUPABASE_STORAGE_PATH || "state/expense-hub.json";

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
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const existing = database
    .prepare("SELECT data FROM app_state WHERE id = 1")
    .get() as { data?: string } | undefined;

  if (!existing?.data) {
    const now = new Date().toISOString();
    database
      .prepare(
        "INSERT INTO app_state (id, data, updated_at) VALUES (1, ?, ?)"
      )
      .run(JSON.stringify(seedState), now);
  }

  return database;
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

async function readSupabaseState() {
  await ensureSupabaseBucket();
  const response = await supabaseRequest(
    `/storage/v1/object/${supabaseBucket}/${supabaseObjectPath}`,
    { method: "GET", expectedStatuses: [404] }
  );

  if (response.status === 404) {
    await writeSupabaseState(seedState, false);
    return seedState;
  }

  return (await response.json()) as ExpenseHubState;
}

async function writeSupabaseState(
  state: ExpenseHubState,
  updateExisting: boolean = true
) {
  await ensureSupabaseBucket();
  await supabaseRequest(`/storage/v1/object/${supabaseBucket}/${supabaseObjectPath}`, {
    method: updateExisting ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      "x-upsert": "true",
    },
    body: JSON.stringify(state),
  });
}

function readLocalState(): ExpenseHubState {
  const db = getDatabase();
  const row = db
    .prepare("SELECT data FROM app_state WHERE id = 1")
    .get() as { data: string };

  return JSON.parse(row.data) as ExpenseHubState;
}

function writeLocalState(state: ExpenseHubState) {
  const db = getDatabase();
  db.prepare("UPDATE app_state SET data = ?, updated_at = ? WHERE id = 1").run(
    JSON.stringify(state),
    new Date().toISOString()
  );
}

export async function readExpenseHubState(): Promise<ExpenseHubState> {
  if (usingHostedStorage()) {
    return readSupabaseState();
  }
  return readLocalState();
}

export async function writeExpenseHubState(state: ExpenseHubState) {
  if (usingHostedStorage()) {
    await writeSupabaseState(state);
    return;
  }
  writeLocalState(state);
}

export async function mutateExpenseHubState(
  mutator: (state: ExpenseHubState) => ExpenseHubState
) {
  const nextState = mutator(await readExpenseHubState());
  await writeExpenseHubState(nextState);
  return nextState;
}
