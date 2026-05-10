"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getAllConversations } from "@/lib/db/conversations";
import { getClientUserId } from "@/lib/client-local-user";
import { Conversation } from "@/lib/db/types";
import NewChatButton from "./NewChatButton";
import SidebarContent from "./SidebarContent";
import SidebarFooter from "./SidebarFooter";
import ShowToggleButton from "./ShowToggleButton";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import RecentChats from "./RecentChats";

export default function Sidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    async function loadConversations() {
      const userId = await getClientUserId();
      const convs = await getAllConversations(userId);
      setConversations(convs);
    }
    loadConversations();
  }, [pathname]);

  return (
    <SidebarContent>
      <div className="flex-shrink-0 p-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-1">
            <Logo />
          </Link>
          <ShowToggleButton />
        </div>
        <div className="flex items-center justify-between mt-12">
          <div className="flex-1">
            <NewChatButton />
          </div>
        </div>
      </div>

      <RecentChats conversations={conversations} />

      <SidebarFooter />
    </SidebarContent>
  );
}
