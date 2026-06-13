import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PresupuestoBusinessLinePicker } from "@/components/admin/presupuestos/presupuesto-business-line-picker";

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
    <div className="flex animate-fade-in flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-zinc-500 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]"
        >
          <Link href="/admin/presupuestos">
            <ArrowLeft />
            Volver a Presupuestos
          </Link>
        </Button>
        <div>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Nuevo presupuesto
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Selecciona la línea de negocio para el presupuesto.
          </p>
        </div>
      </div>
      <PresupuestoBusinessLinePicker
        clientId={clientId}
        salesAgentId={salesAgentId}
        fromActivity={fromActivity}
      />
    </div>
  );
}
