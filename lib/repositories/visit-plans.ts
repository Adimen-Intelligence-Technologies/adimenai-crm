import { ObjectId } from "mongodb";
import { getVisitPlansCollection } from "@/lib/db";
import type { CreateVisitPlanInput, UpdateVisitPlanInput } from "@/lib/schemas/visit-plan";

export type VisitPlan = {
  _id: string;
  clientId: string;
  salesAgentId?: string;
  date: string;
  contactName: string;
  address: string;
  type: "visit" | "call" | "whatsapp" | "meeting" | "email" | "note";
  status: "programada" | "confirmada" | "realizada" | "no_disponible" | "reprogramar";
  observations: string;
  businessLine?: string;
  activityId?: string;
  createdAt: string;
  updatedAt: string;
};

type VisitPlanDoc = Omit<VisitPlan, "_id"> & { _id: ObjectId };

function toPublic(doc: Record<string, unknown>): VisitPlan {
  const plain: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(doc)) {
    if (value instanceof ObjectId) {
      plain[key] = value.toString();
    } else {
      plain[key] = value;
    }
  }
  return plain as unknown as VisitPlan;
}

export async function listVisitPlans(filter: {
  status?: string;
  salesAgentId?: string;
  clientId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): Promise<VisitPlan[]> {
  const collection = await getVisitPlansCollection();
  const query: Record<string, unknown> = {};
  if (filter.status) query.status = filter.status;
  if (filter.salesAgentId) query.salesAgentId = filter.salesAgentId;
  if (filter.clientId) query.clientId = filter.clientId;
  if (filter.type) query.type = filter.type;
  if (filter.dateFrom || filter.dateTo) {
    const dateQuery: Record<string, unknown> = {};
    if (filter.dateFrom) dateQuery.$gte = filter.dateFrom;
    if (filter.dateTo) dateQuery.$lte = filter.dateTo;
    query.date = dateQuery;
  }
  const docs = (await collection
    .find(query)
    .sort({ date: -1 })
    .toArray()) as unknown as VisitPlanDoc[];
  return docs.map(toPublic);
}

export async function getVisitPlan(id: string): Promise<VisitPlan | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getVisitPlansCollection();
  const doc = (await collection.findOne({ _id: new ObjectId(id) })) as unknown as VisitPlanDoc | null;
  return doc ? toPublic(doc) : null;
}

export async function createVisitPlan(data: CreateVisitPlanInput): Promise<VisitPlan> {
  const collection = await getVisitPlansCollection();
  const now = new Date().toISOString();
  const doc: Omit<VisitPlanDoc, "_id"> = {
    clientId: data.clientId,
    salesAgentId: data.salesAgentId || undefined,
    date: data.date,
    contactName: data.contactName ?? "",
    address: data.address ?? "",
    type: data.type,
    status: data.status ?? "programada",
    observations: data.observations ?? "",
    businessLine: data.businessLine,
    activityId: undefined,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(doc as VisitPlanDoc);
  return { _id: result.insertedId.toString(), ...doc };
}

export async function updateVisitPlan(
  id: string,
  data: UpdateVisitPlanInput
): Promise<VisitPlan | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getVisitPlansCollection();
  const now = new Date().toISOString();
  const setFields: Record<string, unknown> = { updatedAt: now };
  if (data.clientId !== undefined) setFields.clientId = data.clientId;
  if (data.salesAgentId !== undefined) setFields.salesAgentId = data.salesAgentId || null;
  if (data.date !== undefined) setFields.date = data.date;
  if (data.contactName !== undefined) setFields.contactName = data.contactName;
  if (data.address !== undefined) setFields.address = data.address;
  if (data.type !== undefined) setFields.type = data.type;
  if (data.status !== undefined) setFields.status = data.status;
  if (data.observations !== undefined) setFields.observations = data.observations;
  if (data.businessLine !== undefined) setFields.businessLine = data.businessLine;

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: setFields },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return toPublic(result as unknown as VisitPlanDoc);
}

export async function deleteVisitPlan(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getVisitPlansCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function setActivityId(id: string, activityId: string): Promise<void> {
  const collection = await getVisitPlansCollection();
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { activityId, updatedAt: new Date().toISOString() } }
  );
}
