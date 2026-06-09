import { google } from "googleapis";

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

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT!);
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";

    const res = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [parentId],
      },
      media: {
        mimeType,
        body: buffer,
      },
      fields: "id, name, mimeType",
    });

    return Response.json({
      item: {
        id: res.data.id!,
        name: res.data.name!,
        mimeType: res.data.mimeType!,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
