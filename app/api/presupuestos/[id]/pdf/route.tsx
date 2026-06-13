import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { readFileSync } from "fs";
import path from "path";
import { getPresupuesto } from "@/lib/repositories/presupuestos";
import { PresupuestoPDF } from "@/lib/presupuesto-pdf";

const LOGO_PATH = path.join(process.cwd(), "public", "logo invoice.png");

function readImageAsDataUri(filePath: string): string | undefined {
  try {
    const buf = readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase().replace(".", "");
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`PDF generation timed out after ${ms}ms`)), ms)
  );
}

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

    const logoImage = readImageAsDataUri(LOGO_PATH);

    const pdfBuffer = await Promise.race([
      renderToBuffer(
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
          createdAt={presupuesto.createdAt}
          logoImage={logoImage}
        />
      ),
      timeout(15000),
    ]);

    const fileName = `${presupuesto.number} - ${presupuesto.clientSnapshot.name}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("POST /api/presupuestos/[id]/pdf", err);
    const message = err instanceof Error ? err.message : "Error al generar PDF";
    const stack = err instanceof Error ? err.stack : undefined;
    return NextResponse.json(
      { error: message, stack: stack ?? "" },
      { status: 500 }
    );
  }
}
