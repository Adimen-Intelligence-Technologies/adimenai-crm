import { PresupuestoForm } from "@/components/admin/presupuestos/presupuesto-form";

type Params = Promise<{ line: string }>;
type SearchParams = Promise<{
  clientId?: string;
  salesAgentId?: string;
  fromActivity?: string;
}>;

export default async function NuevoPresupuestoPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { line } = await params;
  const { clientId, salesAgentId, fromActivity } = await searchParams;

  return (
    <PresupuestoForm
      mode="create"
      defaultClientId={clientId}
      defaultSalesAgentId={salesAgentId}
      defaultSourceActivityId={fromActivity}
      defaultBusinessLine={line}
    />
  );
}
