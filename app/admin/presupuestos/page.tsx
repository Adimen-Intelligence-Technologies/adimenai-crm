import { Suspense } from "react";
import { listPresupuestos } from "@/lib/repositories/presupuestos";
import { businessLineEnum } from "@/lib/schemas/presupuesto";
import { PresupuestosView } from "@/components/admin/presupuestos/presupuestos-view";

type SearchParams = Promise<{ line?: string; q?: string; page?: string }>;

export default async function PresupuestosPage({
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
  const result = await listPresupuestos({ businessLine, q, page, pageSize: 25 });

  return (
    <Suspense fallback={null}>
      <PresupuestosView result={result} />
    </Suspense>
  );
}
