import { getAllConversations } from "@/lib/db/conversations";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import NewChatButton from "./NewChatButton";
import SidebarContent from "./SidebarContent";
import SidebarFooter from "./SidebarFooter";
import ShowToggleButton from "./ShowToggleButton";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import RecentChats from "./RecentChats";
import { Conversation } from "@/lib/db/types";

async function getConversations(userId: string): Promise<Conversation[]> {
  const useLocalProxy = process.env.NEXT_PUBLIC_USE_LOCAL_PROXY;
  const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL || "http://localhost:8080";
  const localUserId = process.env.NEXT_PUBLIC_LOCAL_USER_ID || "local-user";
  console.log(useLocalProxy);

  return getAllConversations(userId);
  // if (useLocalProxy) {
  //   // Fetch from local proxy
  //   try {
  //     const response = await fetch(
  //       `${proxyUrl}/api/conversations?userId=${localUserId}`,
  //       { cache: "no-store" },
  //     );
  //     if (!response.ok) {
  //       console.error("Failed to fetch conversations from proxy");
  //       return [];
  //     }
  //     return response.json();
  //   } catch (error) {
  //     console.error("Error fetching conversations from proxy:", error);
  //     return [];
  //   }
  // } else {
  //   // Cloud mode: use PostgreSQL
  //   return getAllConversations(userId);
  // }
}

export default async function Sidebar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  const conversations = user?.id ? await getConversations(user.id) : [];
  return (
    <SidebarContent>
      {/* Fixed Header */}
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

      {/* Scrollable Content */}
      <RecentChats conversations={conversations} />

      {/* Fixed Footer - User & Settings */}
      <SidebarFooter user={user} />
    </SidebarContent>
  );
}
