import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteClientButton } from "@/components/admin/clients/delete-client-button";
import { ClientDetailTabs } from "@/components/admin/clients/client-detail-tabs";
import { getClient } from "@/lib/repositories/clients";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-end gap-2">
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
      <ClientDetailTabs client={client} />
    </div>
  );
}
