import { google, type drive_v3 } from "googleapis";

export type DriveItem = {
  id: string;
  name: string;
  mimeType: string;
};

function getClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT!);
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

export async function listDriveFolder(folderId: string): Promise<DriveItem[]> {
  const drive = getClient();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id, name, mimeType)",
    orderBy: "folder,name",
  });
  return (res.data.files ?? []).map((f) => ({
    id: f.id!,
    name: f.name!,
    mimeType: f.mimeType!,
  }));
}

export async function createDriveFolder(
  name: string,
  parentId: string
): Promise<DriveItem> {
  const drive = getClient();
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id, name, mimeType",
  });
  return { id: res.data.id!, name: res.data.name!, mimeType: res.data.mimeType! };
}

export async function deleteDriveItem(itemId: string): Promise<void> {
  const drive = getClient();
  await drive.files.delete({ fileId: itemId });
}

export async function uploadDriveFile(
  parentId: string,
  fileName: string,
  mimeType: string,
  body: Buffer
): Promise<DriveItem> {
  const drive = getClient();
  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [parentId],
    },
    media: {
      mimeType,
      body,
    },
    fields: "id, name, mimeType",
  });
  return { id: res.data.id!, name: res.data.name!, mimeType: res.data.mimeType! };
}

export async function getDriveFolderName(folderId: string): Promise<string> {
  const drive = getClient();
  const res = await drive.files.get({
    fileId: folderId,
    fields: "name",
  });
  return res.data.name ?? "Drive";
}
