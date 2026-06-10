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
    <div className="flex flex-col gap-1">
      {isFolder && (
        <button
          type="button"
          onClick={() => onToggle(group.label)}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "text-white/70 hover:bg-white/[0.08] hover:text-white"
          )}
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          {group.folderIcon && (
            <group.folderIcon className="size-[18px] shrink-0 text-white/60" />
          )}
          <span className="flex-1 truncate text-left">{group.label}</span>
          <ChevronDown
            className={cn(
              "size-3.5 text-white/40 transition-transform",
              expandedGroups[group.label] && "rotate-180"
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
    <ScrollArea className="flex-1 px-3 py-4">
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
