/**
 * Spectraverse Assistant API Client
 *
 * This client abstracts the difference between cloud (PostgreSQL + Drizzle)
 * and local (Spectraverse Assistant Proxy + SQLite) modes.
 */

import { Conversation, Message, InsertConversationData } from "@/lib/db/types";

// Check if we're in local proxy mode
const USE_LOCAL_PROXY = process.env.NEXT_PUBLIC_USE_LOCAL_PROXY === "true";
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL || "http://localhost:8080";
const LOCAL_USER_ID = process.env.NEXT_PUBLIC_LOCAL_USER_ID || "local-user";

/**
 * Base fetch wrapper with error handling
 */
async function fetchFromProxy<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${PROXY_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

/**
 * Conversation API
 */
export const AssistantAPI = {
  conversations: {
    /**
     * Create a new conversation
     */
    async create(data: InsertConversationData): Promise<Conversation> {
      if (!USE_LOCAL_PROXY) {
        throw new Error("Cloud mode not yet migrated to use this client");
      }

      return fetchFromProxy<Conversation>("/api/conversations", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          model: data.model,
          userId: LOCAL_USER_ID, // Use local user ID
        }),
      });
    },

    /**
     * Get all conversations for the current user
     */
    async getAll(userId?: string): Promise<Conversation[]> {
      if (!USE_LOCAL_PROXY) {
        throw new Error("Cloud mode not yet migrated to use this client");
      }

      const effectiveUserId = userId || LOCAL_USER_ID;
      return fetchFromProxy<Conversation[]>(
        `/api/conversations?userId=${effectiveUserId}`,
      );
    },

    /**
     * Get a specific conversation
     */
    async get(conversationId: string): Promise<Conversation> {
      if (!USE_LOCAL_PROXY) {
        throw new Error("Cloud mode not yet migrated to use this client");
      }

      return fetchFromProxy<Conversation>(
        `/api/conversations/${conversationId}`,
      );
    },

    /**
     * Update conversation (name or model)
     */
    async update(
      conversationId: string,
      updates: { name?: string; model?: string },
    ): Promise<Conversation> {
      if (!USE_LOCAL_PROXY) {
        throw new Error("Cloud mode not yet migrated to use this client");
      }

      return fetchFromProxy<Conversation>(
        `/api/conversations/${conversationId}`,
        {
          method: "PATCH",
          body: JSON.stringify(updates),
        },
      );
    },

    /**
     * Delete a conversation
     */
    async delete(conversationId: string): Promise<void> {
      if (!USE_LOCAL_PROXY) {
        throw new Error("Cloud mode not yet migrated to use this client");
      }

      await fetchFromProxy<void>(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
    },

    /**
     * Get all messages for a conversation
     */
    async getMessages(conversationId: string): Promise<Message[]> {
      if (!USE_LOCAL_PROXY) {
        throw new Error("Cloud mode not yet migrated to use this client");
      }

      return fetchFromProxy<Message[]>(
        `/api/conversations/${conversationId}/messages`,
      );
    },
  },

  messages: {
    /**
     * Create messages (batch)
     */
    async create(messages: Partial<Message>[]): Promise<Message[]> {
      if (!USE_LOCAL_PROXY) {
        throw new Error("Cloud mode not yet migrated to use this client");
      }

      // Ensure all messages have required fields
      const messagesWithUserId = messages.map((msg) => ({
        ...msg,
        userId: msg.userId || LOCAL_USER_ID,
      }));

      return fetchFromProxy<Message[]>("/api/messages", {
        method: "POST",
        body: JSON.stringify(messagesWithUserId),
      });
    },
  },

  ollama: {
    /**
     * Get available Ollama models
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getModels(): Promise<{ object: string; data: any[] }> {
      if (!USE_LOCAL_PROXY) {
        throw new Error("Cloud mode not yet migrated to use this client");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return fetchFromProxy<{ object: string; data: any[] }>(
        "/api/ollama/models",
      );
    },

    /**
     * Check Ollama health/connectivity
     */
    async checkHealth(): Promise<{
      ollama_connected: boolean;
      ollama_url?: string;
      error?: string;
    }> {
      if (!USE_LOCAL_PROXY) {
        throw new Error("Cloud mode not yet migrated to use this client");
      }

      return fetchFromProxy<{
        ollama_connected: boolean;
        ollama_url?: string;
        error?: string;
      }>("/api/ollama/health");
    },
  },

  /**
   * Get the chat API URL for streaming
   */
  getChatApiUrl(): string {
    if (USE_LOCAL_PROXY) {
      return `${PROXY_URL}/api/ollama/chat`;
    }
    return "/api/chat"; // Cloud mode
  },

  /**
   * Check if we're in local proxy mode
   */
  isLocalMode(): boolean {
    return USE_LOCAL_PROXY;
  },

  /**
   * Get the current user ID
   */
  getUserId(): string {
    return LOCAL_USER_ID;
  },
};

export default AssistantAPI;
