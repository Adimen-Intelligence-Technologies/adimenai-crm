"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle2,
  LogOut,
  Lock,
  User,
  Mail,
  Shield,
  CalendarDays,
  Pencil,
} from "lucide-react";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string | null;
    createdAt?: Date | string | null;
  };
}

function roleLabel(role: string | null | undefined) {
  if (!role) return "Comercial";
  if (role === "admin") return "Admin";
  if (role === "comercial") return "Comercial";
  if (role.includes("admin")) return "Admin + Comercial";
  return role;
}

function roleBadgeClass(role: string | null | undefined) {
  if (!role) return "bg-zinc-100 text-zinc-600";
  if (role.includes("admin")) return "bg-[#3B1E8A]/10 text-[#3B1E8A]";
  return "bg-zinc-100 text-zinc-600";
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password dialog
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  async function handleSaveName() {
    if (name.trim() === user.name) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error: err } = await authClient.admin.updateUser({
      userId: user.id,
      data: { name: name.trim() },
    });
    if (err) {
      setError(err.message ?? "Error al actualizar");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword.length < 6) {
      setPwError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Las contraseñas no coinciden");
      return;
    }

    setPwLoading(true);
    const { error: err } = await authClient.changePassword({
      currentPassword,
      newPassword,
    });
    if (err) {
      setPwError(err.message ?? "Error al cambiar contraseña");
    } else {
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPwOpen(false);
        setPwSuccess(false);
      }, 1500);
    }
    setPwLoading(false);
  }

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 p-6">
      {/* Cabecera */}
      <div className="flex items-center gap-5 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#3B1E8A] text-lg font-bold text-white ring-4 ring-[#3B1E8A]/10">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-zinc-900 truncate">{user.name}</h1>
          <p className="mt-0.5 text-sm text-zinc-500 truncate">{user.email}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeClass(user.role)}`}>
              <Shield className="size-3" />
              {roleLabel(user.role)}
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <CalendarDays className="size-3" />
              {memberSince}
            </span>
          </div>
        </div>
      </div>

      {/* Información personal */}
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Información personal</h2>
        <div className="mt-5 flex flex-col gap-5">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <User className="size-3.5" />
              Nombre
            </label>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
                className="flex-1"
              />
              <Button
                onClick={handleSaveName}
                disabled={saving || name.trim() === user.name}
                variant="secondary"
                className="shrink-0"
              >
                {saving ? (
                  "Guardando…"
                ) : saved ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" />
                    Guardado
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Pencil className="size-3.5" />
                    Guardar
                  </span>
                )}
              </Button>
            </div>
            {error && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="size-3" />
                {error}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <Mail className="size-3.5" />
              Correo electrónico
            </label>
            <p className="rounded-lg border border-zinc-100 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-500">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Seguridad</h2>
        <p className="mt-1 text-sm text-zinc-500">Actualiza tu contraseña periódicamente para mantener tu cuenta segura.</p>
        <div className="mt-5">
          <Dialog open={pwOpen} onOpenChange={setPwOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Lock className="mr-1.5 size-4" />
                Cambiar contraseña
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleChangePassword}>
                <DialogHeader>
                  <DialogTitle>Cambiar contraseña</DialogTitle>
                  <DialogDescription>Introduce tu contraseña actual y la nueva.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="currentPassword" className="text-sm font-medium text-zinc-700">
                      Contraseña actual
                    </label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="newPassword" className="text-sm font-medium text-zinc-700">
                      Nueva contraseña
                    </label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700">
                      Confirmar nueva contraseña
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {pwError && (
                    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                      {pwError}
                    </div>
                  )}
                  {pwSuccess && (
                    <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      <CheckCircle2 className="size-3.5" />
                      Contraseña actualizada correctamente
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={pwLoading}>
                    {pwLoading ? "Cambiando…" : "Cambiar contraseña"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cerrar sesión */}
      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Cerrar sesión</h2>
            <p className="mt-1 text-sm text-zinc-500">Termina tu sesión en todos los dispositivos.</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-1.5 size-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
