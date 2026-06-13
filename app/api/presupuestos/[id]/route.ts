import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { updatePresupuestoSchema } from "@/lib/schemas/presupuesto";
import {
  deletePresupuesto,
  getPresupuesto,
  updatePresupuesto,
} from "@/lib/repositories/presupuestos";
import { getActivitiesCollection } from "@/lib/db";
import {
  findActivityById,
  listActivitiesByClient,
  updateActivity,
} from "@/lib/repositories/activities";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const presupuesto = await getPresupuesto(id);
    if (!presupuesto) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }
    return NextResponse.json(presupuesto);
  } catch (err) {
    console.error("GET /api/presupuestos/[id]", err);
    return NextResponse.json({ error: "Error al obtener presupuesto" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updatePresupuestoSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const detail = firstIssue
        ? `${firstIssue.path.join(".") || "campo"}: ${firstIssue.message}`
        : "Datos inválidos";
      return NextResponse.json({ error: detail, issues: parsed.error.flatten() }, { status: 400 });
    }
    const before = await getPresupuesto(id);
    if (!before) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }

    const presupuesto = await updatePresupuesto(id, parsed.data);
    if (!presupuesto) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }

    let createdActivity: Awaited<ReturnType<typeof findActivityById>> = null;

    // Al pasar a "sent": crear actividad automática de tipo email + vincular visita origen
    if (
      parsed.data.status === "sent" &&
      before.status !== "sent" &&
      ObjectId.isValid(presupuesto._id)
    ) {
      try {
        // ¿Ya existía una actividad email vinculada? (idempotencia)
        const all = await listActivitiesByClient(presupuesto.clientId, 200);
        const existing = all.find(
          (a) => a.linkedPresupuestoId === presupuesto._id && a.type === "email"
        );

        if (!existing) {
          const now = new Date().toISOString();
          const collection = await getActivitiesCollection();
          const newActivityDoc = {
            clientId: new ObjectId(presupuesto.clientId),
            salesAgentId: presupuesto.salesAgentId
              ? new ObjectId(presupuesto.salesAgentId)
              : undefined,
            type: "email",
            occurredAt: now,
            subject: `Presupuesto ${presupuesto.number} enviado`,
            description: `Se ha marcado el presupuesto ${presupuesto.number} como enviado al cliente.`,
            outcome: "positive",
            linkedPresupuestoId: new ObjectId(presupuesto._id),
            createdAt: now,
            updatedAt: now,
          };
          const insert = await collection.insertOne(newActivityDoc);
          createdActivity = {
            _id: insert.insertedId.toString(),
            clientId: presupuesto.clientId,
            salesAgentId: presupuesto.salesAgentId,
            type: "email",
            occurredAt: now,
            subject: newActivityDoc.subject,
            description: newActivityDoc.description,
            outcome: "positive",
            linkedPresupuestoId: presupuesto._id,
            requestQuote: false,
            quoteInProgress: false,
            createdAt: now,
            updatedAt: now,
          };
        } else {
          createdActivity = existing;
        }

        // Vincular la visita origen (si la hay) con el presupuesto
        if (presupuesto.sourceActivityId) {
          await updateActivity(presupuesto.sourceActivityId, {
            linkedPresupuestoId: presupuesto._id,
          });
        }
      } catch (e) {
        console.error("Error creando actividad auto en 'sent':", e);
        // No fallamos el PATCH si la actividad no se crea: el presupuesto se guardó OK
      }
    }

    return NextResponse.json({ presupuesto, createdActivity });
  } catch (err) {
    console.error("PATCH /api/presupuestos/[id]", err);
    return NextResponse.json({ error: "Error al actualizar presupuesto" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const ok = await deletePresupuesto(id);
    if (!ok) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/presupuestos/[id]", err);
    return NextResponse.json({ error: "Error al eliminar presupuesto" }, { status: 500 });
  }
}
