import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { businessLineEnum, type BusinessLine } from "@/lib/schemas/client";
import { businessLineLabels, businessLinePrefix } from "@/lib/schemas/presupuesto";
import { PresupuestoForm } from "@/components/admin/presupuestos/presupuesto-form";
import { Button } from "@/components/ui/button";

type Params = Promise<{ line: string }>;
type SearchParams = Promise<{
  clientId?: string;
  salesAgentId?: string;
  fromActivity?: string;
}>;

export default async function NuevoPresupuestoByLinePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { line } = await params;
  const parsed = businessLineEnum.safeParse(line);
  if (!parsed.success) notFound();
  const businessLine: BusinessLine = parsed.data;

  const { clientId, salesAgentId, fromActivity } = await searchParams;

  return (
    <div className="flex animate-fade-in flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-zinc-500 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]"
        >
          <Link href={`/admin/presupuestos/nuevo${clientId ? `?clientId=${clientId}${salesAgentId ? `&salesAgentId=${salesAgentId}` : ""}${fromActivity ? `&fromActivity=${fromActivity}` : ""}` : ""}`}>
            <ArrowLeft />
            Volver a elegir línea
          </Link>
        </Button>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.06em] text-[#3B1E8A] uppercase">
            Nuevo · {businessLinePrefix[businessLine]} · {businessLineLabels[businessLine]}
          </p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Crear presupuesto
          </h1>
        </div>
      </div>
      <PresupuestoForm
        mode="create"
        fixedBusinessLine={businessLine}
        defaultClientId={clientId}
        defaultSalesAgentId={salesAgentId}
        defaultSourceActivityId={fromActivity}
      />
    </div>
  );
}
