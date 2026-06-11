"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
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
        <Box key={line.id} line={line} />
      ))}
    </div>
  );
}

function Box({ line }: { line: (typeof lines)[number] }) {
  const disabled = line.state === "coming-soon";

  const content = (
    <div
      className={cn(
        "group relative flex h-full flex-col items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 text-center transition-all duration-200",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-900/[0.04]"
      )}
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
      {!disabled && (
        <ChevronRight className="size-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-900" />
      )}
    </div>
  );

  if (disabled) {
    return <div aria-disabled className="block">{content}</div>;
  }
  return (
    <Link href={line.href} className="block focus-visible:outline-none">
      {content}
    </Link>
  );
}
