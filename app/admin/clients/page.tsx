import { Suspense } from "react";
import { listClients } from "@/lib/repositories/clients";
import { businessLineEnum } from "@/lib/schemas/client";
import { ClientsView } from "@/components/admin/clients/clients-view";

type SearchParams = Promise<{ line?: string; q?: string; type?: string; page?: string }>;

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { line, q, type, page: pageStr } = await searchParams;

  let businessLine;
  if (line) {
    const parsed = businessLineEnum.safeParse(line);
    if (parsed.success) businessLine = parsed.data;
  }

  const page = parseInt(pageStr ?? "1", 10) || 1;
  const result = await listClients({ businessLine, q, type, page, pageSize: 7 });

  return (
    <Suspense fallback={null}>
      <ClientsView result={result} />
    </Suspense>
  );
}
