import { Suspense } from "react";
import { listPresupuestos, getPresupuesto } from "@/lib/repositories/presupuestos";
import { getActivitiesPendingQuote } from "@/lib/repositories/activities";
import { getClient } from "@/lib/repositories/clients";
import { businessLineEnum, type BusinessLine } from "@/lib/schemas/presupuesto";
import { PresupuestosView } from "@/components/admin/presupuestos/presupuestos-view";

type SearchParams = Promise<{ line?: string; q?: string; page?: string }>;

export type PendingPresupuestoLine = {
  activityId: string;
  activitySubject: string;
  activityOccurredAt: string;
  clientId: string;
  businessLine: BusinessLine;
};

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

  const pendingLines: PendingPresupuestoLine[] = [];
  for (const a of pendingActivities) {
    const linkedIds = a.linkedPresupuestoIds ?? [];
    const linkedPresupuestos = await Promise.all(
      linkedIds.map((id) => getPresupuesto(id))
    );
    const coveredLines = new Set(
      linkedPresupuestos
        .filter((p): p is NonNullable<typeof p> => p !== null)
        .flatMap((p) => p.businessLines)
    );
    const requested = a.requestedBusinessLines ?? [];
    for (const bl of requested) {
      if (!coveredLines.has(bl)) {
        pendingLines.push({
          activityId: a._id,
          activitySubject: a.subject,
          activityOccurredAt: a.occurredAt,
          clientId: a.clientId,
          businessLine: bl,
        });
      }
    }
  }

  return (
    <Suspense fallback={null}>
      <PresupuestosView result={result} pendingLines={pendingLines} clientNameMap={clientNameMap} />
    </Suspense>
  );
}
