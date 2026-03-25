import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { getDisplayNameFromEmail } from "@/lib/expense-hub-core";
import { getMongoDb, usingMongoDb } from "@/lib/server/mongodb";

export interface AuthUserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateAuthUserInput {
  email: string;
  name?: string;
  passwordHash: string;
}

const defaultDbPath = process.env.VERCEL
  ? join("/tmp", "expense-hub.sqlite")
  : join(process.cwd(), "data", "expense-hub.sqlite");
const databasePath = process.env.EXPENSE_HUB_DB_PATH || defaultDbPath;
let database: DatabaseSync | null = null;
let ensuredMongoIndexes: Promise<void> | null = null;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getDatabase() {
  if (database) {
    return database;
  }

  mkdirSync(dirname(databasePath), { recursive: true });
  database = new DatabaseSync(databasePath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return database;
}

async function ensureMongoIndexes() {
  if (!usingMongoDb()) {
    return;
  }

  if (!ensuredMongoIndexes) {
    ensuredMongoIndexes = (async () => {
      const db = await getMongoDb();
      await db.collection<AuthUserRecord>("auth_users").createIndex(
        { email: 1 },
        { unique: true }
      );
      await db.collection("app_state").createIndex(
        { userId: 1 },
        { unique: true }
      );
    })();
  }

  await ensuredMongoIndexes;
}

async function findMongoUserByEmail(email: string) {
  await ensureMongoIndexes();
  const db = await getMongoDb();
  return db
    .collection<AuthUserRecord>("auth_users")
    .findOne({ email: normalizeEmail(email) });
}

async function findMongoUserById(id: string) {
  await ensureMongoIndexes();
  const db = await getMongoDb();
  return db.collection<AuthUserRecord>("auth_users").findOne({ id });
}

async function createMongoUser(input: CreateAuthUserInput) {
  await ensureMongoIndexes();
  const db = await getMongoDb();
  const now = new Date().toISOString();
  const record: AuthUserRecord = {
    id: randomUUID(),
    email: normalizeEmail(input.email),
    name:
      input.name?.trim() || getDisplayNameFromEmail(normalizeEmail(input.email)),
    passwordHash: input.passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection<AuthUserRecord>("auth_users").insertOne(record);
  return record;
}

async function updateMongoUserName(id: string, name: string) {
  await ensureMongoIndexes();
  const db = await getMongoDb();
  await db.collection<AuthUserRecord>("auth_users").updateOne(
    { id },
    {
      $set: {
        name: name.trim(),
        updatedAt: new Date().toISOString(),
      },
    }
  );
}

function findLocalUserByEmail(email: string) {
  const db = getDatabase();
  const row = db
    .prepare(
      "SELECT id, email, name, password_hash as passwordHash, created_at as createdAt, updated_at as updatedAt FROM auth_users WHERE email = ?"
    )
    .get(normalizeEmail(email)) as AuthUserRecord | undefined;

  return row ?? null;
}

function findLocalUserById(id: string) {
  const db = getDatabase();
  const row = db
    .prepare(
      "SELECT id, email, name, password_hash as passwordHash, created_at as createdAt, updated_at as updatedAt FROM auth_users WHERE id = ?"
    )
    .get(id) as AuthUserRecord | undefined;

  return row ?? null;
}

function createLocalUser(input: CreateAuthUserInput) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const record: AuthUserRecord = {
    id: randomUUID(),
    email: normalizeEmail(input.email),
    name:
      input.name?.trim() || getDisplayNameFromEmail(normalizeEmail(input.email)),
    passwordHash: input.passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  db.prepare(
    "INSERT INTO auth_users (id, email, name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    record.id,
    record.email,
    record.name,
    record.passwordHash,
    record.createdAt,
    record.updatedAt
  );

  return record;
}

function updateLocalUserName(id: string, name: string) {
  const db = getDatabase();
  db.prepare(
    "UPDATE auth_users SET name = ?, updated_at = ? WHERE id = ?"
  ).run(name.trim(), new Date().toISOString(), id);
}

export async function findAuthUserByEmail(email: string) {
  if (usingMongoDb()) {
    return findMongoUserByEmail(email);
  }

  return findLocalUserByEmail(email);
}

export async function findAuthUserById(id: string) {
  if (usingMongoDb()) {
    return findMongoUserById(id);
  }

  return findLocalUserById(id);
}

export async function createAuthUser(input: CreateAuthUserInput) {
  if (usingMongoDb()) {
    return createMongoUser(input);
  }

  return createLocalUser(input);
}

export async function updateAuthUserName(id: string, name: string) {
  if (usingMongoDb()) {
    await updateMongoUserName(id, name);
    return;
  }

  updateLocalUserName(id, name);
}

export function getNormalizedEmail(email: string) {
  return normalizeEmail(email);
}
