import { google } from "googleapis";

export type DriveItem = {
  id: string;
  name: string;
  mimeType: string;
  iconLink?: string;
};

export async function listDriveFolder(folderId: string): Promise<DriveItem[]> {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT!);

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id, name, mimeType, iconLink)",
    orderBy: "folder,name",
  });

  return (res.data.files ?? []).map((f) => ({
    id: f.id!,
    name: f.name!,
    mimeType: f.mimeType!,
    iconLink: f.iconLink ?? undefined,
  }));
}
