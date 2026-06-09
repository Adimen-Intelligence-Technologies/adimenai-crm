"use client";

import { ExternalLink } from "lucide-react";

export function TasksView() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Gestión administrativa
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Hoja de cálculo del comité administrativo
          </p>
        </div>
        <a
          href="https://docs.google.com/spreadsheets/d/1jX5yB2zOckIuU9x9l-dK5q2Q2dwPMzgq/edit"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <ExternalLink className="size-3.5" />
          Editar en Drive
        </a>
      </header>

      <div className="overflow-hidden rounded-lg border border-zinc-200">
        <iframe
          src={`https://docs.google.com/spreadsheets/d/1jX5yB2zOckIuU9x9l-dK5q2Q2dwPMzgq/edit?widget=true&headers=0&range=${encodeURIComponent("comité administrativo adimenAI")}!A1`}
          className="h-[90vh] w-full"
          title="Hoja de cálculo de comité"
        />
      </div>
    </div>
  );
}


