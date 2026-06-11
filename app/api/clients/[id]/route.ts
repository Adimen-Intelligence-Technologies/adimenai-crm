import { NextResponse, type NextRequest } from "next/server";
import { updateHerrikonektSchema } from "@/lib/schemas/client";
import {
  deleteClient,
  getClient,
  updateClient,
} from "@/lib/repositories/clients";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const client = await getClient(id);
    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(client);
  } catch (err) {
    console.error("GET /api/clients/[id]", err);
    return NextResponse.json(
      { error: "Error al obtener cliente" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateHerrikonektSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    // Only apply fields that were actually sent (Zod partial + defaults injects
    // default values for every field, which would reset the document).
    const patchData: Record<string, unknown> = {};
    for (const key of Object.keys(body)) {
      const val = parsed.data[key as keyof typeof parsed.data];
      if (val !== undefined) patchData[key] = val;
    }
    const client = await updateClient(id, patchData);
    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(client);
  } catch (err) {
    console.error("PATCH /api/clients/[id]", err);
    return NextResponse.json(
      { error: "Error al actualizar cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const ok = await deleteClient(id);
    if (!ok) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/clients/[id]", err);
    return NextResponse.json(
      { error: "Error al eliminar cliente" },
      { status: 500 }
    );
  }
}
