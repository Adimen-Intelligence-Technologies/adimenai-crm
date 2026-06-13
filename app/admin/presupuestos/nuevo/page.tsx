import { redirect } from "next/navigation";

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

  const params = new URLSearchParams();
  if (clientId) params.set("clientId", clientId);
  if (salesAgentId) params.set("salesAgentId", salesAgentId);
  if (fromActivity) params.set("fromActivity", fromActivity);
  const suffix = params.toString();

  redirect(`/admin/presupuestos/nuevo/adimenai${suffix ? `?${suffix}` : ""}`);
}
