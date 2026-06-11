import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BusinessLinePicker } from "@/components/admin/clients/business-line-picker";
import { Button } from "@/components/ui/button";

export default function NewClientPage() {
  return (
    <div className="flex animate-fade-in flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-zinc-500 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]"
        >
          <Link href="/admin/clients">
            <ArrowLeft />
            Volver a Contactos
          </Link>
        </Button>
        <div>
          
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Crear cliente
          </h1>
         
        </div>
      </div>
      <BusinessLinePicker />
    </div>
  );
}
