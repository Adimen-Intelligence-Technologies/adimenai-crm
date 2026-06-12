import { notFound } from "next/navigation";
import { getSalesAgent } from "@/lib/repositories/sales-agents";
import { SalesAgentForm } from "@/components/admin/sales-agents/sales-agent-form";

export default async function EditSalesAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getSalesAgent(id);
  if (!agent) notFound();
  return <SalesAgentForm mode="edit" initial={agent} />;
}
