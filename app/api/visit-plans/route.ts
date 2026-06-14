import { NextResponse, type NextRequest } from "next/server";
import { createVisitPlanSchema, visitPlanStatusEnum } from "@/lib/schemas/visit-plan";
import {
  createVisitPlan,
  listVisitPlans,
  setActivityId,
} from "@/lib/repositories/visit-plans";
import { createActivity } from "@/lib/repositories/activities";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter: {
      status?: string;
      salesAgentId?: string;
      clientId?: string;
      type?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {};
    const rawStatus = searchParams.get("status");
    if (rawStatus) {
      const parsed = visitPlanStatusEnum.safeParse(rawStatus);
      if (!parsed.success) {
        return NextResponse.json({ error: "status inválido" }, { status: 400 });
      }
      filter.status = parsed.data;
    }
    const rawType = searchParams.get("type");
    if (rawType) filter.type = rawType;
    const rawAgent = searchParams.get("salesAgentId");
    if (rawAgent) filter.salesAgentId = rawAgent;
    const rawClient = searchParams.get("clientId");
    if (rawClient) filter.clientId = rawClient;
    const dateFrom = searchParams.get("dateFrom") ?? undefined;
    if (dateFrom) filter.dateFrom = dateFrom;
    const dateTo = searchParams.get("dateTo") ?? undefined;
    if (dateTo) filter.dateTo = dateTo;

    const plans = await listVisitPlans(filter);
    return NextResponse.json(plans);
  } catch (error) {
    console.error("GET /api/visit-plans error:", error);
    return NextResponse.json({ error: "Error al cargar plan de visitas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createVisitPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const plan = await createVisitPlan(data);

    const activity = await createActivity({
      clientId: data.clientId,
      salesAgentId: data.salesAgentId || "",
      type: data.type,
      occurredAt: data.date,
      subject: `Plan visita - ${data.contactName || "Sin contacto"}`,
      description: data.observations || "",
      outcome: "pending",
      requestQuote: false,
      linkedPresupuestoId: "",
      linkedPresupuestoIds: [],
      linkedDealId: "",
    });
    await setActivityId(plan._id, activity._id);
    plan.activityId = activity._id;

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("POST /api/visit-plans error:", error);
    return NextResponse.json({ error: "Error al crear plan de visita" }, { status: 500 });
  }
}
