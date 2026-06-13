import { MongoClient, type Db } from "mongodb";

const dbName = process.env.MONGODB_DB ?? "adimencrm";

type GlobalWithMongo = typeof globalThis & {
  _mongoClient?: MongoClient;
};

const globalForMongo = globalThis as GlobalWithMongo;

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  return uri;
}

export function getMongoClient(): MongoClient {
  if (!globalForMongo._mongoClient) {
    globalForMongo._mongoClient = new MongoClient(getUri(), {
      serverSelectionTimeoutMS: 10_000,
      appName: "AdimenCRM",
    });
  }
  return globalForMongo._mongoClient;
}

export async function getDb(): Promise<Db> {
  const client = getMongoClient();
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

export async function getPresupuestosCollection() {
  const db = await getDb();
  return db.collection("presupuestos");
}

export async function getServicesCollection() {
  const db = await getDb();
  return db.collection("services");
}

export async function getSalesAgentsCollection() {
  const db = await getDb();
  return db.collection("salesAgents");
}

export async function getActivitiesCollection() {
  const db = await getDb();
  return db.collection("activities");
}
