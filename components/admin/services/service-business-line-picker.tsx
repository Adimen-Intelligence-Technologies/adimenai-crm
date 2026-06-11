"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const lines: Array<{
  id: "adimenai" | "herrikonekt" | "hiopos";
  title: string;
  description: string;
  href: string;
  logo: string;
}> = [
  {
    id: "adimenai",
    title: "AdimenAi",
    description: "Servicios de web, branding, impresión, SEO y marketing.",
    href: "/admin/gestion-servicios/new/adimenai",
    logo: "/logo-adimenai.jpg",
  },
  {
    id: "herrikonekt",
    title: "Herrikonekt",
    description: "Comercios locales sincronizados con la app móvil.",
    href: "/admin/gestion-servicios/new/herrikonekt",
    logo: "/logo-herrikonket.png",
  },
  {
    id: "hiopos",
    title: "Hiopos",
    description: "TPV y software para empresas (partner).",
    href: "/admin/gestion-servicios/new/hiopos",
    logo: "/logo-hiopos.jpg",
  },
];

export function ServiceBusinessLinePicker() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {lines.map((line) => (
        <Link
          key={line.id}
          href={line.href}
          className="group relative flex h-full flex-col items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 text-center transition-all duration-200 hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-900/[0.04] focus-visible:outline-none"
        >
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl bg-zinc-50">
            <Image
              src={line.logo}
              alt={line.title}
              width={40}
              height={40}
              className="max-h-9 max-w-9 object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight text-zinc-950">
              {line.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
              {line.description}
            </p>
          </div>
          <ChevronRight className="size-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-900" />
        </Link>
      ))}
    </div>
  );
}


