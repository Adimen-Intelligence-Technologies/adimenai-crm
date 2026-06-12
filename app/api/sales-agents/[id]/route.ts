import { NextResponse, type NextRequest } from "next/server";
import { updateSalesAgentSchema } from "@/lib/schemas/sales-agent";
import {
  deleteSalesAgent,
  getSalesAgent,
  updateSalesAgent,
} from "@/lib/repositories/sales-agents";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const agent = await getSalesAgent(id);
    if (!agent) {
      return NextResponse.json(
        { error: "Comercial no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(agent);
  } catch (err) {
    console.error("GET /api/sales-agents/[id]", err);
    return NextResponse.json(
      { error: "Error al obtener comercial" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSalesAgentSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const detail = firstIssue
        ? `${firstIssue.path.join(".") || "campo"}: ${firstIssue.message}`
        : "Datos inválidos";
      return NextResponse.json(
        { error: detail, issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const patchData: Record<string, unknown> = {};
    for (const key of Object.keys(body)) {
      const val = parsed.data[key as keyof typeof parsed.data];
      if (val !== undefined) patchData[key] = val;
    }
    const agent = await updateSalesAgent(id, patchData);
    if (!agent) {
      return NextResponse.json(
        { error: "Comercial no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(agent);
  } catch (err) {
    console.error("PATCH /api/sales-agents/[id]", err);
    return NextResponse.json(
      { error: "Error al actualizar comercial" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const ok = await deleteSalesAgent(id);
    if (!ok) {
      return NextResponse.json(
        { error: "Comercial no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/sales-agents/[id]", err);
    return NextResponse.json(
      { error: "Error al eliminar comercial" },
      { status: 500 }
    );
  }
}
