"use client";

import { useSidebar } from "@/components/providers/sidebar-provider";
import { ReactNode } from "react";

interface SidebarContentProps {
  children: ReactNode;
}

export default function SidebarContent({ children }: SidebarContentProps) {
  const { isCollapsed } = useSidebar();

  return (
    <aside
      className={`
        bg-stone-100 border-r border-r-stone-200
        flex flex-col h-full transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-16" : "w-[320px]"}
      `}
    >
      {children}
    </aside>
  );
}
