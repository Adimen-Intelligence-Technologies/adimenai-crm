import { NextResponse, type NextRequest } from "next/server";
import { moveStageSchema } from "@/lib/schemas/deal";
import { moveDealStage } from "@/lib/repositories/deals";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = moveStageSchema.safeParse(body);
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
    const result = await moveDealStage(
      id,
      parsed.data.stage,
      parsed.data.lostReason
    );
    if (!result) {
      return NextResponse.json(
        { error: "Oportunidad no encontrada" },
        { status: 404 }
      );
    }
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("PATCH /api/deals/[id]/stage", err);
    return NextResponse.json(
      { error: "Error al cambiar de etapa" },
      { status: 500 }
    );
  }
}
