import { listServices } from "@/lib/repositories/services";
import { businessLineEnum } from "@/lib/schemas/client";
import { ServicesView } from "@/components/admin/services/services-view";

type SearchParams = Promise<{ line?: string; q?: string; page?: string }>;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { line, q, page: pageStr } = await searchParams;

  let businessLine;
  if (line) {
    const parsed = businessLineEnum.safeParse(line);
    if (parsed.success) businessLine = parsed.data;
  }

  const page = parseInt(pageStr ?? "1", 10) || 1;
  const result = await listServices({ businessLine, q, page, pageSize: 7 });

  return <ServicesView result={result} />;
}
