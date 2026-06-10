import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { readFileSync } from "fs";
import path from "path";
import { getPresupuesto } from "@/lib/repositories/presupuestos";
import { PresupuestoPDF } from "@/lib/presupuesto-pdf";

const LOGO_PATH = path.join(process.cwd(), "public", "logo-adimenai.jpg");

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const presupuesto = await getPresupuesto(id);
    if (!presupuesto) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }

    let logoBase64: string | undefined;
    try {
      const logoBuffer = readFileSync(LOGO_PATH);
      logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString("base64")}`;
    } catch {
      // continue without logo
    }

    const pdfBuffer = await renderToBuffer(
      <PresupuestoPDF
        number={presupuesto.number}
        clientName={presupuesto.clientSnapshot.name}
        clientNif={presupuesto.clientSnapshot.nif}
        clientAddress={presupuesto.clientSnapshot.address}
        clientEmail={presupuesto.clientSnapshot.email}
        clientPhone={presupuesto.clientSnapshot.phone}
        introduction={presupuesto.introduction}
        items={presupuesto.items}
        subtotal={presupuesto.subtotal}
        taxRate={presupuesto.taxRate}
        taxAmount={presupuesto.taxAmount}
        total={presupuesto.total}
        notes={presupuesto.notes}
        logoBase64={logoBase64}
      />
    );

    const fileName = `${presupuesto.number} - ${presupuesto.clientSnapshot.name}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("POST /api/presupuestos/[id]/pdf", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al generar PDF" },
      { status: 500 }
    );
  }
}
