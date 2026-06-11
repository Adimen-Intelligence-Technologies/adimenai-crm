import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BusinessLinePicker } from "@/components/admin/clients/business-line-picker";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";

export default function NewClientPage() {
  return (
    <div className="mx-auto flex max-w-4xl animate-fade-in flex-col gap-8">
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <Link href="/admin/clients">
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        </Button>
        <PageHeader
          title="Nuevo cliente"
          description="Selecciona la línea de negocio a la que pertenece este cliente."
        />
      </div>
      <BusinessLinePicker />
    </div>
  );
}
