"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TopbarActions() {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Notificaciones"
        className="relative text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
      >
        <Bell />
        <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-[#6C47FF] px-1 text-[10px] text-white hover:bg-[#6C47FF]">
          3
        </Badge>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 gap-2 rounded-full px-2 text-zinc-900 hover:bg-zinc-100"
            aria-label="Menú de usuario"
          >
            <Avatar size="sm" className="ring-1 ring-zinc-200">
              <AvatarFallback className="bg-[#6C47FF] text-white text-[11px] font-semibold">
                AD
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">AdimenAi</span>
            <ChevronDown className="size-3.5 text-zinc-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} className="min-w-48">
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserRound />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            Preferencias
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <LogOut />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
