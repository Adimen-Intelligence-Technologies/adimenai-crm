import { ObjectId } from "mongodb";
import { getSalesAgentsCollection } from "@/lib/db";
import type {
  CreateSalesAgentInput,
  UpdateSalesAgentInput,
} from "@/lib/schemas/sales-agent";

export type SalesAgent = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type SalesAgentDoc = Omit<SalesAgent, "_id"> & { _id: ObjectId };

function toSalesAgent(doc: SalesAgentDoc): SalesAgent {
  const { _id, ...rest } = doc;
  return { _id: _id.toString(), ...rest };
}

export async function listSalesAgents(filter: {
  isActive?: boolean;
} = {}): Promise<SalesAgent[]> {
  const collection = await getSalesAgentsCollection();
  const query: Record<string, unknown> = {};
  if (typeof filter.isActive === "boolean") query.isActive = filter.isActive;
  const docs = (await collection
    .find(query)
    .sort({ name: 1 })
    .toArray()) as unknown as SalesAgentDoc[];
  return docs.map(toSalesAgent);
}

export async function getSalesAgent(id: string): Promise<SalesAgent | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getSalesAgentsCollection();
  const doc = (await collection.findOne({
    _id: new ObjectId(id),
  })) as unknown as SalesAgentDoc | null;
  return doc ? toSalesAgent(doc) : null;
}

export async function getSalesAgentsByIds(
  ids: string[]
): Promise<SalesAgent[]> {
  const valid = ids.filter((id) => ObjectId.isValid(id));
  if (valid.length === 0) return [];
  const collection = await getSalesAgentsCollection();
  const docs = (await collection
    .find({ _id: { $in: valid.map((id) => new ObjectId(id)) } })
    .toArray()) as unknown as SalesAgentDoc[];
  return docs.map(toSalesAgent);
}

export async function createSalesAgent(
  data: CreateSalesAgentInput
): Promise<SalesAgent> {
  const collection = await getSalesAgentsCollection();
  const now = new Date().toISOString();
  const doc: Omit<SalesAgentDoc, "_id"> = {
    name: data.name.trim(),
    email: data.email ?? "",
    phone: data.phone ?? "",
    color: data.color,
    isActive: data.isActive,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(doc as unknown as SalesAgentDoc);
  return { _id: result.insertedId.toString(), ...doc };
}

export async function updateSalesAgent(
  id: string,
  data: Record<string, unknown>
): Promise<SalesAgent | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getSalesAgentsCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date().toISOString() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return toSalesAgent(result as unknown as SalesAgentDoc);
}

export async function deleteSalesAgent(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getSalesAgentsCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function findSalesAgentByName(
  name: string
): Promise<SalesAgent | null> {
  const collection = await getSalesAgentsCollection();
  const rx = new RegExp(
    `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    "i"
  );
  const doc = (await collection.findOne({ name: rx })) as unknown as
    | SalesAgentDoc
    | null;
  return doc ? toSalesAgent(doc) : null;
}
