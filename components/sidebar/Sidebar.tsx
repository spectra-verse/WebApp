import SettingsIcon from "@/components/ui/SettingsIcon";
import { auth } from "@/lib/auth";
import { getAllConversations } from "@/lib/db/conversations";
import { headers } from "next/headers";
import ConversationLink from "./ConversationLink";
import NewChatButton from "./NewChatButton";

export default async function Sidebar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  const conversations = getAllConversations();
  return (
    <aside className="w-[300px] border-r flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4">
        <NewChatButton />
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
      <div className="flex-shrink-0 p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </span>
          </div>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <SettingsIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </aside>
  );
}
