import { PresupuestoForm } from "@/components/admin/presupuestos/presupuesto-form";

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
    <PresupuestoForm
      mode="create"
      defaultClientId={clientId}
      defaultSalesAgentId={salesAgentId}
      defaultSourceActivityId={fromActivity}
    />
  );
}
