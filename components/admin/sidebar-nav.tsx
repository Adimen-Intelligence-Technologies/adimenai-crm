"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navGroups } from "@/lib/nav";
import type { NavGroup, NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { NavLink } from "./nav-link";
import { useSidebar } from "./sidebar-context";

function isGroup(item: NavItem | NavGroup): item is NavGroup {
  return "items" in item;
}

function RenderGroup({
  group,
  depth,
  expandedGroups,
  onToggle,
}: {
  group: NavGroup;
  depth: number;
  expandedGroups: Record<string, boolean>;
  onToggle: (label: string) => void;
}) {
  const { open } = useSidebar();
  const isFolder = group.folder && open;

  return (
    <div className="flex flex-col gap-0.5">
      {isFolder && (
        <button
          type="button"
          onClick={() => onToggle(group.label)}
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] font-semibold tracking-[0.06em] uppercase transition-all duration-200",
            "text-zinc-900 hover:text-[#3B1E8A]"
          )}
          style={{ paddingLeft: `${10 + depth * 14}px` }}
        >
          {group.folderIcon && (
            <group.folderIcon className="size-3.5 shrink-0 text-zinc-500 transition-colors duration-200 group-hover:text-[#3B1E8A]" />
          )}
          <span className="flex-1 truncate text-left">{group.label}</span>
          <ChevronDown
            className={cn(
              "size-3 shrink-0 text-zinc-400 transition-all duration-300 group-hover:text-[#3B1E8A]",
              expandedGroups[group.label] && "rotate-180 text-[#3B1E8A]"
            )}
          />
        </button>
      )}

      {(!isFolder || expandedGroups[group.label]) && (
        <ul className="flex flex-col gap-0.5">
          {group.items.map((item) => {
            if (isGroup(item)) {
              return (
                <li key={item.label}>
                  <RenderGroup
                    group={item}
                    depth={depth + 1}
                    expandedGroups={expandedGroups}
                    onToggle={onToggle}
                  />
                </li>
              );
            }
            return (
              <li key={item.href}>
                <NavLink item={item} depth={depth + (isFolder ? 1 : 0)} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function SidebarNav() {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  function toggleGroup(label: string) {
    setExpandedGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  }

  return (
    <ScrollArea className="flex-1 px-3 py-5">
      <nav aria-label="Navegación principal" className="flex flex-col gap-6">
        {navGroups.map((group) => (
          <RenderGroup
            key={group.label}
            group={group}
            depth={0}
            expandedGroups={expandedGroups}
            onToggle={toggleGroup}
          />
        ))}
      </nav>
    </ScrollArea>
  );
}
