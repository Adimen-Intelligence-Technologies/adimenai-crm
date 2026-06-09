import { uploadDriveFile } from "@/lib/drive-files";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const parentId = form.get("parentId") as string | null;

    if (!file || !parentId) {
      return Response.json(
        { error: "file y parentId requeridos" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const item = await uploadDriveFile(
      parentId,
      file.name,
      file.type || "application/octet-stream",
      buffer
    );

    return Response.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return Response.json({ error: message }, { status: 500 });
  }
}
