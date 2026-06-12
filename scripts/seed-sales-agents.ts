/**
 * Seed inicial de comerciales + migración de tasks.assignee (enum) a salesAgentId (ObjectId).
 *
 * Idempotente: si los comerciales ya existen (por nombre) no se duplican.
 * Si una task ya tiene `salesAgentId` válido, no se toca.
 * Si una task tiene `assignee` con un valor del enum antiguo, se traduce al ObjectId del comercial con el mismo nombre.
 * Tras la migración, se elimina el campo `assignee` de los documentos de tasks.
 *
 * Ejecutar con:  npx tsx scripts/seed-sales-agents.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { ObjectId, MongoClient } from "mongodb";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "adimencrm";

if (!uri) {
  throw new Error("MONGODB_URI no está definida en .env.local");
}

const SEED_AGENTS: Array<{
  name: string;
  email: string;
  color: string;
}> = [
  { name: "Andrea", email: "andrea@adimenai.com", color: "#EC4899" },
  { name: "Asier", email: "asier@adimenai.com", color: "#3B82F6" },
  { name: "Joseba", email: "joseba@adimenai.com", color: "#10B981" },
  { name: "Iñaki", email: "inaki@adimenai.com", color: "#F59E0B" },
];

async function main() {
  const client = new MongoClient(uri!, {
    serverSelectionTimeoutMS: 10_000,
    appName: "AdimenCRM-Seed",
  });
  await client.connect();
  const db = client.db(dbName);

  const salesAgents = db.collection("salesAgents");
  const tasks = db.collection("tasks");

  console.log("→ Insertando comerciales semilla…");
  const nameToId = new Map<string, ObjectId>();
  for (const seed of SEED_AGENTS) {
    const existing = await salesAgents.findOne({ name: seed.name });
    if (existing) {
      console.log(`  · ${seed.name} ya existe (${existing._id})`);
      nameToId.set(seed.name, existing._id as ObjectId);
      continue;
    }
    const now = new Date().toISOString();
    const res = await salesAgents.insertOne({
      name: seed.name,
      email: seed.email,
      phone: "",
      color: seed.color,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  + ${seed.name} creado (${res.insertedId})`);
    nameToId.set(seed.name, res.insertedId);
  }

  console.log("→ Migrando tasks.assignee → tasks.salesAgentId…");
  const oldTasks = (await tasks
    .find({ assignee: { $exists: true } })
    .toArray()) as Array<{ _id: ObjectId; assignee?: string; salesAgentId?: ObjectId }>;

  let migrated = 0;
  let cleared = 0;
  for (const t of oldTasks) {
    if (!t.assignee) continue;
    if (t.salesAgentId) {
      // Ya migrado: solo limpiamos el campo antiguo
      await tasks.updateOne(
        { _id: t._id },
        { $unset: { assignee: "" } }
      );
      cleared++;
      continue;
    }
    const agentId = nameToId.get(t.assignee);
    if (!agentId) {
      console.log(`  ! task ${t._id} con assignee="${t.assignee}" sin comercial equivalente, se descarta`);
      await tasks.updateOne(
        { _id: t._id },
        { $unset: { assignee: "" } }
      );
      cleared++;
      continue;
    }
    await tasks.updateOne(
      { _id: t._id },
      { $set: { salesAgentId: agentId }, $unset: { assignee: "" } }
    );
    migrated++;
  }
  console.log(`  · ${migrated} tasks migradas, ${cleared} campos assignee eliminados`);

  const total = await tasks.countDocuments();
  const withAgent = await tasks.countDocuments({ salesAgentId: { $exists: true } });
  const totalAgents = await salesAgents.countDocuments();
  console.log(
    `✓ Listo. ${totalAgents} comerciales, ${withAgent}/${total} tasks con comercial asignado.`
  );

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
