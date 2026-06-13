import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPresupuesto } from "@/lib/repositories/presupuestos";
import { findActivityById } from "@/lib/repositories/activities";
import { PresupuestoDetail } from "@/components/admin/presupuestos/presupuesto-detail";

type Params = { params: Promise<{ id: string }> };

export default async function PresupuestoDetailPage({ params }: Params) {
  const { id } = await params;
  const presupuesto = await getPresupuesto(id);
  if (!presupuesto) notFound();

  const sourceActivity = presupuesto.sourceActivityId
    ? await findActivityById(presupuesto.sourceActivityId)
    : null;

  return (
    <div className="flex animate-fade-in flex-col gap-4">
      {/* Breadcrumb + acción */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-1.5 text-[12px] text-zinc-500">
          <Link
            href="/admin/presupuestos"
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ArrowLeft className="size-3.5" />
            Presupuestos
          </Link>
          <span>/</span>
          <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono font-semibold text-zinc-900">
            {presupuesto.number}
          </span>
        </nav>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="self-start sm:self-auto"
        >
          <Link href={`/admin/presupuestos/${presupuesto._id}/edit`}>
            <Pencil />
            Editar
          </Link>
        </Button>
      </div>

      <PresupuestoDetail
        presupuesto={presupuesto}
        sourceActivity={sourceActivity}
      />
    </div>
  );
}
