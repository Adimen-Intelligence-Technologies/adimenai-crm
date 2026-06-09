import { google } from "googleapis";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT!);
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    const meta = await drive.files.get({
      fileId: id,
      fields: "name, mimeType",
    });

    const res = await drive.files.get(
      { fileId: id, alt: "media" },
      { responseType: "stream" }
    );

    const chunks: Buffer[] = [];
    for await (const chunk of res.data as unknown as AsyncIterable<Buffer>) {
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks);

    return new Response(data, {
      headers: {
        "Content-Type": meta.data.mimeType ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${meta.data.name ?? "file"}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Drive file proxy error:", err);
    return new Response(
      err instanceof Error ? err.message : "Error desconocido",
      { status: 500 }
    );
  }
}
