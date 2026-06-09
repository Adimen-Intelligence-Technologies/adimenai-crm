import { Suspense } from "react";
import { listClients } from "@/lib/repositories/clients";
import { businessLineEnum } from "@/lib/schemas/client";
import { ClientsView } from "@/components/admin/clients/clients-view";

type SearchParams = Promise<{ line?: string; q?: string }>;

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { line, q } = await searchParams;

  let businessLine;
  if (line) {
    const parsed = businessLineEnum.safeParse(line);
    if (parsed.success) businessLine = parsed.data;
  }

  const clients = await listClients({ businessLine, q });

  return (
    <Suspense fallback={null}>
      <ClientsView clients={clients} />
    </Suspense>
  );
}
