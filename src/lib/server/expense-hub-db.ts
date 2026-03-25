import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { seedState, type ExpenseHubState } from "@/lib/expense-hub-core";

const defaultDbPath = join(process.cwd(), "data", "expense-hub.sqlite");
const databasePath = process.env.EXPENSE_HUB_DB_PATH || defaultDbPath;

let database: DatabaseSync | null = null;

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

export function readExpenseHubState(): ExpenseHubState {
  const db = getDatabase();
  const row = db
    .prepare("SELECT data FROM app_state WHERE id = 1")
    .get() as { data: string };

  return JSON.parse(row.data) as ExpenseHubState;
}

export function writeExpenseHubState(state: ExpenseHubState) {
  const db = getDatabase();
  db.prepare("UPDATE app_state SET data = ?, updated_at = ? WHERE id = 1").run(
    JSON.stringify(state),
    new Date().toISOString()
  );
}

export function mutateExpenseHubState(
  mutator: (state: ExpenseHubState) => ExpenseHubState
) {
  const nextState = mutator(readExpenseHubState());
  writeExpenseHubState(nextState);
  return nextState;
}
