import { Activity, listActivities } from "@/lib/repositories/activities";
import { listSalesAgents } from "@/lib/repositories/sales-agents";
import { listClients } from "@/lib/repositories/clients";
import { ActivitiesView } from "@/components/admin/activities/activities-view";

type SearchParams = Promise<{
  clientId?: string;
  salesAgentId?: string;
  type?: string;
  outcome?: string;
  pendingNextAction?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: string;
}>;

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10) || 1;

  const [result, salesAgents, allClients] = await Promise.all([
    listActivities({
      clientId: params.clientId,
      salesAgentId: params.salesAgentId,
      type: params.type as Activity["type"] | undefined,
      outcome: params.outcome as Activity["outcome"] | undefined,
      pendingNextAction: params.pendingNextAction === "true",
      from: params.from,
      to: params.to,
      q: params.q,
      page,
      pageSize: 20,
    }),
    listSalesAgents(),
    listClients({ pageSize: 200 }),
  ]);

  const clientNameById: Record<string, string> = {};
  for (const c of allClients.items) clientNameById[c._id] = c.name;
  const salesAgentsById: Record<string, (typeof salesAgents)[number]> = {};
  for (const a of salesAgents) salesAgentsById[a._id] = a;

  return (
    <ActivitiesView
      result={result}
      salesAgents={salesAgents}
      clients={allClients.items}
      salesAgentsById={salesAgentsById}
      clientNameById={clientNameById}
      filters={params}
    />
  );
}
