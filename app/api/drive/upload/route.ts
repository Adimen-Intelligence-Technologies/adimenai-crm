import { google } from "googleapis";
import { Readable } from "stream";

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

    // Upload as multipart (media + metadata) with a stream body
    const res = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [parentId],
      },
      media: {
        mimeType,
        body: Readable.from(buffer),
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
    const message = err instanceof Error ? err.message : "Error desconocido";
    return Response.json(
      {
        error: message,
        ...(process.env.NODE_ENV === "development" && {
          stack: err instanceof Error ? err.stack : undefined,
        }),
      },
      { status: 500 }
    );
  }
}
