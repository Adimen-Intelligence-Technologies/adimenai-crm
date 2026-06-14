import { NextResponse, type NextRequest } from "next/server";
import { updateVisitPlanSchema } from "@/lib/schemas/visit-plan";
import {
  getVisitPlan,
  updateVisitPlan,
  deleteVisitPlan,
  setActivityId,
} from "@/lib/repositories/visit-plans";
import { createActivity, updateActivity } from "@/lib/repositories/activities";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await getVisitPlan(id);
    if (!plan) {
      return NextResponse.json({ error: "Plan de visita no encontrado" }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (error) {
    console.error("GET /api/visit-plans/[id] error:", error);
    return NextResponse.json({ error: "Error al obtener plan de visita" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateVisitPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await getVisitPlan(id);
    if (!existing) {
      return NextResponse.json({ error: "Plan de visita no encontrado" }, { status: 404 });
    }

    const plan = await updateVisitPlan(id, parsed.data);
    if (!plan) {
      return NextResponse.json({ error: "Error al actualizar plan de visita" }, { status: 500 });
    }

    // Crear actividad si aún no tiene una vinculada
    if (!plan.activityId) {
      const activity = await createActivity({
        clientId: plan.clientId,
        salesAgentId: plan.salesAgentId || "",
        type: plan.type,
        occurredAt: plan.date,
        subject: `Plan visita - ${plan.contactName || "Sin contacto"}`,
        description: plan.observations || "",
        outcome: "pending",
        requestQuote: false,
        linkedPresupuestoId: "",
        linkedPresupuestoIds: [],
        linkedDealId: "",
      });
      await setActivityId(id, activity._id);
      plan.activityId = activity._id;
    }

    // Sync activity fields to linked activity
    if (plan.activityId) {
      const activityUpdate: Record<string, unknown> = {};
      if (parsed.data.outcome !== undefined) activityUpdate.outcome = parsed.data.outcome;
      if (parsed.data.requestQuote !== undefined) activityUpdate.requestQuote = parsed.data.requestQuote;
      if (parsed.data.requestedBusinessLines !== undefined) activityUpdate.requestedBusinessLines = parsed.data.requestedBusinessLines;
      if (parsed.data.nextAction !== undefined) activityUpdate.nextAction = parsed.data.nextAction;
      if (parsed.data.observations !== undefined) activityUpdate.description = parsed.data.observations;
      // Update description from observations
      if (Object.keys(activityUpdate).length > 0) {
        await updateActivity(plan.activityId, activityUpdate);
      }
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("PATCH /api/visit-plans/[id] error:", error);
    return NextResponse.json({ error: "Error al actualizar plan de visita" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await getVisitPlan(id);
    if (!existing) {
      return NextResponse.json({ error: "Plan de visita no encontrado" }, { status: 404 });
    }
    await deleteVisitPlan(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/visit-plans/[id] error:", error);
    return NextResponse.json({ error: "Error al eliminar plan de visita" }, { status: 500 });
  }
}
