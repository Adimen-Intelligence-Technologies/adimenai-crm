import { NextResponse, type NextRequest } from "next/server";
import {
  businessLineEnum,
  createHerrikonektSchema,
} from "@/lib/schemas/client";
import { createClient, listClients } from "@/lib/repositories/clients";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLine = searchParams.get("businessLine");
    const q = searchParams.get("q") ?? undefined;
    const type = searchParams.get("type") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
    const pageSize = parseInt(searchParams.get("pageSize") ?? "7", 10) || 7;

    let businessLine;
    if (rawLine) {
      const parsed = businessLineEnum.safeParse(rawLine);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "businessLine inválido" },
          { status: 400 }
        );
      }
      businessLine = parsed.data;
    }

    const result = await listClients({ businessLine, q, type, page, pageSize });
    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/clients", err);
    return NextResponse.json(
      { error: "Error al listar clientes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createHerrikonektSchema.safeParse(body);
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
    const client = await createClient(parsed.data);
    return NextResponse.json(client, { status: 201 });
  } catch (err) {
    console.error("POST /api/clients", err);
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    );
  }
}
