import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión — Adimen CRM",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left: image panel (no text) */}
      <div className="relative hidden w-1/2 lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/login-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a3e]/80 via-[#3B1E8A]/40 to-transparent" />
      </div>

      {/* Right: form panel */}
      <div className="flex w-full items-center justify-center bg-white px-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-zinc-100 bg-white p-8 shadow-sm">
            {/* Logo */}
            <div className="mb-8">
              <img
                src="/logo-adimenai.jpg"
                alt="AdimenAI"
                className="h-9 w-auto"
              />
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Iniciar sesión
              </h1>
              <p className="mt-1.5 text-sm text-zinc-500">
                Introduce tus credenciales para acceder
              </p>
            </div>

            <LoginForm />
          </div>

          <p className="mt-8 text-center text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} AdimenAI
          </p>
        </div>
      </div>
    </div>
  );
}
