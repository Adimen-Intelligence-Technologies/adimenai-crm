import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "adimencrm";

if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

type GlobalWithMongo = typeof globalThis & {
  _mongoClient?: MongoClient;
};

const globalForMongo = globalThis as GlobalWithMongo;

export async function getDb(): Promise<Db> {
  if (!globalForMongo._mongoClient) {
    globalForMongo._mongoClient = new MongoClient(uri!, {
      serverSelectionTimeoutMS: 10_000,
      appName: "AdimenCRM",
    });
  }
  const client = globalForMongo._mongoClient;
  await client.connect();
  return client.db(dbName);
}

export async function pingDb(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return true;
  } catch (err) {
    console.error("MongoDB ping failed:", err);
    return false;
  }
}

export async function getClientsCollection() {
  const db = await getDb();
  return db.collection("clients");
}

export async function getTasksCollection() {
  const db = await getDb();
  return db.collection("tasks");
}
