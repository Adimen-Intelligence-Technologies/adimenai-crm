import { getDriveFolderName } from "@/lib/drive-files";
import { DriveExplorer } from "@/components/admin/drive/drive-explorer";

export const dynamic = "force-dynamic";

const FOLDER_ID = "1L8gQa__M6v3jN1s4STJwmt0BCUqVYb6J";

export default async function AdimenAiMarketingPage() {
  let folderName = "AdimenAi";
  try {
    folderName = await getDriveFolderName(FOLDER_ID);
  } catch {
    // fallback
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          AdimenAi · Marketing
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Archivos sincronizados con Google Drive
        </p>
      </header>

      <DriveExplorer rootFolderId={FOLDER_ID} rootName={folderName} />
    </div>
  );
}
