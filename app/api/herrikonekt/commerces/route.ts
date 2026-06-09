import { NextResponse } from "next/server";
import { listClients } from "@/lib/repositories/clients";

export async function GET() {
  try {
    const clients = await listClients({ businessLine: "herrikonekt" });
    return NextResponse.json(
      clients.map((c) => ({
        id: c._id,
        name: c.name,
        description: c.description ?? "",
        website: c.website ?? "",
        phones: c.phone ? [c.phone] : [],
        addresses: c.addresses,
        type: c.type,
        subType: c.subType,
        syncToApp: c.syncToApp ?? false,
      }))
    );
  } catch (err) {
    console.error("GET /api/herrikonekt/commerces", err);
    return NextResponse.json(
      { error: "Error al listar comercios" },
      { status: 500 }
    );
  }
}
