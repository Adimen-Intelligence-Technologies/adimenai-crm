import { NextResponse, type NextRequest } from "next/server";
import { businessLineEnum } from "@/lib/schemas/client";
import { createDealSchema, dealStageEnum } from "@/lib/schemas/deal";
import { createDeal, listDeals } from "@/lib/repositories/deals";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");
    const businessLine = searchParams.get("businessLine");
    const salesAgentId = searchParams.get("salesAgentId");
    const clientId = searchParams.get("clientId");
    const q = searchParams.get("q") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
    const pageSize = parseInt(searchParams.get("pageSize") ?? "200", 10) || 200;

    const filter: Parameters<typeof listDeals>[0] = {
      clientId: clientId ?? undefined,
      salesAgentId: salesAgentId ?? undefined,
      q,
      page,
      pageSize,
    };
    if (stage) {
      const parsed = dealStageEnum.safeParse(stage);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "stage inválido" },
          { status: 400 }
        );
      }
      filter.stage = parsed.data;
    }
    if (businessLine) {
      const parsed = businessLineEnum.safeParse(businessLine);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "businessLine inválido" },
          { status: 400 }
        );
      }
      filter.businessLine = parsed.data;
    }
    const result = await listDeals(filter);
    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/deals", err);
    return NextResponse.json(
      { error: "Error al listar oportunidades" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createDealSchema.safeParse(body);
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
    const deal = await createDeal(parsed.data);
    return NextResponse.json(deal, { status: 201 });
  } catch (err) {
    console.error("POST /api/deals", err);
    return NextResponse.json(
      { error: "Error al crear la oportunidad" },
      { status: 500 }
    );
  }
}
