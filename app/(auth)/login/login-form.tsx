"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await authClient.signIn.email({
        email,
        password,
      });
      if (err) {
        setError(err.message ?? "Error al iniciar sesión");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de conexión");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm">
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-[12px] font-medium text-zinc-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#3B1E8A] focus:ring-2 focus:ring-[#3B1E8A]/20"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-[12px] font-medium text-zinc-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#3B1E8A] focus:ring-2 focus:ring-[#3B1E8A]/20"
          />
        </div>

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3B1E8A] text-white shadow-xs hover:bg-[#2D1666]"
        >
          {loading ? "Iniciando sesión…" : "Iniciar sesión"}
        </Button>
      </form>
    </div>
  );
}
