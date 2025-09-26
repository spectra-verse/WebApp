"use client";

import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar-provider";

export default function SidebarToggle() {
  const { isCollapsed, toggle } = useSidebar();

  return (
    <button
      onClick={toggle}
      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? (
        <ArrowRightToLine
          size={20}
          className="text-gray-600 dark:text-gray-300"
        />
      ) : (
        <ArrowLeftToLine
          size={20}
          className="text-gray-600 dark:text-gray-300"
        />
      )}
    </button>
  );
}
