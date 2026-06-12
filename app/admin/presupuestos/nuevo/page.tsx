import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PresupuestoBusinessLinePicker } from "@/components/admin/presupuestos/presupuesto-business-line-picker";
import { getClient } from "@/lib/repositories/clients";

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

  // Si ya tenemos cliente (vinculado desde una actividad, p.ej.), saltamos
  // el picker y vamos directos al form con la línea del cliente fijada.
  if (clientId) {
    const client = await getClient(clientId);
    if (client) {
      const params = new URLSearchParams();
      params.set("clientId", clientId);
      if (salesAgentId) params.set("salesAgentId", salesAgentId);
      if (fromActivity) params.set("fromActivity", fromActivity);
      redirect(
        `/admin/presupuestos/nuevo/${client.businessLine}?${params.toString()}`
      );
    }
  }

  const hasContext = !!clientId || !!salesAgentId || !!fromActivity;

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
          <p className="text-[11px] font-semibold tracking-[0.06em] text-[#3B1E8A] uppercase">
            Nuevo
          </p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Crear presupuesto
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-pretty text-zinc-500">
            Selecciona la línea de negocio a la que pertenece este presupuesto.
            {hasContext && " El cliente y la visita de origen se conservarán en el siguiente paso."}
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
