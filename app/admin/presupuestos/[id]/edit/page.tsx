import { notFound } from "next/navigation";
import { getPresupuesto } from "@/lib/repositories/presupuestos";
import { PresupuestoForm } from "@/components/admin/presupuestos/presupuesto-form";

type Params = { params: Promise<{ id: string }> };

export default async function EditarPresupuestoPage({ params }: Params) {
  const { id } = await params;
  const presupuesto = await getPresupuesto(id);
  if (!presupuesto) notFound();

  return <PresupuestoForm mode="edit" initial={presupuesto} />;
}
