import ConversationLink from "./ConversationLink";
import NewChatButton from "./NewChatButton";
import { getAllConversations } from "@/lib/db/conversations";

export default function Sidebar() {
  const conversations = getAllConversations();
  return (
    <aside className="w-[300px] p-4 flex flex-col gap-2 border-r">
      <div className="flex-shrink-0 mb-4">
        <NewChatButton />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {conversations.map((c) => (
            <ConversationLink key={c.id} conversation={c} />
          ))}
        </div>
      </div>
    </aside>
  );
}
