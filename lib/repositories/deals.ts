import { ObjectId } from "mongodb";
import { getClientsCollection, getDealsCollection } from "@/lib/db";
import {
  canTransition,
  type CreateDealInput,
  type DealStage,
  type UpdateDealInput,
} from "@/lib/schemas/deal";

export type Deal = {
  _id: string;
  title: string;
  clientId: string;
  salesAgentId?: string;
  businessLine: "adimenai" | "herrikonekt" | "hiopos";
  sourceActivityId?: string;
  sourcePresupuestoId?: string;
  estimatedValue: number;
  currency: string;
  stage: DealStage;
  expectedCloseDate?: string;
  closedAt?: string;
  lostReason?: string;
  notes: string;
  clientSnapshot: {
    name: string;
    email?: string;
    phone?: string;
    taxId?: string;
  };
  createdAt: string;
  updatedAt: string;
};

type DealDoc = Omit<Deal, "_id"> & { _id: ObjectId };

function toDeal(doc: DealDoc): Deal {
  const { _id, ...rest } = doc;
  return { _id: _id.toString(), ...rest };
}

async function buildClientSnapshot(clientId: string) {
  const clients = await getClientsCollection();
  const c = (await clients.findOne({ _id: new ObjectId(clientId) })) as
    | {
        name: string;
        email?: string;
        phones?: string[];
        billing?: { taxId?: string };
      }
    | null;
  if (!c) {
    return { name: "(cliente eliminado)", email: undefined, phone: undefined, taxId: undefined };
  }
  return {
    name: c.name,
    email: c.email,
    phone: c.phones?.[0],
    taxId: c.billing?.taxId,
  };
}

export async function listDeals(filter: {
  stage?: DealStage;
  businessLine?: "adimenai" | "herrikonekt" | "hiopos";
  salesAgentId?: string;
  clientId?: string;
  q?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ items: Deal[]; total: number; page: number; pageSize: number; totalPages: number }> {
  const collection = await getDealsCollection();
  const query: Record<string, unknown> = {};
  if (filter.stage) query.stage = filter.stage;
  if (filter.businessLine) query.businessLine = filter.businessLine;
  if (filter.salesAgentId && ObjectId.isValid(filter.salesAgentId)) {
    query.salesAgentId = new ObjectId(filter.salesAgentId);
  }
  if (filter.clientId && ObjectId.isValid(filter.clientId)) {
    query.clientId = new ObjectId(filter.clientId);
  }
  if (filter.q && filter.q.trim()) {
    const rx = new RegExp(escapeRegex(filter.q.trim()), "i");
    query.$or = [{ title: rx }, { "clientSnapshot.name": rx }];
  }
  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? 200;
  const total = await collection.countDocuments(query);
  const docs = (await collection
    .find(query)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray()) as unknown as DealDoc[];
  return {
    items: docs.map(toDeal),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getDeal(id: string): Promise<Deal | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getDealsCollection();
  const doc = (await collection.findOne({
    _id: new ObjectId(id),
  })) as unknown as DealDoc | null;
  return doc ? toDeal(doc) : null;
}

export async function listDealsByClient(clientId: string): Promise<Deal[]> {
  if (!ObjectId.isValid(clientId)) return [];
  const collection = await getDealsCollection();
  const docs = (await collection
    .find({ clientId: new ObjectId(clientId) })
    .sort({ updatedAt: -1 })
    .toArray()) as unknown as DealDoc[];
  return docs.map(toDeal);
}

export async function findActiveDealByPresupuesto(
  presupuestoId: string
): Promise<Deal | null> {
  if (!ObjectId.isValid(presupuestoId)) return null;
  const collection = await getDealsCollection();
  const doc = (await collection.findOne({
    sourcePresupuestoId: new ObjectId(presupuestoId),
    stage: { $in: ["accepted", "contracted", "invoiced", "paid"] },
  })) as unknown as DealDoc | null;
  return doc ? toDeal(doc) : null;
}

export async function createDeal(data: CreateDealInput): Promise<Deal> {
  const collection = await getDealsCollection();
  const now = new Date().toISOString();
  const snapshot = await buildClientSnapshot(data.clientId);
  const doc: Omit<DealDoc, "_id"> = {
    title: data.title.trim(),
    clientId: data.clientId,
    salesAgentId: data.salesAgentId
      ? new ObjectId(data.salesAgentId).toString()
      : undefined,
    businessLine: data.businessLine,
    sourceActivityId: data.sourceActivityId
      ? new ObjectId(data.sourceActivityId).toString()
      : undefined,
    sourcePresupuestoId: data.sourcePresupuestoId
      ? new ObjectId(data.sourcePresupuestoId).toString()
      : undefined,
    estimatedValue: data.estimatedValue,
    currency: data.currency,
    stage: data.stage,
    expectedCloseDate: data.expectedCloseDate || undefined,
    notes: data.notes ?? "",
    clientSnapshot: snapshot,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(doc as unknown as DealDoc);
  return toDeal({ _id: result.insertedId, ...doc });
}

export async function updateDeal(
  id: string,
  data: UpdateDealInput
): Promise<Deal | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getDealsCollection();
  const setData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (key === "salesAgentId" || key === "sourceActivityId" || key === "sourcePresupuestoId") {
      if (value && ObjectId.isValid(String(value))) {
        setData[key] = new ObjectId(String(value));
      } else {
        setData[key] = null;
      }
      continue;
    }
    setData[key] = value;
  }
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: setData },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return toDeal(result as unknown as DealDoc);
}

export async function moveDealStage(
  id: string,
  newStage: DealStage,
  lostReason?: string
): Promise<Deal | { error: string } | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getDealsCollection();
  const current = (await collection.findOne({
    _id: new ObjectId(id),
  })) as unknown as DealDoc | null;
  if (!current) return null;
  if (current.stage === newStage) return toDeal(current);
  if (!canTransition(current.stage, newStage)) {
    return { error: `No se puede pasar de "${current.stage}" a "${newStage}"` };
  }
  const setData: Record<string, unknown> = {
    stage: newStage,
    updatedAt: new Date().toISOString(),
  };
  if (newStage === "paid" || newStage === "lost") {
    setData.closedAt = new Date().toISOString();
  }
  if (newStage === "lost") {
    setData.lostReason = lostReason ?? "";
  } else {
    setData.lostReason = null;
  }
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: setData },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return toDeal(result as unknown as DealDoc);
}

export async function deleteDeal(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getDealsCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
