"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarkNextActionDoneButton({
  id,
  onDone,
}: {
  id: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/activities/${id}/done`, {
          method: "POST",
        });
        if (res.ok) {
          onDone?.();
          router.refresh();
        }
      } catch {
        // noop
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "ml-auto inline-flex h-6 items-center gap-1 rounded-md border border-emerald-300 bg-white px-2 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
      )}
    >
      <Check className="size-3" />
      {isPending ? "…" : "Marcar hecho"}
    </button>
  );
}
