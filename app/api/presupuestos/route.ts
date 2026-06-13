import { NextResponse, type NextRequest } from "next/server";
import { businessLineEnum, createPresupuestoSchema } from "@/lib/schemas/presupuesto";
import { createPresupuesto, listPresupuestos } from "@/lib/repositories/presupuestos";
import { updateActivity } from "@/lib/repositories/activities";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLine = searchParams.get("businessLine");
    const q = searchParams.get("q") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
    const pageSize = parseInt(searchParams.get("pageSize") ?? "25", 10) || 25;

    let businessLine;
    if (rawLine) {
      const parsed = businessLineEnum.safeParse(rawLine);
      if (!parsed.success) {
        return NextResponse.json({ error: "businessLine inválido" }, { status: 400 });
      }
      businessLine = parsed.data;
    }

    const result = await listPresupuestos({ businessLine, q, page, pageSize });
    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/presupuestos", err);
    return NextResponse.json({ error: "Error al listar presupuestos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createPresupuestoSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const detail = firstIssue
        ? `${firstIssue.path.join(".") || "campo"}: ${firstIssue.message}`
        : "Datos inválidos";
      return NextResponse.json({ error: detail, issues: parsed.error.flatten() }, { status: 400 });
    }
    const presupuesto = await createPresupuesto(parsed.data);

    // Si el presupuesto nace de una actividad, la vinculamos para que la
    // timeline muestre el chip "Origen del presupuesto" y oculte el CTA
    // "Generar presupuesto" (que ya no aplica).
    if (presupuesto.sourceActivityId) {
      try {
        await updateActivity(presupuesto.sourceActivityId, {
          linkedPresupuestoId: presupuesto._id,
          quoteInProgress: false,
        });
      } catch (e) {
        console.error("No se pudo vincular la actividad origen:", e);
        // No fallamos el POST: el presupuesto se guardó OK.
      }
    }

    return NextResponse.json(presupuesto, { status: 201 });
  } catch (err) {
    console.error("POST /api/presupuestos", err);
    return NextResponse.json({ error: "Error al crear presupuesto" }, { status: 500 });
  }
}
