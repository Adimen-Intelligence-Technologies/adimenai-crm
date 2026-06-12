import { NextResponse, type NextRequest } from "next/server";
import { updateDealSchema } from "@/lib/schemas/deal";
import { deleteDeal, getDeal, updateDeal } from "@/lib/repositories/deals";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const deal = await getDeal(id);
    if (!deal) {
      return NextResponse.json(
        { error: "Oportunidad no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(deal);
  } catch (err) {
    console.error("GET /api/deals/[id]", err);
    return NextResponse.json(
      { error: "Error al obtener la oportunidad" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateDealSchema.safeParse(body);
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
    const deal = await updateDeal(id, parsed.data);
    if (!deal) {
      return NextResponse.json(
        { error: "Oportunidad no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(deal);
  } catch (err) {
    console.error("PATCH /api/deals/[id]", err);
    return NextResponse.json(
      { error: "Error al actualizar la oportunidad" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const ok = await deleteDeal(id);
    if (!ok) {
      return NextResponse.json(
        { error: "Oportunidad no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/deals/[id]", err);
    return NextResponse.json(
      { error: "Error al eliminar la oportunidad" },
      { status: 500 }
    );
  }
}
