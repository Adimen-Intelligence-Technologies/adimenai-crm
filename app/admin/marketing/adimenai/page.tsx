import { listDriveFolder } from "@/lib/drive-files";
import { FolderOpen, File } from "lucide-react";

export const dynamic = "force-dynamic";

const FOLDER_ID = "1L8gQa__M6v3jN1s4STJwmt0BCUqVYb6J";

export default async function AdimenAiMarketingPage() {
  let items:
    | { id: string; name: string; mimeType: string; iconLink?: string }[]
    | null = null;
  let error: string | null = null;

  try {
    items = await listDriveFolder(FOLDER_ID);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al conectar con Drive";
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          AdimenAi · Marketing
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Carpeta sincronizada con Google Drive
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {items && items.length === 0 && (
        <div className="rounded-lg border border-zinc-200 p-8 text-center text-sm text-zinc-500">
          La carpeta está vacía
        </div>
      )}

      {items && items.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => {
            const isFolder = item.mimeType === "application/vnd.google-apps.folder";
            return (
              <a
                key={item.id}
                href={
                  isFolder
                    ? `https://drive.google.com/drive/folders/${item.id}`
                    : `https://drive.google.com/file/d/${item.id}/view`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                {isFolder ? (
                  <FolderOpen className="size-10 text-[#3B1E8A]" />
                ) : (
                  <File className="size-10 text-zinc-400" />
                )}
                <span className="text-center text-xs font-medium text-zinc-700 line-clamp-2">
                  {item.name}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
