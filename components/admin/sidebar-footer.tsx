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
        "group flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-all duration-200 hover:bg-[#3B1E8A]/10",
        !open && "justify-center"
      )}
    >
      <Avatar size="sm" className="ring-1 ring-zinc-200">
        <AvatarFallback className="bg-[#3B1E8A] text-white text-[10px] font-semibold">
          AD
        </AvatarFallback>
      </Avatar>
      {open && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-zinc-900">AdimenAi</p>
          <p className="truncate text-[11px] text-zinc-500">admin@adimenai.com</p>
        </div>
      )}
      {open && (
        <MoreHorizontal className="size-3.5 shrink-0 text-zinc-500 transition-colors group-hover:text-[#3B1E8A]" />
      )}
    </button>
  );

  const content = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" sideOffset={8} className="min-w-52">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar size="sm" className="ring-1 ring-zinc-200">
            <AvatarFallback className="bg-[#3B1E8A] text-white text-[10px] font-semibold">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900">AdimenAi</p>
            <p className="truncate text-xs text-zinc-500">admin@adimenai.com</p>
          </div>
        </div>
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
