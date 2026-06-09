import { ObjectId } from "mongodb";
import { getTasksCollection } from "@/lib/db";
import type {
  CreateTaskInput,
  TaskAssignee,
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
  assignee: TaskAssignee;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};

type TaskDoc = Omit<Task, "_id"> & { _id: ObjectId };

function toTask(doc: TaskDoc): Task {
  const { _id, ...rest } = doc;
  return { _id: _id.toString(), ...rest };
}

export async function listTasks(filter: {
  scope?: TaskScope;
  assignee?: TaskAssignee;
  column?: TaskColumn;
} = {}): Promise<Task[]> {
  const collection = await getTasksCollection();
  const query: Record<string, unknown> = {};
  if (filter.scope) query.scope = filter.scope;
  if (filter.assignee) query.assignee = filter.assignee;
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
    assignee: data.assignee,
    dueDate: data.dueDate ?? "",
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(doc as unknown as TaskDoc);
  return { _id: result.insertedId.toString(), ...doc };
}

export async function updateTask(
  id: string,
  data: UpdateTaskInput
): Promise<Task | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getTasksCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date().toISOString() } },
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

/**
 * Mueve una tarea a una columna y posición concretas.
 * - Reordena el resto de las tareas afectadas para mantener `order` consistente.
 * - Devuelve la tarea ya actualizada junto con todas las tareas afectadas, para que
 *   la UI pueda sincronizar el estado sin recargar.
 */
export async function moveTask(
  id: string,
  targetColumn: TaskColumn,
  targetOrder: number
): Promise<{ moved: Task; affected: Task[] } | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getTasksCollection();
  const now = new Date().toISOString();

  const current = (await collection.findOne({
    _id: new ObjectId(id),
  })) as unknown as TaskDoc | null;
  if (!current) return null;

  const fromColumn = current.column;
  const fromOrder = current.order;
  const toColumn = targetColumn;
  const toOrder = targetOrder;

  // 1. Quitar de la columna origen (compactar)
  await collection.updateMany(
    {
      column: fromColumn,
      order: { $gt: fromOrder },
      _id: { $ne: current._id },
    },
    { $inc: { order: -1 } }
  );

  // 2. Hacer hueco en la columna destino (apartar)
  await collection.updateMany(
    {
      column: toColumn,
      order: { $gte: toOrder },
      _id: { $ne: current._id },
    },
    { $inc: { order: 1 } }
  );

  // 3. Colocar la tarea en su nueva posición
  const result = await collection.findOneAndUpdate(
    { _id: current._id },
    { $set: { column: toColumn, order: toOrder, updatedAt: now } },
    { returnDocument: "after" }
  );
  if (!result) return null;

  // 4. Devolver todas las tareas afectadas (las de las dos columnas tocadas) para
  //    que el cliente pueda sincronizar sin tener que recargar la página.
  const affectedDocs = (await collection
    .find({ column: { $in: [fromColumn, toColumn] } })
    .sort({ column: 1, order: 1, createdAt: 1 })
    .toArray()) as unknown as TaskDoc[];

  return {
    moved: toTask(result as unknown as TaskDoc),
    affected: affectedDocs.map(toTask),
  };
}
