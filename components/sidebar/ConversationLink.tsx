"use client";
import { deleteConversation } from "@/lib/actions/deleteConversation";
import { renameConversation } from "@/lib/actions/renameConversation";
import type { Conversation } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { Pencil, Trash, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSidebar } from "@/components/providers/sidebar-provider";

interface ConversationLinkProps {
  conversation: Conversation;
}

export default function ConversationLink({
  conversation,
}: ConversationLinkProps) {
  const { conversationId } = useParams();
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(conversation.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDelete = async (e: React.MouseEvent) => {
    console.log("deleteing");
    e.preventDefault();
    e.stopPropagation();
    await deleteConversation(conversation.id);
    if (conversationId === conversation.id) {
      router.push("/");
    }
    router.refresh();
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() !== "" && name !== conversation.name) {
      await renameConversation(conversation.id, name);
      router.refresh();
    }
    setIsEditing(false);
  };

  const startEditing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  if (isCollapsed) {
    return (
      <div className="group relative flex justify-center">
        <Link
          key={conversation.id}
          className={cn(
            "p-2 rounded-sm hover:bg-sidebar-accent transition-colors",
            conversationId === conversation.id && "bg-sidebar-accent",
          )}
          href={`/conversations/${conversation.id}`}
          title={conversation.name}
        >
          <MessageSquare className="w-4 h-4 text-sidebar-foreground" />
        </Link>
      </div>
    );
  }

  return (
    <div className="group relative flex items-center bg-sidebar-accent/50 rounded-sm hover:bg-sidebar-accent">
      {isEditing ? (
        <form onSubmit={handleRename} className="flex-1">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            className="w-full text-sm p-2 rounded-sm bg-sidebar text-sidebar-foreground border border-sidebar-border"
            autoFocus
          />
        </form>
      ) : (
        <Link
          key={conversation.id}
          className={cn(
            "truncate text-sm text-sidebar-foreground p-2 rounded-sm flex-1",
            conversationId === conversation.id && "bg-sidebar-accent",
          )}
          href={`/conversations/${conversation.id}`}
        >
          {conversation.name}
        </Link>
      )}
      <div className="flex">
        <button
          onClick={startEditing}
          className="invisible group-hover:visible p-2 text-sidebar-foreground/60 hover:text-sidebar-primary"
          aria-label="Rename conversation"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={handleDelete}
          className="invisible group-hover:visible p-2 text-sidebar-foreground/60 hover:text-red-600"
          aria-label="Delete conversation"
        >
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
}
