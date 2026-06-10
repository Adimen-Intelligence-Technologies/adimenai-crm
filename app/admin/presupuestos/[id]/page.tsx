import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPresupuesto } from "@/lib/repositories/presupuestos";
import { PresupuestoDetail } from "@/components/admin/presupuestos/presupuesto-detail";

type Params = { params: Promise<{ id: string }> };

export default async function PresupuestoDetailPage({ params }: Params) {
  const { id } = await params;
  const presupuesto = await getPresupuesto(id);
  if (!presupuesto) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-end gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={`/admin/presupuestos/${presupuesto._id}/edit`}>
            <Pencil /> Editar
          </Link>
        </Button>
      </div>
      <PresupuestoDetail presupuesto={presupuesto} />
    </div>
  );
}
