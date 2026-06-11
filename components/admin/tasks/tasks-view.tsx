"use client";

import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";

export function TasksView() {
  return (
    <div className="flex animate-fade-in flex-col gap-6">
      <PageHeader

        title="Gestión administrativa"
        
        actions={
          <a
            href="https://docs.google.com/spreadsheets/d/1jX5yB2zOckIuU9x9l-dK5q2Q2dwPMzgq/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200/80 bg-white px-3 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <ExternalLink className="size-3.5" />
            Editar en Drive
          </a>
        }
      />

      <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white">
        <iframe
          src={`https://docs.google.com/spreadsheets/d/1jX5yB2zOckIuU9x9l-dK5q2Q2dwPMzgq/edit?widget=true&headers=0&range=${encodeURIComponent("comité administrativo adimenAI")}!A1`}
          className="h-[calc(100vh-220px)] min-h-[640px] w-full"
          title="Hoja de cálculo de comité"
        />
      </div>
    </div>
  );
}
