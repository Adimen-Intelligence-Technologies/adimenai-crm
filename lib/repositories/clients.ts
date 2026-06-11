import { ObjectId } from "mongodb";
import { getClientsCollection } from "@/lib/db";
import type {
  BusinessLine,
  ClientBilling,
  ClientSocialLinks,
  CreateHerrikonektInput,
  OpeningHours,
} from "@/lib/schemas/client";

export type Client = {
  _id: string;
  businessLine: BusinessLine;
  name: string;
  description?: string;
  website?: string;
  email?: string;
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
  customTypeIcon?: string;
  syncToApp?: boolean;
  social?: ClientSocialLinks;
  billing?: ClientBilling;
  openingHours?: OpeningHours;
  createdAt: string;
  updatedAt: string;
};

type ClientDoc = Omit<Client, "_id"> & { _id: ObjectId };

function toClient(doc: ClientDoc): Client {
  const { _id, ...rest } = doc;
  return { _id: _id.toString(), ...rest };
}

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listClients(filter: {
  businessLine?: BusinessLine;
  q?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<PaginatedResult<Client>> {
  const collection = await getClientsCollection();
  const query: Record<string, unknown> = {};
  if (filter.businessLine) query.businessLine = filter.businessLine;
  if (filter.q && filter.q.trim()) {
    const rx = new RegExp(escapeRegex(filter.q.trim()), "i");
    query.$or = [
      { name: rx },
      { "addresses.city": rx },
      { phones: rx },
    ];
  }
  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? 7;
  const total = await collection.countDocuments(query);
  const docs = (await collection
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray()) as unknown as ClientDoc[];
  return {
    items: docs.map(toClient),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
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
  data: Record<string, unknown>
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
