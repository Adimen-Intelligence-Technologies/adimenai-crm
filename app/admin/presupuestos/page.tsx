import { Suspense } from "react";
import { listPresupuestos } from "@/lib/repositories/presupuestos";
import { getActivitiesPendingQuote } from "@/lib/repositories/activities";
import { getClient } from "@/lib/repositories/clients";
import { businessLineEnum } from "@/lib/schemas/presupuesto";
import { PresupuestosView } from "@/components/admin/presupuestos/presupuestos-view";

type SearchParams = Promise<{ line?: string; q?: string; page?: string }>;

export default async function PresupuestosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { line, q, page: pageStr } = await searchParams;

  let businessLine;
  if (line) {
    const parsed = businessLineEnum.safeParse(line);
    if (parsed.success) businessLine = parsed.data;
  }

  const page = parseInt(pageStr ?? "1", 10) || 1;
  const result = await listPresupuestos({ businessLine, q, page, pageSize: 25 });

  const pendingActivities = await getActivitiesPendingQuote();
  const allClientIds = [...new Set(pendingActivities.map((a) => a.clientId))];
  const clients = await Promise.all(allClientIds.map((id) => getClient(id)));
  const clientNameMap: Record<string, string> = {};
  for (const c of clients) {
    if (c) clientNameMap[c._id] = c.name;
  }

  return (
    <Suspense fallback={null}>
      <PresupuestosView result={result} pendingActivities={pendingActivities} clientNameMap={clientNameMap} />
    </Suspense>
  );
}
