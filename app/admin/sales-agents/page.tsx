import { listSalesAgents } from "@/lib/repositories/sales-agents";
import { SalesAgentsView } from "@/components/admin/sales-agents/sales-agents-view";

export default async function SalesAgentsPage() {
  const agents = await listSalesAgents();
  return <SalesAgentsView agents={agents} />;
}
