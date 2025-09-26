"use client";
import { FilePenLine } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/providers/sidebar-provider";

export default function NewChatButton() {
  const { isCollapsed } = useSidebar();

  return (
    <Link
      className="bg-violet-200 p-2 rounded text-sm flex gap-2 text-stone-800 mb-4 justify-start items-center hover:bg-violet-300 transition-colors"
      href="/chat"
      title={isCollapsed ? "Start a new conversation" : undefined}
    >
      <FilePenLine className="w-4 h-4" />
      {!isCollapsed && <span>Start a new conversation</span>}
    </Link>
  );
}
