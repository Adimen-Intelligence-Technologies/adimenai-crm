import { ObjectId } from "mongodb";
import { getPresupuestosCollection } from "@/lib/db";
import { businessLinePrefix, calculateItemTotal } from "@/lib/schemas/presupuesto";
import type {
  BusinessLine,
  CreatePresupuestoInput,
  PresupuestoStatus,
  UpdatePresupuestoInput,
} from "@/lib/schemas/presupuesto";

export type Presupuesto = {
  _id: string;
  number: string;
  businessLine: BusinessLine;
  clientId: string;
  salesAgentId?: string;
  clientSnapshot: {
    name: string;
    nif?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  introduction: string;
  items: Array<{
    title: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
  status: PresupuestoStatus;
  sourceActivityId?: string;
  pdfDriveFileId: string | null;
  createdAt: string;
  updatedAt: string;
};

type PresupuestoDoc = Omit<Presupuesto, "_id"> & { _id: ObjectId };

function toPublic(doc: PresupuestoDoc): Presupuesto {
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

async function getNextNumber(businessLine: BusinessLine): Promise<string> {
  const collection = await getPresupuestosCollection();
  const prefix = businessLinePrefix[businessLine];

  const last = (await collection
    .find({ number: { $regex: `^${escapeRegex(prefix)}-` } })
    .project({ number: 1 })
    .sort({ number: -1 })
    .limit(1)
    .toArray()) as unknown as { number: string }[];

  let nextNum = 1;
  if (last.length > 0) {
    const parts = last[0].number.split("-");
    nextNum = parseInt(parts[1] ?? "0", 10) + 1;
  }

  return `${prefix}-${String(nextNum).padStart(4, "0")}`;
}

export async function listPresupuestos(filter: {
  businessLine?: BusinessLine;
  q?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<PaginatedResult<Presupuesto>> {
  const collection = await getPresupuestosCollection();
  const query: Record<string, unknown> = {};
  if (filter.businessLine) query.businessLine = filter.businessLine;
  if (filter.q && filter.q.trim()) {
    const rx = new RegExp(escapeRegex(filter.q.trim()), "i");
    query.$or = [
      { number: rx },
      { "clientSnapshot.name": rx },
    ];
  }
  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? 25;
  const total = await collection.countDocuments(query);
  const docs = (await collection
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray()) as unknown as PresupuestoDoc[];
  return {
    items: docs.map(toPublic),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPresupuesto(id: string): Promise<Presupuesto | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getPresupuestosCollection();
  const doc = (await collection.findOne({
    _id: new ObjectId(id),
  })) as unknown as PresupuestoDoc | null;
  return doc ? toPublic(doc) : null;
}

export async function createPresupuesto(
  data: CreatePresupuestoInput
): Promise<Presupuesto> {
  const collection = await getPresupuestosCollection();
  const number = await getNextNumber(data.businessLine);
  const now = new Date().toISOString();

  const items = data.items.map((item) => ({
    ...item,
    total: calculateItemTotal(item),
  }));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = Math.round(subtotal * (data.taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  const doc: Omit<PresupuestoDoc, "_id"> = {
    number,
    businessLine: data.businessLine,
    clientId: data.clientId,
    salesAgentId: data.salesAgentId
      ? new ObjectId(data.salesAgentId).toString()
      : undefined,
    clientSnapshot: data.clientSnapshot,
    introduction: data.introduction ?? "",
    items,
    subtotal,
    taxRate: data.taxRate,
    taxAmount,
    total,
    notes: data.notes ?? "",
    status: "draft",
    sourceActivityId: data.sourceActivityId
      ? new ObjectId(data.sourceActivityId).toString()
      : undefined,
    pdfDriveFileId: null,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc as unknown as PresupuestoDoc);
  return { _id: result.insertedId.toString(), ...doc };
}

export async function updatePresupuesto(
  id: string,
  data: UpdatePresupuestoInput
): Promise<Presupuesto | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getPresupuestosCollection();
  const now = new Date().toISOString();

  const setFields: Record<string, unknown> = { updatedAt: now };

  if (data.businessLine !== undefined) setFields.businessLine = data.businessLine;
  if (data.clientId !== undefined) setFields.clientId = data.clientId;
  if (data.clientSnapshot !== undefined) setFields.clientSnapshot = data.clientSnapshot;
  if (data.introduction !== undefined) setFields.introduction = data.introduction;
  if (data.notes !== undefined) setFields.notes = data.notes;
  if (data.taxRate !== undefined) setFields.taxRate = data.taxRate;
  if (data.status !== undefined) setFields.status = data.status;
  if (data.sourceActivityId !== undefined) {
    setFields.sourceActivityId = data.sourceActivityId
      ? new ObjectId(data.sourceActivityId).toString()
      : null;
  }
  if (data.salesAgentId !== undefined) {
    setFields.salesAgentId = data.salesAgentId
      ? new ObjectId(data.salesAgentId).toString()
      : null;
  }

  if (data.items) {
    const items = data.items.map((item) => ({
      ...item,
      total: calculateItemTotal(item),
    }));
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = data.taxRate ?? 21;
    const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;
    setFields.items = items;
    setFields.subtotal = subtotal;
    setFields.taxAmount = taxAmount;
    setFields.total = total;
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: setFields },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return toPublic(result as unknown as PresupuestoDoc);
}

export async function deletePresupuesto(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getPresupuestosCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function setPdfDriveFileId(
  id: string,
  pdfDriveFileId: string
): Promise<void> {
  const collection = await getPresupuestosCollection();
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { pdfDriveFileId, updatedAt: new Date().toISOString() } }
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
