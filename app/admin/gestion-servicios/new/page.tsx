import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ServiceBusinessLinePicker } from "@/components/admin/services/service-business-line-picker";
import { Button } from "@/components/ui/button";

export default function NewServicePage() {
  return (
    <div className="flex animate-fade-in flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-zinc-500 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]"
        >
          <Link href="/admin/gestion-servicios">
            <ArrowLeft />
            Volver a Servicios
          </Link>
        </Button>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.06em] text-[#3B1E8A] uppercase">
            Nuevo
          </p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Crear servicio
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-pretty text-zinc-500">
            Selecciona la línea de negocio a la que pertenece este servicio.
          </p>
        </div>
      </div>
      <ServiceBusinessLinePicker />
    </div>
  );
}
