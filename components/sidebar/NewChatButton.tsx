"use client";
import { FilePenLine } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/providers/sidebar-provider";

export default function NewChatButton() {
  const { isCollapsed } = useSidebar();

  return (
    <Link
      className="bg-sidebar-primary p-2 rounded text-sm flex gap-2 text-sidebar-primary-foreground mb-4 justify-start items-center hover:bg-sidebar-primary/80 transition-colors"
      href="/chat"
      title={isCollapsed ? "Start a new conversation" : undefined}
    >
      <FilePenLine className="w-4 h-4" />
      {!isCollapsed && <span>Start a new conversation</span>}
    </Link>
  );
}
