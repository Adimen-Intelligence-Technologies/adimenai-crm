import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteClientButton } from "@/components/admin/clients/delete-client-button";
import { ClientDetailTabs } from "@/components/admin/clients/client-detail-tabs";
import { getClient } from "@/lib/repositories/clients";
import { listSalesAgents } from "@/lib/repositories/sales-agents";
import { listActivitiesByClient } from "@/lib/repositories/activities";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, salesAgents, activities] = await Promise.all([
    getClient(id),
    listSalesAgents(),
    listActivitiesByClient(id, 50),
  ]);
  if (!client) notFound();

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="self-start text-zinc-700 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A] sm:self-auto"
        >
          <Link href="/admin/clients">
            <ArrowLeft />
            Volver a Contactos
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Link href={`/admin/clients/${client._id}/edit`}>
              <Pencil />
              Editar
            </Link>
          </Button>
          <DeleteClientButton id={client._id} name={client.name} />
        </div>
      </div>
      <ClientDetailTabs
        client={client}
        salesAgents={salesAgents}
        activities={activities}
      />
    </div>
  );
}
