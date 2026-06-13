import { ArrowLeft, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { PresupuestoForm } from "@/components/admin/presupuestos/presupuesto-form";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<{
  clientId?: string;
  salesAgentId?: string;
  fromActivity?: string;
}>;

export default async function NuevoPresupuestoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { clientId, salesAgentId, fromActivity } = await searchParams;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm" className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
          <Link href="/admin/presupuestos"><ChevronLeft /></Link>
        </Button>
        <h1 className="text-base font-semibold text-zinc-900">Nuevo presupuesto</h1>
      </div>
      <PresupuestoForm
        mode="create"
        defaultClientId={clientId}
        defaultSalesAgentId={salesAgentId}
        defaultSourceActivityId={fromActivity}
      />
    </div>
  );
}
