import { getAllConversations } from "@/lib/db/conversations";
import { getLocalUserId } from "@/lib/local-user";
import NewChatButton from "./NewChatButton";
import SidebarContent from "./SidebarContent";
import SidebarFooter from "./SidebarFooter";
import ShowToggleButton from "./ShowToggleButton";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import RecentChats from "./RecentChats";

export default async function Sidebar() {
  const userId = await getLocalUserId();
  const conversations = await getAllConversations(userId);

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
