import { ObjectId } from "mongodb";
import { getClientsCollection, getPresupuestosCollection, getTasksCollection } from "@/lib/db";

export type DashboardMetrics = {
  clients: {
    total: number;
    byLine: { adimenai: number; herrikonekt: number; hiopos: number };
    recent: Array<{ _id: string; name: string; businessLine: string; city?: string }>;
    topByTotal: Array<{ _id: string; name: string; businessLine: string; total: number }>;
  };
  presupuestos: {
    total: number;
    byStatus: Record<string, number>;
    totalAmount: number;
    recent: Array<{ _id: string; number: string; title: string; total: number; status: string; businessLine: string }>;
    monthly: Array<{ month: string; label: string; count: number; amount: number }>;
  };
  tasks: {
    total: number;
    open: number;
    done: number;
  };
};

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function buildLast6Months(): Array<{ month: string; label: string }> {
  const out: Array<{ month: string; label: string }> = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ month: m, label: MONTH_LABELS[d.getMonth()] });
  }
  return out;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [clientsCol, presupuestosCol, tasksCol] = await Promise.all([
    getClientsCollection(),
    getPresupuestosCollection(),
    getTasksCollection(),
  ]);

  const [
    clientsTotal,
    adimenaiCount,
    herrikonektCount,
    hioposCount,
    recentClientsRaw,
    topClientsRaw,
  ] = await Promise.all([
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
    clientsCol
      .find({})
      .project<{ name: string; businessLine: string }>({ name: 1, businessLine: 1 })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
  ]);

  const [
    presTotal,
    amountAgg,
    recentPresRaw,
    monthlyRaw,
  ] = await Promise.all([
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
        createdAt: string;
        clientId: string;
      }>({
        number: 1,
        title: 1,
        total: 1,
        status: 1,
        businessLine: 1,
        createdAt: 1,
        clientId: 1,
      })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray(),
    presupuestosCol
      .aggregate<{
        _id: { y: number; m: number };
        count: number;
        amount: number;
      }>([
        {
          $addFields: {
            createdAtDate: {
              $cond: [
                { $eq: [{ $type: "$createdAt" }, "date"] },
                "$createdAt",
                {
                  $cond: [
                    { $eq: [{ $type: "$createdAt" }, "string"] },
                    { $dateFromString: { dateString: "$createdAt", onError: null, onNull: null } },
                    "$createdAt",
                  ],
                },
              ],
            },
          },
        },
        { $match: { createdAtDate: { $ne: null } } },
        {
          $group: {
            _id: { y: { $year: "$createdAtDate" }, m: { $month: "$createdAtDate" } },
            count: { $sum: 1 },
            amount: { $sum: "$total" },
          },
        },
      ])
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

  // Construir serie últimos 6 meses
  const months = buildLast6Months();
  const monthMap = new Map(months.map((m) => [m.month, { count: 0, amount: 0 }]));
  for (const row of monthlyRaw) {
    const key = `${row._id.y}-${String(row._id.m).padStart(2, "0")}`;
    const bucket = monthMap.get(key);
    if (bucket) {
      bucket.count += row.count;
      bucket.amount += row.amount;
    }
  }
  const monthly = months.map((m) => ({
    month: m.month,
    label: m.label,
    count: monthMap.get(m.month)?.count ?? 0,
    amount: monthMap.get(m.month)?.amount ?? 0,
  }));

  // Top clientes por importe total facturado
  const totalsByClient = new Map<string, number>();
  for (const p of recentPresRaw) {
    if (!p.clientId) continue;
    totalsByClient.set(p.clientId, (totalsByClient.get(p.clientId) ?? 0) + (p.total ?? 0));
  }
  const topIds = [...totalsByClient.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  const topClientsDocs = topIds.length
    ? await clientsCol
        .find({ _id: { $in: topIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id)) } })
        .project<{ name: string; businessLine: string }>({ name: 1, businessLine: 1 })
        .toArray()
    : [];
  const clientNameMap = new Map(
    (topClientsDocs as unknown as Array<{ _id: ObjectId; name: string; businessLine: string }>).map(
      (c) => [c._id.toString(), { name: c.name, businessLine: c.businessLine }]
    )
  );
  const topByTotal = topIds
    .map((id) => {
      const c = clientNameMap.get(id);
      if (!c) return null;
      return { _id: id, name: c.name, businessLine: c.businessLine, total: totalsByClient.get(id) ?? 0 };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const recentClients = recentClientsRaw as unknown as Array<{
    _id: ObjectId;
    name: string;
    businessLine: string;
    addresses: { city?: string }[];
  }>;
  const recentPres = recentPresRaw.slice(0, 5) as unknown as Array<{
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
      topByTotal,
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
      monthly,
    },
    tasks: {
      total: tasksTotal,
      open: openTasks,
      done: doneTasks,
    },
  };
}
