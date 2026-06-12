import { NextResponse, type NextRequest } from "next/server";
import { getPresupuesto } from "@/lib/repositories/presupuestos";
import { getPresupuestosCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const presupuesto = await getPresupuesto(id);
    if (!presupuesto) {
      return NextResponse.json(
        { error: "Presupuesto no encontrado" },
        { status: 404 }
      );
    }
    if (presupuesto.status === "accepted") {
      return NextResponse.json(
        { presupuesto, alreadyAccepted: true },
        { status: 200 }
      );
    }
    const coll = await getPresupuestosCollection();
    await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "accepted", updatedAt: new Date().toISOString() } }
    );
    const fresh = await getPresupuesto(id);
    return NextResponse.json({ presupuesto: fresh, alreadyAccepted: false });
  } catch (err) {
    console.error("POST /api/presupuestos/[id]/accept", err);
    return NextResponse.json(
      { error: "Error al aceptar el presupuesto" },
      { status: 500 }
    );
  }
}
