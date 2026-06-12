import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPresupuesto } from "@/lib/repositories/presupuestos";
import { findActiveDealByPresupuesto } from "@/lib/repositories/deals";
import { PresupuestoDetail } from "@/components/admin/presupuestos/presupuesto-detail";

type Params = { params: Promise<{ id: string }> };

export default async function PresupuestoDetailPage({ params }: Params) {
  const { id } = await params;
  const presupuesto = await getPresupuesto(id);
  if (!presupuesto) notFound();

  const deal = await findActiveDealByPresupuesto(id);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900">
          <Link href="/admin/presupuestos">
            <ArrowLeft /> Volver
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/presupuestos/${presupuesto._id}/edit`}>
            <Pencil /> Editar
          </Link>
        </Button>
      </div>
      <PresupuestoDetail
        presupuesto={presupuesto}
        linkedDealId={deal?._id}
      />
    </div>
  );
}
