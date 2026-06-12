"use client";

import Link from "next/link";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  ExternalLink,
  FileText,
  Mail,
  MessageSquare,
  NotebookPen,
  Phone,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  activityOutcomeLabels,
  activityTypeLabels,
  nextActionTypeLabels,
} from "@/lib/schemas/activity";
import { getInitials } from "@/lib/schemas/sales-agent";
import type { Activity } from "@/lib/repositories/activities";
import type { SalesAgent } from "@/lib/repositories/sales-agents";
import { DeleteActivityButton } from "./delete-activity-button";
import { MarkNextActionDoneButton } from "./mark-next-action-done-button";

const ICON_FOR_TYPE: Record<string, React.ComponentType<{ className?: string }>> = {
  visit: User,
  call: Phone,
  email: Mail,
  meeting: CalendarClock,
  whatsapp: MessageSquare,
  note: NotebookPen,
};

const OUTCOME_COLOR: Record<string, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-zinc-400",
  negative: "bg-rose-500",
  pending: "bg-amber-500",
};

const OUTCOME_RING: Record<string, string> = {
  positive: "ring-emerald-100",
  neutral: "ring-zinc-100",
  negative: "ring-rose-100",
  pending: "ring-amber-100",
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDueDate(due: string): { text: string; overdue: boolean } {
  if (!due) return { text: "", overdue: false };
  const d = new Date(due);
  if (Number.isNaN(d.getTime())) return { text: due, overdue: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const text = d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
  return { text, overdue: d.getTime() < today.getTime() };
}

export function ActivityTimeline({
  activities,
  salesAgentsById,
  showClient = false,
  clientNameById,
  emptyMessage = "Sin actividades registradas.",
  onChange,
}: {
  activities: Activity[];
  salesAgentsById?: Record<string, SalesAgent>;
  showClient?: boolean;
  clientNameById?: Record<string, string>;
  emptyMessage?: string;
  onChange?: () => void;
}) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-5 py-12 text-center text-sm text-zinc-500">
        {emptyMessage}
      </div>
    );
  }
  return (
    <ol className="relative flex flex-col gap-4">
      <span
        className="absolute left-[15px] top-2 bottom-2 w-px bg-zinc-200"
        aria-hidden
      />
      {activities.map((a) => (
        <ActivityItem
          key={a._id}
          activity={a}
          salesAgent={a.salesAgentId ? salesAgentsById?.[a.salesAgentId] : undefined}
          showClient={showClient}
          clientName={
            showClient && clientNameById ? clientNameById[a.clientId] : undefined
          }
          onChange={onChange}
        />
      ))}
    </ol>
  );
}

function ActivityItem({
  activity,
  salesAgent,
  showClient,
  clientName,
  onChange,
}: {
  activity: Activity;
  salesAgent?: SalesAgent;
  showClient: boolean;
  clientName?: string;
  onChange?: () => void;
}) {
  const Icon = ICON_FOR_TYPE[activity.type] ?? NotebookPen;
  const ring = OUTCOME_RING[activity.outcome] ?? "ring-zinc-100";
  const dot = OUTCOME_COLOR[activity.outcome] ?? "bg-zinc-400";

  const canQuote =
    activity.type === "visit" && !activity.linkedPresupuestoId;

  return (
    <li className="relative pl-10">
      <span
        className={cn(
          "absolute left-0 top-0 flex size-8 items-center justify-center rounded-full bg-white ring-4",
          ring
        )}
      >
        <span
          className={cn(
            "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-white",
            dot
          )}
        />
        <Icon className="size-3.5 text-zinc-600" />
      </span>

      <div className="rounded-xl border border-zinc-200/80 bg-white px-4 py-3.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-700">
                {activityTypeLabels[activity.type]}
              </span>
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  activity.outcome === "positive" && "bg-emerald-50 text-emerald-700",
                  activity.outcome === "neutral" && "bg-zinc-100 text-zinc-700",
                  activity.outcome === "negative" && "bg-rose-50 text-rose-700",
                  activity.outcome === "pending" && "bg-amber-50 text-amber-700"
                )}
              >
                {activityOutcomeLabels[activity.outcome]}
              </span>
              <span className="text-[11px] text-zinc-500">
                {formatDateTime(activity.occurredAt)}
              </span>
            </div>
            <h3 className="mt-1 text-sm font-bold text-zinc-950">
              {activity.subject}
            </h3>
            {activity.description && (
              <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-zinc-700">
                {activity.description}
              </p>
            )}
            {showClient && clientName && (
              <p className="mt-1 text-[12px] text-zinc-500">
                Cliente:{" "}
                <span className="font-semibold text-zinc-700">
                  {clientName}
                </span>
              </p>
            )}
            {activity.linkedPresupuestoId && (
              <Link
                href={`/admin/presupuestos/${activity.linkedPresupuestoId}`}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[#3B1E8A]/20 bg-[#3B1E8A]/5 px-2 py-1 text-[11px] font-semibold text-[#3B1E8A] transition-colors hover:bg-[#3B1E8A]/10"
              >
                <FileText className="size-3" />
                Origen del presupuesto
                <ExternalLink className="size-2.5" />
              </Link>
            )}
            {canQuote && (
              <Link
                href={`/admin/presupuestos/nuevo?clientId=${activity.clientId}&fromActivity=${activity._id}${activity.salesAgentId ? `&salesAgentId=${activity.salesAgentId}` : ""}`}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700 transition-colors hover:border-[#3B1E8A]/30 hover:bg-[#3B1E8A]/5 hover:text-[#3B1E8A]"
              >
                <FileText className="size-3" />
                Cotizar desde esta visita
              </Link>
            )}
            {activity.nextAction && (
              <div
                className={cn(
                  "mt-2 flex flex-wrap items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px]",
                  activity.nextAction.done
                    ? "border-zinc-200 bg-zinc-50 text-zinc-500"
                    : "border-emerald-200 bg-emerald-50/50 text-emerald-800"
                )}
              >
                <span className="font-semibold">
                  Siguiente: {nextActionTypeLabels[activity.nextAction.type]}
                </span>
                {activity.nextAction.dueDate && (
                  <NextActionDue
                    due={activity.nextAction.dueDate}
                    done={activity.nextAction.done}
                  />
                )}
                {activity.nextAction.notes && (
                  <span className="text-zinc-600">
                    · {activity.nextAction.notes}
                  </span>
                )}
                {!activity.nextAction.done && (
                  <MarkNextActionDoneButton
                    id={activity._id}
                    onDone={onChange}
                  />
                )}
                {activity.nextAction.done && (
                  <span className="inline-flex items-center gap-1 text-zinc-500">
                    <Check className="size-3" /> Hecho
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {salesAgent && (
              <span
                className="flex size-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: salesAgent.color }}
                title={salesAgent.name}
              >
                {getInitials(salesAgent.name)}
              </span>
            )}
            <DeleteActivityButton id={activity._id} onDeleted={onChange} />
          </div>
        </div>
      </div>
    </li>
  );
}

function NextActionDue({
  due,
  done,
}: {
  due: string;
  done: boolean;
}) {
  const { text, overdue } = formatDueDate(due);
  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-zinc-500">
        <CheckCircle2 className="size-3" />
        {text}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[11px] tabular-nums",
        overdue ? "text-rose-600" : "text-emerald-700"
      )}
    >
      {text}
    </span>
  );
}
