import { createDriveFolder } from "@/lib/drive-files";

export async function POST(req: Request) {
  try {
    const { name, parentId } = (await req.json()) as {
      name: string;
      parentId: string;
    };
    if (!name || !parentId) {
      return Response.json({ error: "name y parentId requeridos" }, { status: 400 });
    }
    const item = await createDriveFolder(name, parentId);
    return Response.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return Response.json({ error: message }, { status: 500 });
  }
}
