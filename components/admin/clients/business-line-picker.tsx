"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type CardState = "ready" | "coming-soon";

const lines: Array<{
  id: "adimenai" | "herrikonekt" | "hiopos";
  title: string;
  description: string;
  href: string;
  state: CardState;
  logo: string;
  accent: string;
  accentSoft: string;
}> = [
  {
    id: "adimenai",
    title: "AdimenAi",
    description: "Servicios de web, branding, impresión, SEO y marketing.",
    href: "/admin/clients/new/adimenai",
    state: "coming-soon",
    logo: "/logo-adimenai.jpg",
    accent: "#6D28D9",
    accentSoft: "#EDE9FE",
  },
  {
    id: "herrikonekt",
    title: "Herrikonekt",
    description: "Comercios locales sincronizados con la app móvil.",
    href: "/admin/clients/new/herrikonekt",
    state: "ready",
    logo: "/logo-herrikonket.png",
    accent: "#059669",
    accentSoft: "#D1FAE5",
  },
  {
    id: "hiopos",
    title: "Hiopos",
    description: "TPV y software para empresas (partner).",
    href: "/admin/clients/new/hiopos",
    state: "coming-soon",
    logo: "/logo-hiopos.jpg",
    accent: "#DC2626",
    accentSoft: "#FEE2E2",
  },
];

export function BusinessLinePicker({ allReady, baseHref }: { allReady?: boolean; baseHref?: string }) {
  const cardLines = (allReady
    ? lines.map((l) => ({ ...l, state: "ready" as CardState }))
    : lines
  ).map((l) => ({
    ...l,
    href: baseHref ? `${baseHref}/${l.id}` : l.href,
  }));

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {cardLines.map((line) => (
        <BusinessLineCard key={line.id} line={line} />
      ))}
    </div>
  );
}

function BusinessLineCard({
  line,
}: {
  line: (typeof lines)[number];
}) {
  const disabled = line.state === "coming-soon";

  const content = (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white transition-all duration-200",
        disabled
          ? "opacity-70"
          : "hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg hover:shadow-zinc-900/5"
      )}
      style={
        !disabled
          ? ({ "--accent": line.accent, "--accent-soft": line.accentSoft } as React.CSSProperties)
          : undefined
      }
    >
      {/* Banda superior con color de la línea */}
      <div
        className="relative h-2 w-full"
        style={{ backgroundColor: line.accent }}
        aria-hidden
      />

      <div className="flex flex-1 flex-col gap-5 p-6">
        {/* Logo */}
        <div className="flex items-start justify-between">
          <div
            className="flex size-16 items-center justify-center overflow-hidden rounded-xl"
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
          {disabled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-500">
              <Sparkles className="size-3" />
              Próximamente
            </span>
          )}
        </div>

        {/* Title + desc */}
        <div className="flex-1">
          <h3 className="text-lg font-bold tracking-tight text-zinc-950">
            {line.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
            {line.description}
          </p>
        </div>

        {/* CTA */}
        {!disabled && (
          <div
            className="flex items-center justify-between border-t border-zinc-100 pt-4 text-sm font-semibold transition-colors"
            style={{ color: line.accent }}
          >
            <span>Crear cliente</span>
            <span
              className="flex size-8 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5"
              style={{ backgroundColor: line.accentSoft }}
            >
              <ArrowRight className="size-4" />
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (disabled) {
    return (
      <div aria-disabled className="block">
        {content}
      </div>
    );
  }

  return (
    <Link href={line.href} className="block focus-visible:outline-none">
      {content}
    </Link>
  );
}
