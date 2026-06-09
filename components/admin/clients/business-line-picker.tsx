"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CardState = "ready" | "coming-soon";

const lines: Array<{
  id: "adimenai" | "herrikonekt" | "hiopos";
  title: string;
  description: string;
  href: string;
  state: CardState;
  logo: string;
}> = [
  {
    id: "adimenai",
    title: "AdimenAi",
    description: "Servicios de web, branding, impresión, SEO y marketing.",
    href: "/admin/clients/new/adimenai",
    state: "coming-soon",
    logo: "/logo-adimenai.jpg",
  },
  {
    id: "herrikonekt",
    title: "Herrikonekt",
    description: "Comercios locales sincronizados con la app móvil.",
    href: "/admin/clients/new/herrikonekt",
    state: "ready",
    logo: "/logo-herrikonket.png",
  },
  {
    id: "hiopos",
    title: "Hiopos",
    description: "TPV y software para empresas (partner).",
    href: "/admin/clients/new/hiopos",
    state: "coming-soon",
    logo: "/logo-hiopos.jpg",
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
        "group relative flex h-full flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-5 transition-colors",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "hover:border-zinc-300 hover:bg-zinc-50/50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-white">
          <Image
            src={line.logo}
            alt={line.title}
            width={40}
            height={40}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        {disabled ? (
          <span className="text-xs text-zinc-400">Próximamente</span>
        ) : (
          <ArrowRight
            className="size-4 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-900"
            aria-hidden
          />
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">{line.title}</h3>
        <p className="mt-1 text-sm text-zinc-500">{line.description}</p>
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
