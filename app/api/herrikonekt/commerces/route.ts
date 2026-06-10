import { NextResponse } from "next/server";
import { listClients } from "@/lib/repositories/clients";

export async function GET() {
  try {
    const all = await listClients({ businessLine: "herrikonekt", page: 1, pageSize: 9999 });
    return NextResponse.json(
      all.items.map((c) => ({
        id: c._id,
        name: c.name,
        description: c.description ?? "",
        website: c.website ?? "",
        phones: c.phones ?? [],
        addresses: c.addresses,
        type: c.type,
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
