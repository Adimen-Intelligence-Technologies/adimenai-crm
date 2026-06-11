import { ObjectId } from "mongodb";
import { getServicesCollection } from "@/lib/db";
import type { BusinessLine } from "@/lib/schemas/client";
import type { Service, CreateServiceInput } from "@/lib/schemas/service";

type ServiceDoc = Omit<Service, "_id"> & { _id: ObjectId };

function toService(doc: ServiceDoc): Service {
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

export async function listServices(filter: {
  businessLine?: BusinessLine;
  q?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<PaginatedResult<Service>> {
  const collection = await getServicesCollection();
  const query: Record<string, unknown> = {};
  if (filter.businessLine) query.businessLine = filter.businessLine;
  if (filter.q && filter.q.trim()) {
    const rx = new RegExp(escapeRegex(filter.q.trim()), "i");
    query.$or = [
      { name: rx },
      { description: rx },
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
    .toArray()) as unknown as ServiceDoc[];
  return {
    items: docs.map(toService),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getService(id: string): Promise<Service | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getServicesCollection();
  const doc = (await collection.findOne({ _id: new ObjectId(id) })) as unknown as ServiceDoc | null;
  return doc ? toService(doc) : null;
}

export async function createService(data: CreateServiceInput): Promise<Service> {
  const collection = await getServicesCollection();
  const now = new Date().toISOString();
  const doc: Omit<ServiceDoc, "_id"> = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(doc as unknown as ServiceDoc);
  return { _id: result.insertedId.toString(), ...doc };
}

export async function updateService(
  id: string,
  data: Record<string, unknown>
): Promise<Service | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getServicesCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date().toISOString() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return toService(result as unknown as ServiceDoc);
}

export async function deleteService(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getServicesCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
