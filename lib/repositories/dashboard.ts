import { ObjectId } from "mongodb";
import { getClientsCollection, getPresupuestosCollection, getTasksCollection } from "@/lib/db";

export type DashboardMetrics = {
  clients: {
    total: number;
    byLine: { adimenai: number; herrikonekt: number; hiopos: number };
    recent: Array<{ _id: string; name: string; businessLine: string; city?: string }>;
  };
  presupuestos: {
    total: number;
    byStatus: Record<string, number>;
    totalAmount: number;
    recent: Array<{ _id: string; number: string; title: string; total: number; status: string; businessLine: string }>;
  };
  tasks: {
    total: number;
    open: number;
    done: number;
  };
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [clientsCol, presupuestosCol, tasksCol] = await Promise.all([
    getClientsCollection(),
    getPresupuestosCollection(),
    getTasksCollection(),
  ]);

  const [clientsTotal, adimenaiCount, herrikonektCount, hioposCount, recentClientsRaw] =
    await Promise.all([
      clientsCol.countDocuments({}),
      clientsCol.countDocuments({ businessLine: "adimenai" }),
      clientsCol.countDocuments({ businessLine: "herrikonekt" }),
      clientsCol.countDocuments({ businessLine: "hiopos" }),
      clientsCol
        .find({})
        .project<{ name: string; businessLine: string; addresses: { city?: string }[] }>({
          name: 1,
          businessLine: 1,
          addresses: 1,
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
    ]);

  const [presTotal, amountAgg, recentPresRaw] = await Promise.all([
    presupuestosCol.countDocuments({}),
    presupuestosCol
      .aggregate<{ _id: null; total: number }>([
        { $group: { _id: null, total: { $sum: "$total" } } },
      ])
      .toArray(),
    presupuestosCol
      .find({})
      .project<{
        number: string;
        title: string;
        total: number;
        status: string;
        businessLine: string;
      }>({
        number: 1,
        title: 1,
        total: 1,
        status: 1,
        businessLine: 1,
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray(),
  ]);

  const [tasksTotal, openTasks, doneTasks] = await Promise.all([
    tasksCol.countDocuments({}),
    tasksCol.countDocuments({ status: { $ne: "done" } }),
    tasksCol.countDocuments({ status: "done" }),
  ]);

  const statusCounts = await presupuestosCol
    .aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    .toArray();

  const byStatus: Record<string, number> = {};
  for (const s of statusCounts) byStatus[s._id] = s.count;

  const recentClients = recentClientsRaw as unknown as Array<{
    _id: ObjectId;
    name: string;
    businessLine: string;
    addresses: { city?: string }[];
  }>;
  const recentPres = recentPresRaw as unknown as Array<{
    _id: ObjectId;
    number: string;
    title: string;
    total: number;
    status: string;
    businessLine: string;
  }>;

  return {
    clients: {
      total: clientsTotal,
      byLine: { adimenai: adimenaiCount, herrikonekt: herrikonektCount, hiopos: hioposCount },
      recent: recentClients.map((c) => ({
        _id: c._id.toString(),
        name: c.name,
        businessLine: c.businessLine,
        city: c.addresses?.find((a) => a.city?.trim())?.city,
      })),
    },
    presupuestos: {
      total: presTotal,
      byStatus,
      totalAmount: amountAgg[0]?.total ?? 0,
      recent: recentPres.map((p) => ({
        _id: p._id.toString(),
        number: p.number,
        title: p.title,
        total: p.total,
        status: p.status,
        businessLine: p.businessLine,
      })),
    },
    tasks: {
      total: tasksTotal,
      open: openTasks,
      done: doneTasks,
    },
  };
}
