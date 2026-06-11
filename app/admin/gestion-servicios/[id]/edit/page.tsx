import { notFound } from "next/navigation";
import { getService } from "@/lib/repositories/services";
import { ServiceForm } from "@/components/admin/services/service-form";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();

  return <ServiceForm mode="edit" initial={service} />;
}
