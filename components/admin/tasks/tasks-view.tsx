"use client";

import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";

const SHEET_ID = "1Ym5iMQYEDDTsKhv4j48g1RGbq5mNqkCdNg5Ya07NxHA";
const SHEET_GID = "1325752741";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}`;
const EMBED_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?widget=true&headers=0&gid=${SHEET_GID}`;

export function TasksView() {
  return (
    <div className="flex animate-fade-in flex-col gap-6">
      <PageHeader
        title="Gestión administrativa"
        actions={
          <a
            href={SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200/80 bg-white px-3 text-[13px] font-medium text-zinc-700 transition-colors hover:border-[#3B1E8A]/30 hover:bg-[#3B1E8A]/5 hover:text-[#3B1E8A]"
          >
            <ExternalLink className="size-3.5" />
            Editar en Drive
          </a>
        }
      />

      <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-900/[0.02]">
        <iframe
          src={EMBED_URL}
          className="h-[calc(100vh-220px)] min-h-[640px] w-full"
          title="Hoja de cálculo de comité"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}
