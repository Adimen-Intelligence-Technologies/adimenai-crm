"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function TopbarActions() {
  const [session, setSession] = useState<{ user: { name: string; email: string } } | null>(null);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data) setSession(data as any);
    });
  }, []);

  async function handleLogout() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  const displayName = session?.user?.name ?? "AdimenAi";
  const displayEmail = session?.user?.email ?? "admin@adimenai.com";

  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Notificaciones"
        className="relative text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
      >
        <Bell className="size-4" />
        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#3B1E8A] ring-2 ring-white" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 rounded-md px-2 text-zinc-900 hover:bg-zinc-100"
            aria-label="Menú de usuario"
          >
            <Avatar size="sm" className="ring-1 ring-zinc-200">
              <AvatarFallback className="bg-[#3B1E8A] text-white text-[10px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-[13px] font-medium sm:inline">{displayName}</span>
            <ChevronDown className="size-3.5 text-zinc-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} className="min-w-52">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar size="sm" className="ring-1 ring-zinc-200">
              <AvatarFallback className="bg-[#3B1E8A] text-white text-[10px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">{displayName}</p>
              <p className="truncate text-xs text-zinc-500">{displayEmail}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/admin/profile" className="flex items-center gap-2">
              <UserRound />
              Perfil
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/admin/settings/users" className="flex items-center gap-2">
              <Settings />
              Usuarios
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOut />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
