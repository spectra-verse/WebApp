/**
 * Client-side Ollama API utilities
 * These functions run in the browser and connect directly to the user's local Ollama instance
 */

export interface OllamaMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

/**
 * Calls Ollama chat API with streaming support
 * Automatically detects and routes through local proxy if enabled
 * @param baseUrl - The base URL of the Ollama server (e.g., http://localhost:11434)
 * @param request - The chat request payload
 * @param onChunk - Callback for each streaming chunk
 * @param conversationId - Optional conversation ID for proxy mode
 */
export async function streamOllamaChat(
  baseUrl: string,
  request: OllamaChatRequest,
  onChunk: (content: string, done: boolean) => void,
  conversationId?: string,
): Promise<void> {
  // Check if using local proxy mode
  const useLocalProxy = process.env.NEXT_PUBLIC_USE_LOCAL_PROXY === "true";
  const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL || "http://localhost:8190";

  // Debug logging
  console.log("[streamOllamaChat] useLocalProxy:", useLocalProxy);
  console.log("[streamOllamaChat] conversationId:", conversationId);
  console.log("[streamOllamaChat] proxyUrl:", proxyUrl);

  if (useLocalProxy && conversationId) {
    console.log("[streamOllamaChat] Using proxy mode");
    // Use local proxy with OpenAI-compatible SSE streaming
    return await streamViaProxy(proxyUrl, request, onChunk, conversationId);
  }

  console.log("[streamOllamaChat] Using direct Ollama mode");

  // Direct Ollama connection (original behavior)
  // Remove /v1 suffix if present and use Ollama's native API
  const cleanBaseUrl = baseUrl.replace(/\/v1\/?$/, "");
  const url = `${cleanBaseUrl}/api/chat`;
  console.log(url);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...request,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status} ${response.statusText}`,
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete JSON lines
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data: OllamaChatResponse = JSON.parse(line);
            onChunk(data.message.content, data.done);
          } catch (e) {
            console.error("Failed to parse JSON:", e, line);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Stream chat via local proxy (Server-Sent Events format)
 */
async function streamViaProxy(
  proxyUrl: string,
  request: OllamaChatRequest,
  onChunk: (content: string, done: boolean) => void,
  conversationId: string,
): Promise<void> {
  const url = `${proxyUrl}/api/ollama/chat`;

  const requestBody = {
    model: request.model,
    messages: request.messages,
    conversationId,
  };

  console.log("[streamViaProxy] Fetching URL:", url);
  console.log("[streamViaProxy] Request body:", JSON.stringify(requestBody, null, 2));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  console.log("[streamViaProxy] Response status:", response.status);
  console.log("[streamViaProxy] Response ok:", response.ok);

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unable to read error");
    console.error("[streamViaProxy] Error response:", errorText);
    throw new Error(
      `Proxy request failed: ${response.status} ${response.statusText}`,
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE lines
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6); // Remove "data: " prefix

          try {
            const event = JSON.parse(data);

            if (event.type === "text-delta" && event.textDelta) {
              onChunk(event.textDelta, false);
            } else if (event.type === "finish") {
              onChunk("", true);
            }
          } catch (e) {
            console.error("Failed to parse SSE data:", e, data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Fetches available models from Ollama
 * @param baseUrl - The base URL of the Ollama server
 */
export async function fetchClientOllamaModels(baseUrl: string) {
  const cleanBaseUrl = baseUrl.replace(/\/v1\/?$/, "");
  const url = `${cleanBaseUrl}/api/tags`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }

  const data = await response.json();
  return data.models || [];
}

/**
 * Fetches detailed information about a specific model
 * @param baseUrl - The base URL of the Ollama server
 * @param modelName - The name of the model to get details for
 */
export async function fetchClientOllamaModelDetails(
  baseUrl: string,
  modelName: string,
) {
  const cleanBaseUrl = baseUrl.replace(/\/v1\/?$/, "");
  const url = `${cleanBaseUrl}/api/show`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: modelName }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch model details: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Tests connection to Ollama server
 * @param baseUrl - The base URL of the Ollama server
 */
export async function testClientOllamaConnection(baseUrl: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const cleanBaseUrl = baseUrl.replace(/\/v1\/?$/, "");
    const url = `${cleanBaseUrl}/api/tags`;

    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: `Connection failed: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    const modelCount = data.models?.length || 0;

    return {
      success: true,
      message: `Connected successfully! Found ${modelCount} model(s)`,
    };
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      return {
        success: false,
        error:
          "Cannot connect to Ollama. Check if:\n1. Ollama is running\n2. URL is correct\n3. CORS is enabled",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
