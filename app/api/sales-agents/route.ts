import { NextResponse, type NextRequest } from "next/server";
import { createSalesAgentSchema } from "@/lib/schemas/sales-agent";
import { createSalesAgent, listSalesAgents } from "@/lib/repositories/sales-agents";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeParam = searchParams.get("isActive");
    let isActive: boolean | undefined;
    if (activeParam === "true") isActive = true;
    else if (activeParam === "false") isActive = false;

    const agents = await listSalesAgents({ isActive });
    return NextResponse.json(agents);
  } catch (err) {
    console.error("GET /api/sales-agents", err);
    return NextResponse.json(
      { error: "Error al listar comerciales" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSalesAgentSchema.safeParse(body);
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
    const agent = await createSalesAgent(parsed.data);
    return NextResponse.json(agent, { status: 201 });
  } catch (err) {
    console.error("POST /api/sales-agents", err);
    return NextResponse.json(
      { error: "Error al crear comercial" },
      { status: 500 }
    );
  }
}
