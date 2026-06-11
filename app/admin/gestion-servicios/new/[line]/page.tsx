import { notFound } from "next/navigation";
import { businessLineEnum, type BusinessLine } from "@/lib/schemas/client";
import { ServiceForm } from "@/components/admin/services/service-form";

type Params = Promise<{ line: string }>;

export default async function NewServiceByLinePage({ params }: { params: Params }) {
  const { line } = await params;
  const parsed = businessLineEnum.safeParse(line);
  if (!parsed.success) notFound();
  const businessLine: BusinessLine = parsed.data;

  return <ServiceForm mode="create" fixedBusinessLine={businessLine} />;
}
