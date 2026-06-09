import { ExternalLink } from "lucide-react";

const FOLDER_ID = "1L8gQa__M6v3jN1s4STJwmt0BCUqVYb6J";

export default function AdimenAiMarketingPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            AdimenAi · Marketing
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Carpeta sincronizada con Google Drive
          </p>
        </div>
        <a
          href={`https://drive.google.com/drive/folders/${FOLDER_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <ExternalLink className="size-3.5" />
          Abrir en Drive
        </a>
      </header>

      <div className="overflow-hidden rounded-lg border border-zinc-200">
        <iframe
          src={`https://drive.google.com/embeddedfolderview?id=${FOLDER_ID}#grid`}
          className="h-[80vh] w-full"
          title="Carpeta de Google Drive"
        />
      </div>
    </div>
  );
}
