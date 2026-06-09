"use client";

import { LogOut, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

export function SidebarFooter() {
  const { open } = useSidebar();

  const trigger = (
    <button
      type="button"
      className={cn(
        "group flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-white/[0.08]",
        !open && "justify-center"
      )}
    >
      <Avatar size="sm" className="ring-1 ring-white/15">
        <AvatarFallback className="bg-[#6C47FF] text-white text-[11px] font-semibold">
          AD
        </AvatarFallback>
      </Avatar>
      {open && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">AdimenAi</p>
          <p className="truncate text-xs text-white/50">admin@adimenai.com</p>
        </div>
      )}
      {open && (
        <MoreHorizontal className="size-4 shrink-0 text-white/40 group-hover:text-white" />
      )}
    </button>
  );

  const content = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" sideOffset={8} className="min-w-48">
        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Perfil</DropdownMenuItem>
        <DropdownMenuItem>Preferencias</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (open) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        Mi cuenta
      </TooltipContent>
    </Tooltip>
  );
}
