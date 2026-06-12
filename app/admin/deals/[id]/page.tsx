import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDeal } from "@/lib/repositories/deals";
import { listSalesAgents } from "@/lib/repositories/sales-agents";
import { listActivitiesByClient } from "@/lib/repositories/activities";
import { DealDetail } from "@/components/admin/deals/deal-detail";

type Params = { params: Promise<{ id: string }> };

export default async function DealDetailPage({ params }: Params) {
  const { id } = await params;
  const [deal, salesAgents] = await Promise.all([
    getDeal(id),
    listSalesAgents(),
  ]);
  if (!deal) notFound();

  const activities = await listActivitiesByClient(deal.clientId, 50);
  const salesAgent = deal.salesAgentId
    ? salesAgents.find((a) => a._id === deal.salesAgentId) ?? null
    : null;

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-zinc-700 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]"
        >
          <Link href="/admin/pipeline">
            <ArrowLeft />
            Volver a Pipeline
          </Link>
        </Button>
        {deal.sourcePresupuestoId && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Link href={`/admin/presupuestos/${deal.sourcePresupuestoId}`}>
              <FileText />
              Ver presupuesto origen
            </Link>
          </Button>
        )}
      </div>
      <DealDetail
        deal={deal}
        salesAgent={salesAgent}
        salesAgents={salesAgents}
        activities={activities}
      />
    </div>
  );
}
