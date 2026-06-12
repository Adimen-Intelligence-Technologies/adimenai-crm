import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Pencil, Phone, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/schemas/sales-agent";
import { getSalesAgent } from "@/lib/repositories/sales-agents";

export default async function SalesAgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getSalesAgent(id);
  if (!agent) notFound();

  return (
    <div className="flex animate-fade-in flex-col gap-5">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="self-start text-zinc-700 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A] sm:self-auto"
        >
          <Link href="/admin/sales-agents">
            <ArrowLeft />
            Volver a Comerciales
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="self-start rounded-full sm:self-auto"
        >
          <Link href={`/admin/sales-agents/${agent._id}/edit`}>
            <Pencil />
            Editar
          </Link>
        </Button>
      </div>

      <div
        className="rounded-xl px-6 py-6 sm:px-8 sm:py-7"
        style={{
          background: `linear-gradient(135deg, ${agent.color} 0%, ${agent.color}cc 100%)`,
        }}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold tracking-tight text-white backdrop-blur-sm">
              {getInitials(agent.name) || <UserCircle2 className="size-10" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white">
                  Comercial
                </span>
                {agent.isActive ? (
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">
                    Activo
                  </span>
                ) : (
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">
                    Inactivo
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                {agent.name}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {agent.email && (
              <a
                href={`mailto:${agent.email}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-white/15 px-3 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
              >
                <Mail className="size-3.5" />
                Email
              </a>
            )}
            {agent.phone && (
              <a
                href={`tel:${agent.phone}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-white/15 px-3 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
              >
                <Phone className="size-3.5" />
                Llamar
              </a>
            )}
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200/80 bg-white px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="mb-3 text-sm font-bold tracking-tight text-zinc-950">
          Información de contacto
        </h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-semibold tracking-[0.04em] text-zinc-500 uppercase">
              Email
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-zinc-900">
              {agent.email || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold tracking-[0.04em] text-zinc-500 uppercase">
              Teléfono
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-zinc-900">
              {agent.phone || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold tracking-[0.04em] text-zinc-500 uppercase">
              Estado
            </dt>
            <dd className="mt-1">
              {agent.isActive ? (
                <Badge className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border-emerald-200">
                  Activo
                </Badge>
              ) : (
                <Badge className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 border-zinc-200">
                  Inactivo
                </Badge>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold tracking-[0.04em] text-zinc-500 uppercase">
              Color
            </dt>
            <dd className="mt-1 flex items-center gap-2">
              <span
                className="size-5 rounded-full border border-zinc-200"
                style={{ backgroundColor: agent.color }}
                aria-hidden
              />
              <span className="font-mono text-xs text-zinc-700">{agent.color}</span>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
