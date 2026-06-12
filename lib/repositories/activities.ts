import { ObjectId } from "mongodb";
import { getActivitiesCollection } from "@/lib/db";
import type {
  CreateActivityInput,
  NextActionType,
  ActivityOutcome,
  ActivityType,
} from "@/lib/schemas/activity";

export type NextAction = {
  type: NextActionType;
  dueDate: string;
  notes: string;
  done: boolean;
};

export type Activity = {
  _id: string;
  clientId: string;
  salesAgentId?: string;
  type: ActivityType;
  occurredAt: string;
  subject: string;
  description: string;
  outcome: ActivityOutcome;
  nextAction?: NextAction;
  linkedPresupuestoId?: string;
  linkedDealId?: string;
  createdAt: string;
  updatedAt: string;
};

type ActivityDoc = Omit<Activity, "_id"> & { _id: ObjectId };

function toActivity(doc: ActivityDoc): Activity {
  const { _id, ...rest } = doc;
  return { _id: _id.toString(), ...rest };
}

export type ListActivitiesFilter = {
  clientId?: string;
  salesAgentId?: string;
  type?: ActivityType;
  outcome?: ActivityOutcome;
  from?: string;
  to?: string;
  pendingNextAction?: boolean;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listActivities(
  filter: ListActivitiesFilter = {}
): Promise<PaginatedResult<Activity>> {
  const collection = await getActivitiesCollection();
  const query: Record<string, unknown> = {};
  if (filter.clientId && ObjectId.isValid(filter.clientId)) {
    query.clientId = new ObjectId(filter.clientId);
  }
  if (filter.salesAgentId && ObjectId.isValid(filter.salesAgentId)) {
    query.salesAgentId = new ObjectId(filter.salesAgentId);
  }
  if (filter.type) query.type = filter.type;
  if (filter.outcome) query.outcome = filter.outcome;
  if (filter.from || filter.to) {
    const range: Record<string, Date> = {};
    if (filter.from) range.$gte = new Date(filter.from);
    if (filter.to) range.$lte = new Date(filter.to);
    query.occurredAt = range;
  }
  if (filter.pendingNextAction) {
    query["nextAction.done"] = false;
  }
  if (filter.q && filter.q.trim()) {
    const rx = new RegExp(escapeRegex(filter.q.trim()), "i");
    query.$or = [{ subject: rx }, { description: rx }];
  }
  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? 20;
  const total = await collection.countDocuments(query);
  const docs = (await collection
    .find(query)
    .sort({ occurredAt: -1, createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray()) as unknown as ActivityDoc[];
  return {
    items: docs.map(toActivity),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getActivity(id: string): Promise<Activity | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getActivitiesCollection();
  const doc = (await collection.findOne({
    _id: new ObjectId(id),
  })) as unknown as ActivityDoc | null;
  return doc ? toActivity(doc) : null;
}

export async function listActivitiesByClient(
  clientId: string,
  limit = 100
): Promise<Activity[]> {
  if (!ObjectId.isValid(clientId)) return [];
  const collection = await getActivitiesCollection();
  const docs = (await collection
    .find({ clientId: new ObjectId(clientId) })
    .sort({ occurredAt: -1, createdAt: -1 })
    .limit(limit)
    .toArray()) as unknown as ActivityDoc[];
  return docs.map(toActivity);
}

export async function findActivityById(
  id: string
): Promise<Activity | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getActivitiesCollection();
  const doc = (await collection.findOne({
    _id: new ObjectId(id),
  })) as unknown as ActivityDoc | null;
  return doc ? toActivity(doc) : null;
}

export async function listRecentVisitsByClient(
  clientId: string,
  options: { salesAgentId?: string; withinHours?: number; limit?: number } = {}
): Promise<Activity[]> {
  if (!ObjectId.isValid(clientId)) return [];
  const collection = await getActivitiesCollection();
  const withinHours = options.withinHours ?? 24;
  const since = new Date(Date.now() - withinHours * 60 * 60 * 1000);
  const query: Record<string, unknown> = {
    clientId: new ObjectId(clientId),
    type: "visit",
    occurredAt: { $gte: since.toISOString() },
  };
  if (options.salesAgentId && ObjectId.isValid(options.salesAgentId)) {
    query.salesAgentId = new ObjectId(options.salesAgentId);
  }
  const docs = (await collection
    .find(query)
    .sort({ occurredAt: -1 })
    .limit(options.limit ?? 5)
    .toArray()) as unknown as ActivityDoc[];
  return docs.map(toActivity);
}

export async function findVisitBySourcePresupuesto(
  presupuestoId: string
): Promise<Activity | null> {
  if (!ObjectId.isValid(presupuestoId)) return null;
  const collection = await getActivitiesCollection();
  const doc = (await collection.findOne({
    sourceActivityId: new ObjectId(presupuestoId),
  })) as unknown as ActivityDoc | null;
  return doc ? toActivity(doc) : null;
}

export async function listUpcomingNextActions(
  options: { salesAgentId?: string; limit?: number } = {}
): Promise<Activity[]> {
  const collection = await getActivitiesCollection();
  const query: Record<string, unknown> = {
    "nextAction.done": false,
    "nextAction.dueDate": { $ne: "" },
  };
  if (options.salesAgentId && ObjectId.isValid(options.salesAgentId)) {
    query.salesAgentId = new ObjectId(options.salesAgentId);
  }
  const docs = (await collection
    .find(query)
    .sort({ "nextAction.dueDate": 1 })
    .limit(options.limit ?? 10)
    .toArray()) as unknown as ActivityDoc[];
  return docs.map(toActivity);
}

export async function createActivity(
  data: CreateActivityInput
): Promise<Activity> {
  const collection = await getActivitiesCollection();
  const now = new Date().toISOString();
  const doc: Omit<ActivityDoc, "_id"> = {
    clientId: data.clientId,
    salesAgentId: data.salesAgentId
      ? new ObjectId(data.salesAgentId).toString()
      : undefined,
    type: data.type,
    occurredAt: data.occurredAt,
    subject: data.subject.trim(),
    description: data.description ?? "",
    outcome: data.outcome,
    nextAction: data.nextAction
      ? {
          type: data.nextAction.type,
          dueDate: data.nextAction.dueDate ?? "",
          notes: data.nextAction.notes ?? "",
          done: data.nextAction.done,
        }
      : undefined,
    linkedPresupuestoId: data.linkedPresupuestoId
      ? new ObjectId(data.linkedPresupuestoId).toString()
      : undefined,
    linkedDealId: data.linkedDealId
      ? new ObjectId(data.linkedDealId).toString()
      : undefined,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(doc as unknown as ActivityDoc);
  return toActivity({ _id: result.insertedId, ...doc });
}

export async function updateActivity(
  id: string,
  data: Record<string, unknown>
): Promise<Activity | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getActivitiesCollection();
  const setData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (key === "clientId" || key === "salesAgentId" || key === "linkedPresupuestoId" || key === "linkedDealId") {
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
  return toActivity(result as unknown as ActivityDoc);
}

export async function markNextActionDone(
  id: string,
  done: boolean
): Promise<Activity | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getActivitiesCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        "nextAction.done": done,
        updatedAt: new Date().toISOString(),
      },
    },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return toActivity(result as unknown as ActivityDoc);
}

export async function deleteActivity(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getActivitiesCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
