import { Suspense } from "react";
import { listDeals } from "@/lib/repositories/deals";
import { listSalesAgents } from "@/lib/repositories/sales-agents";
import { businessLineEnum } from "@/lib/schemas/client";
import { PipelineView } from "@/components/admin/deals/pipeline-view";

type SearchParams = Promise<{
  line?: string;
  agent?: string;
  q?: string;
}>;

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  let businessLine: "adimenai" | "herrikonekt" | "hiopos" | undefined;
  if (params.line) {
    const parsed = businessLineEnum.safeParse(params.line);
    if (parsed.success) businessLine = parsed.data;
  }
  let salesAgentId: string | undefined;
  if (params.agent) {
    salesAgentId = params.agent;
  }
  const [result, salesAgents] = await Promise.all([
    listDeals({
      businessLine,
      salesAgentId,
      q: params.q,
      pageSize: 500,
    }),
    listSalesAgents(),
  ]);

  const salesAgentsById: Record<string, (typeof salesAgents)[number]> = {};
  for (const a of salesAgents) salesAgentsById[a._id] = a;

  return (
    <Suspense fallback={null}>
      <PipelineView
        deals={result.items}
        salesAgents={salesAgents}
        salesAgentsById={salesAgentsById}
        filters={params}
      />
    </Suspense>
  );
}
