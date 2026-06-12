import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPresupuesto } from "@/lib/repositories/presupuestos";
import { findActiveDealByPresupuesto } from "@/lib/repositories/deals";
import { findActivityById } from "@/lib/repositories/activities";
import { PresupuestoDetail } from "@/components/admin/presupuestos/presupuesto-detail";

type Params = { params: Promise<{ id: string }> };

export default async function PresupuestoDetailPage({ params }: Params) {
  const { id } = await params;
  const presupuesto = await getPresupuesto(id);
  if (!presupuesto) notFound();

  const [deal, sourceActivity] = await Promise.all([
    findActiveDealByPresupuesto(id),
    presupuesto.sourceActivityId
      ? findActivityById(presupuesto.sourceActivityId)
      : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost" size="sm" className="self-start text-zinc-500 hover:text-zinc-900 sm:self-auto">
          <Link href="/admin/presupuestos">
            <ArrowLeft /> Volver
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="self-start sm:self-auto">
          <Link href={`/admin/presupuestos/${presupuesto._id}/edit`}>
            <Pencil /> Editar
          </Link>
        </Button>
      </div>
      <PresupuestoDetail
        presupuesto={presupuesto}
        linkedDealId={deal?._id}
        sourceActivity={sourceActivity}
      />
    </div>
  );
}
