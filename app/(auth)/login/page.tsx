import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B1E8A] to-[#2D1666] text-white text-lg font-bold tracking-tight">
            A
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Adimen CRM
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Inicia sesión para continuar
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
