import { listVisitPlans } from "@/lib/repositories/visit-plans";
import { listClients } from "@/lib/repositories/clients";
import { listSalesAgents } from "@/lib/repositories/sales-agents";
import { VisitPlanView } from "@/components/admin/visit-plan/visit-plan-view";

export default async function VisitPlanPage() {
  const [plans, clientsResult, salesAgents] = await Promise.all([
    listVisitPlans(),
    listClients({ pageSize: 999 }),
    listSalesAgents({ isActive: true }),
  ]);

  const clientNameMap: Record<string, string> = {};
  for (const c of clientsResult.items) {
    clientNameMap[c._id] = c.name;
  }

  return (
    <VisitPlanView
      plans={plans}
      clients={clientsResult.items}
      clientNameMap={clientNameMap}
      salesAgents={salesAgents}
    />
  );
}
