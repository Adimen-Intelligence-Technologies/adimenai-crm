import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BusinessLinePicker } from "@/components/admin/clients/business-line-picker";
import { Button } from "@/components/ui/button";

export default function NewClientPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          aria-label="Volver"
          className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <Link href="/admin/clients">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Nuevo cliente</h1>
          <p className="text-sm text-zinc-500">
            Selecciona la línea de negocio a la que pertenece este cliente.
          </p>
        </div>
      </div>
      <BusinessLinePicker />
    </div>
  );
}
