import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB_NAME || "expensehub";

declare global {
  // eslint-disable-next-line no-var
  var __expenseHubMongoClientPromise: Promise<MongoClient> | undefined;
}

function createMongoClientPromise() {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const client = new MongoClient(mongoUri);
  return client.connect();
}

export function usingMongoDb() {
  return Boolean(mongoUri);
}

export function getMongoClient() {
  if (!usingMongoDb()) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!global.__expenseHubMongoClientPromise) {
    global.__expenseHubMongoClientPromise = createMongoClientPromise();
  }

  return global.__expenseHubMongoClientPromise;
}

export async function getMongoDb() {
  const client = await getMongoClient();
  return client.db(mongoDbName);
}
