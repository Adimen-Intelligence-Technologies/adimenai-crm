import { notFound } from "next/navigation";
import { ClientFormHerrikonekt } from "@/components/admin/clients/client-form-herrikonekt";
import { getClient } from "@/lib/repositories/clients";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();
  if (client.businessLine !== "herrikonekt") notFound();

  return <ClientFormHerrikonekt mode="edit" initial={client} />;
}
