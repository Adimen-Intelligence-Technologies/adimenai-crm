"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteServiceButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function onClick() {
    if (typeof window !== "undefined") {
      const ok = window.confirm(`¿Seguro que quieres eliminar "${name}"? Esta acción no se puede deshacer.`);
      if (!ok) return;
    }
    setIsPending(true);
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "No se pudo eliminar el servicio");
      }
      router.refresh();
    } catch (err) {
      if (typeof window !== "undefined") {
        window.alert(err instanceof Error ? err.message : "Error desconocido");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Eliminar servicio"
      onClick={onClick}
      disabled={isPending}
      className="text-zinc-500 hover:bg-rose-50 hover:text-rose-600"
    >
      <Trash2 />
    </Button>
  );
}
