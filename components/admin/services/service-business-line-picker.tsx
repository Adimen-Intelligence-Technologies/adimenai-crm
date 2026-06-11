"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const lines: Array<{
  id: "adimenai" | "herrikonekt" | "hiopos";
  title: string;
  description: string;
  href: string;
  logo: string;
  accent: string;
  accentSoft: string;
}> = [
  {
    id: "adimenai",
    title: "AdimenAi",
    description: "Servicios de web, branding, impresión, SEO y marketing.",
    href: "/admin/gestion-servicios/new/adimenai",
    logo: "/logo-adimenai.jpg",
    accent: "#6D28D9",
    accentSoft: "#EDE9FE",
  },
  {
    id: "herrikonekt",
    title: "Herrikonekt",
    description: "Comercios locales sincronizados con la app móvil.",
    href: "/admin/gestion-servicios/new/herrikonekt",
    logo: "/logo-herrikonket.png",
    accent: "#059669",
    accentSoft: "#D1FAE5",
  },
  {
    id: "hiopos",
    title: "Hiopos",
    description: "TPV y software para empresas (partner).",
    href: "/admin/gestion-servicios/new/hiopos",
    logo: "/logo-hiopos.jpg",
    accent: "#DC2626",
    accentSoft: "#FEE2E2",
  },
];

export function ServiceBusinessLinePicker() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {lines.map((line) => (
        <Card key={line.id} line={line} />
      ))}
    </div>
  );
}

function Card({ line }: { line: (typeof lines)[number] }) {
  return (
    <Link href={line.href} className="block focus-visible:outline-none">
      <div
        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg hover:shadow-zinc-900/5"
        style={{ ["--accent" as string]: line.accent, ["--accent-soft" as string]: line.accentSoft } as React.CSSProperties}
      >
        <div
          className="relative h-2 w-full"
          style={{ backgroundColor: line.accent }}
          aria-hidden
        />

        <div className="flex flex-1 flex-col gap-5 p-6">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-xl"
            style={{ backgroundColor: line.accentSoft }}
          >
            <Image
              src={line.logo}
              alt={line.title}
              width={56}
              height={56}
              className="max-h-12 max-w-12 object-contain"
            />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold tracking-tight text-zinc-950">
              {line.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
              {line.description}
            </p>
          </div>

          <div
            className="flex items-center justify-between border-t border-zinc-100 pt-4 text-sm font-semibold transition-colors"
            style={{ color: line.accent }}
          >
            <span>Crear servicio</span>
            <span
              className="flex size-8 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5"
              style={{ backgroundColor: line.accentSoft }}
            >
              <ArrowRight className="size-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
