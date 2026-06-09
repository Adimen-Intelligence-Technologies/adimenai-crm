import { ObjectId } from "mongodb";
import { getClientsCollection } from "@/lib/db";
import type {
  BusinessLine,
  ClientBilling,
  CreateHerrikonektInput,
  UpdateHerrikonektInput,
} from "@/lib/schemas/client";

export type Client = {
  _id: string;
  businessLine: BusinessLine;
  name: string;
  description?: string;
  website?: string;
  phones: string[];
  addresses: Array<{
    line1: string;
    line2?: string;
    city: string;
    zip?: string;
    country?: string;
    isPrimary?: boolean;
  }>;
  type?: string;
  subType?: string;
  syncToApp?: boolean;
  billing?: ClientBilling;
  createdAt: string;
  updatedAt: string;
};

type ClientDoc = Omit<Client, "_id"> & { _id: ObjectId };

function toClient(doc: ClientDoc): Client {
  const { _id, ...rest } = doc;
  return { _id: _id.toString(), ...rest };
}

export async function listClients(filter: {
  businessLine?: BusinessLine;
  q?: string;
} = {}): Promise<Client[]> {
  const collection = await getClientsCollection();
  const query: Record<string, unknown> = {};
  if (filter.businessLine) query.businessLine = filter.businessLine;
  if (filter.q && filter.q.trim()) {
    const rx = new RegExp(escapeRegex(filter.q.trim()), "i");
    query.$or = [
      { name: rx },
      { "addresses.city": rx },
      { phones: rx },
      { subType: rx },
    ];
  }
  const docs = (await collection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray()) as unknown as ClientDoc[];
  return docs.map(toClient);
}

export async function getClient(id: string): Promise<Client | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getClientsCollection();
  const doc = (await collection.findOne({
    _id: new ObjectId(id),
  })) as unknown as ClientDoc | null;
  return doc ? toClient(doc) : null;
}

export async function createClient(
  data: CreateHerrikonektInput
): Promise<Client> {
  const collection = await getClientsCollection();
  const now = new Date().toISOString();
  const doc: Omit<ClientDoc, "_id"> = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(doc as unknown as ClientDoc);
  return { _id: result.insertedId.toString(), ...doc };
}

export async function updateClient(
  id: string,
  data: UpdateHerrikonektInput
): Promise<Client | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getClientsCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date().toISOString() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return toClient(result as unknown as ClientDoc);
}

export async function deleteClient(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getClientsCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
