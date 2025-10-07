"use client";

import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar-provider";

export default function SidebarToggle() {
  const { isCollapsed, toggle } = useSidebar();

  return (
    <button
      onClick={toggle}
      className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? (
        <ArrowRightToLine
          size={20}
          className="text-sidebar-foreground"
        />
      ) : (
        <ArrowLeftToLine
          size={20}
          className="text-sidebar-foreground"
        />
      )}
    </button>
  );
}
