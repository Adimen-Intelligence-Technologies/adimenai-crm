"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, AlertCircle } from "lucide-react";

export function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("comercial");
  const [actionError, setActionError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    const { data, error } = await authClient.admin.listUsers({ query: { limit: 200 } });
    if (error) {
      setError(error.message ?? "Error al cargar usuarios");
    } else if (data) {
      setUsers(data.users);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
    authClient.getSession().then(({ data }) => {
      if (data?.user?.id) setCurrentUserId(data.user.id);
    });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setActionError(null);
    const { error } = await authClient.admin.createUser({
      email: newEmail,
      password: newPassword,
      name: newName,
      role: newRole as any,
    });
    if (error) {
      setActionError(error.message ?? "Error al crear usuario");
      return;
    }
    setDialogOpen(false);
    setNewEmail("");
    setNewPassword("");
    setNewName("");
    setNewRole("comercial");
    fetchUsers();
  }

  async function handleSetRole(userId: string, role: string) {
    const { error } = await authClient.admin.setRole({ userId, role: role as any });
    if (error) {
      alert(error.message ?? "Error al cambiar rol");
      return;
    }
    fetchUsers();
  }

  async function handleDelete(userId: string) {
    if (!confirm("¿Eliminar este usuario definitivamente?")) return;
    const { error } = await authClient.admin.removeUser({ userId });
    if (error) {
      alert(error.message ?? "Error al eliminar usuario");
      return;
    }
    fetchUsers();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Usuarios</h1>
          <p className="mt-1 text-sm text-zinc-500">Gestiona los usuarios del sistema</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1.5 size-4" />
              Nuevo usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Crear usuario</DialogTitle>
                <DialogDescription>Añade un nuevo usuario al sistema</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {actionError && (
                  <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertCircle className="size-4 shrink-0" />
                    {actionError}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Crear usuario</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-zinc-400">Cargando...</div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-red-600">
          <AlertCircle className="size-4" />
          {error}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Verificado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-zinc-400">
                    No hay usuarios
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-zinc-900">{user.name}</TableCell>
                  <TableCell className="text-zinc-600">{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={String(user.role || "comercial")}
                      onValueChange={(v) => handleSetRole(user.id, v)}
                    >
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="admin,comercial">Admin + Comercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs ${user.emailVerified ? "text-emerald-600" : "text-zinc-400"}`}>
                      {user.emailVerified ? "Sí" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500">
                    {new Date(user.createdAt as string | number).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell>
                    {user.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-zinc-400 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
