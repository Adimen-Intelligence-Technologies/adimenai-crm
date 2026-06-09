import { listTasks } from "@/lib/repositories/tasks";
import { TasksView } from "@/components/admin/tasks/tasks-view";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await listTasks();
  return <TasksView initialTasks={tasks} />;
}
