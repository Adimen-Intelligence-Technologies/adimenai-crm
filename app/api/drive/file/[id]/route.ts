import { downloadDriveFile, getDriveFileMetadata } from "@/lib/drive-files";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meta = await getDriveFileMetadata(id);
    const { data, mimeType } = await downloadDriveFile(id);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${meta.name}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return new Response(message, { status: 500 });
  }
}
