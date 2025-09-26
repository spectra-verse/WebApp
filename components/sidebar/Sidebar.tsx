import { auth } from "@/lib/auth";
import { getAllConversations } from "@/lib/db/conversations";
import { headers } from "next/headers";
import ConversationLink from "./ConversationLink";
import NewChatButton from "./NewChatButton";
import SidebarContent from "./SidebarContent";
// import SidebarToggle from "./SidebarToggle";
import SidebarFooter from "./SidebarFooter";
import ShowToggleButton from "./ShowToggleButton";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default async function Sidebar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  const conversations = getAllConversations();
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
        <div className="flex items-center justify-between mt-4">
          <div className="flex-1">
            <NewChatButton />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {conversations.map((c) => (
            <ConversationLink key={c.id} conversation={c} />
          ))}
        </div>
      </div>

      {/* Fixed Footer - User & Settings */}
      <SidebarFooter user={user} />
    </SidebarContent>
  );
}
