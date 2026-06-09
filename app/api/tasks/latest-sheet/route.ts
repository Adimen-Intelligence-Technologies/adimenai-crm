import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT!);

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const fileId = process.env.GOOGLE_DRIVE_FILE_ID!;

    const res = await sheets.spreadsheets.get({
      spreadsheetId: fileId,
    });

    const sheetsList = res.data.sheets ?? [];

    const dateSheets = sheetsList
      .map((s) => ({
        name: s.properties?.title ?? "",
        gid: s.properties?.sheetId ?? 0,
      }))
      .filter((s) => /^\d{8}$/.test(s.name))
      .sort((a, b) => {
        const toKey = (s: string) => s.substring(4, 8) + s.substring(2, 4) + s.substring(0, 2);
        return toKey(b.name).localeCompare(toKey(a.name));
      });

    const latest = dateSheets.length > 0
      ? dateSheets[0]
      : { name: sheetsList[0]?.properties?.title ?? "", gid: sheetsList[0]?.properties?.sheetId ?? 0 };

    return NextResponse.json({
      gid: latest.gid,
      name: latest.name,
    });
  } catch (err) {
    console.error("Error fetching latest sheet gid:", err);
    return NextResponse.json({ gid: 0, name: "" });
  }
}
