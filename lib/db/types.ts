export interface InsertConversationData {
  id: string;
  name?: string;
  model?: string;
}
export interface Message {
  id: string;
  content: string;
  createdAt: string;
  conversationId: string;
  role: "assistant" | "user";
}
export interface MessageData {
  id: string;
  content: string;
  conversationId: string;
  role: string;
}

export interface Conversation {
  id: string;
  name: string;
  model?: string;
  createdAt: string;
}
