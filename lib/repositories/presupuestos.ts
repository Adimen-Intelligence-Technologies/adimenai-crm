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
  businessLines: BusinessLine[];
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
    billing: "one_time" | "monthly" | "yearly";
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

function toPublic(doc: Record<string, unknown>): Presupuesto {
  const plain: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(doc)) {
    if (value instanceof ObjectId) {
      plain[key] = value.toString();
    } else {
      plain[key] = value;
    }
  }
  return plain as unknown as Presupuesto;
}

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

async function getNextNumber(): Promise<string> {
  const collection = await getPresupuestosCollection();
  const prefix = "A";

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
  if (filter.businessLine) query.businessLines = filter.businessLine;
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
  const number = await getNextNumber();
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
    businessLines: data.businessLines,
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

  if (data.businessLines !== undefined) setFields.businessLines = data.businessLines;
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

export async function createPresupuestoFromActivity(
  activityId: string,
  businessLine: string
): Promise<Presupuesto> {
  const { getActivity, updateActivity } = await import("@/lib/repositories/activities");
  const { getClient } = await import("@/lib/repositories/clients");

  const activity = await getActivity(activityId);
  if (!activity) throw new Error("Actividad no encontrada");

  const client = await getClient(activity.clientId);
  if (!client) throw new Error("Cliente no encontrado");

  const primaryAddr = client.addresses?.find((a) => a.isPrimary) ?? client.addresses?.[0];
  const addressStr = primaryAddr
    ? `${primaryAddr.line1}${primaryAddr.line2 ? `, ${primaryAddr.line2}` : ""}${primaryAddr.city ? `, ${primaryAddr.city}` : ""}`
    : "";

  const presupuesto = await createPresupuesto({
    businessLines: [businessLine as "adimenai" | "herrikonekt" | "hiopos"],
    clientId: activity.clientId,
    clientSnapshot: {
      name: client.name,
      nif: client.billing?.taxId ?? "",
      address: addressStr,
      email: client.email ?? "",
      phone: client.phones?.[0] ?? "",
    },
    introduction: "",
    items: [{ title: "(Pendiente)", quantity: 1, unitPrice: 0, billing: "one_time", total: 0 }],
    taxRate: 21,
    notes: "",
    sourceActivityId: activityId,
    salesAgentId: activity.salesAgentId ?? "",
  });

  const allIds = [...new Set([...(activity.linkedPresupuestoIds ?? []), presupuesto._id])];
  await updateActivity(activityId, {
    linkedPresupuestoId: presupuesto._id,
    linkedPresupuestoIds: allIds,
    quoteInProgress: false,
  });

  return presupuesto;
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
