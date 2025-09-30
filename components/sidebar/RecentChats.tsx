"use client";

import { useSidebar } from "../providers/sidebar-provider";
import ConversationLink from "./ConversationLink";
import { Conversation } from "@/lib/db/types";
export default function RecentChats({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {!isCollapsed && (
        <p className="text-sm font-medium text-gray-500 mb-4 border-b border-b-gray-100 ">
          Recents
        </p>
      )}
      <div className="flex flex-col gap-2">
        {conversations.map((c: Conversation) => (
          <ConversationLink key={c.id} conversation={c} />
        ))}
      </div>
    </div>
  );
}
