import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión — Adimen CRM",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left: image panel */}
      <div className="relative hidden w-1/2 lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/login-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B1E8A]/80 via-[#3B1E8A]/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <blockquote className="max-w-md text-lg leading-relaxed font-light italic text-white/90">
            &ldquo;La tecnología es más poderosa cuando une a las personas y simplifica lo complejo.&rdquo;
          </blockquote>
          <p className="mt-3 text-sm text-white/60">AdimenAI</p>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center lg:text-left">
            <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B1E8A] to-[#2D1666] text-white text-base font-bold tracking-tight shadow-lg shadow-[#3B1E8A]/20 lg:mx-0">
              A
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Adimen CRM
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Inicia sesión para acceder al panel
            </p>
          </div>
          <LoginForm />
          <p className="mt-8 text-center text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} AdimenAI. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
