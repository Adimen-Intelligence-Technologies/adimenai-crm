import { ObjectId } from "mongodb";
import { getTasksCollection } from "@/lib/db";
import type {
  CreateTaskInput,
  TaskColumn,
  TaskScope,
  UpdateTaskInput,
} from "@/lib/schemas/task";

export type Task = {
  _id: string;
  title: string;
  description?: string;
  scope: TaskScope;
  column: TaskColumn;
  order: number;
  salesAgentId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};

type TaskDoc = Omit<Task, "_id" | "salesAgentId"> & {
  _id: ObjectId;
  salesAgentId?: ObjectId | string;
};

function toTask(doc: TaskDoc): Task {
  const { _id, salesAgentId, ...rest } = doc;
  const result: Task = { _id: _id.toString(), ...rest };
  if (salesAgentId) {
    result.salesAgentId =
      salesAgentId instanceof ObjectId
        ? salesAgentId.toString()
        : String(salesAgentId);
  }
  return result;
}

export async function listTasks(filter: {
  scope?: TaskScope;
  salesAgentId?: string;
  column?: TaskColumn;
} = {}): Promise<Task[]> {
  const collection = await getTasksCollection();
  const query: Record<string, unknown> = {};
  if (filter.scope) query.scope = filter.scope;
  if (filter.salesAgentId && ObjectId.isValid(filter.salesAgentId)) {
    query.salesAgentId = new ObjectId(filter.salesAgentId);
  }
  if (filter.column) query.column = filter.column;
  const docs = (await collection
    .find(query)
    .sort({ column: 1, order: 1, createdAt: 1 })
    .toArray()) as unknown as TaskDoc[];
  return docs.map(toTask);
}

export async function getTask(id: string): Promise<Task | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getTasksCollection();
  const doc = (await collection.findOne({
    _id: new ObjectId(id),
  })) as unknown as TaskDoc | null;
  return doc ? toTask(doc) : null;
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  const collection = await getTasksCollection();
  const now = new Date().toISOString();
  const last = (await collection
    .find({ column: data.column })
    .sort({ order: -1 })
    .limit(1)
    .toArray()) as unknown as TaskDoc[];
  const order = last.length > 0 ? (last[0].order ?? 0) + 1 : 0;
  const doc: Omit<TaskDoc, "_id"> = {
    title: data.title,
    description: data.description ?? "",
    scope: data.scope,
    column: data.column,
    order,
    salesAgentId:
      data.salesAgentId && ObjectId.isValid(data.salesAgentId)
        ? new ObjectId(data.salesAgentId)
        : undefined,
    dueDate: data.dueDate ?? "",
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(doc as unknown as TaskDoc);
  return toTask({ _id: result.insertedId, ...doc });
}

export async function updateTask(
  id: string,
  data: UpdateTaskInput
): Promise<Task | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getTasksCollection();
  const setData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (key === "salesAgentId") {
      if (value && ObjectId.isValid(String(value))) {
        setData.salesAgentId = new ObjectId(String(value));
      } else {
        setData.salesAgentId = null;
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
  return toTask(result as unknown as TaskDoc);
}

export async function deleteTask(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getTasksCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}


