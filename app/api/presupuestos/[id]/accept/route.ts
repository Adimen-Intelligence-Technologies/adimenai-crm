import { NextResponse, type NextRequest } from "next/server";
import { getPresupuesto } from "@/lib/repositories/presupuestos";
import {
  createDeal,
  findActiveDealByPresupuesto,
} from "@/lib/repositories/deals";
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
      const existing =
        (await findActiveDealByPresupuesto(id)) ??
        (presupuesto._id
          ? null
          : null);
      if (existing) {
        return NextResponse.json(
          { presupuesto, deal: existing, alreadyAccepted: true },
          { status: 200 }
        );
      }
    }
    const existing = await findActiveDealByPresupuesto(id);
    if (existing) {
      const coll = await getPresupuestosCollection();
      await coll.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "accepted", updatedAt: new Date().toISOString() } }
      );
      const fresh = await getPresupuesto(id);
      return NextResponse.json(
        { presupuesto: fresh, deal: existing, alreadyAccepted: true },
        { status: 200 }
      );
    }

    const deal = await createDeal({
      title: `${presupuesto.number} — ${presupuesto.clientSnapshot.name}`,
      clientId: presupuesto.clientId,
      businessLine: presupuesto.businessLine,
      sourcePresupuestoId: presupuesto._id,
      estimatedValue: presupuesto.total,
      currency: "EUR",
      stage: "accepted",
      salesAgentId: "",
      sourceActivityId: "",
      expectedCloseDate: "",
      notes: "",
    });

    const coll = await getPresupuestosCollection();
    await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "accepted", updatedAt: new Date().toISOString() } }
    );
    const fresh = await getPresupuesto(id);
    return NextResponse.json(
      { presupuesto: fresh, deal, alreadyAccepted: false },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/presupuestos/[id]/accept", err);
    return NextResponse.json(
      { error: "Error al aceptar el presupuesto" },
      { status: 500 }
    );
  }
}
