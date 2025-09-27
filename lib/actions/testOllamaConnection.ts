"use server";

export async function testOllamaConnection(ollamaUrl: string) {
  try {
    // Normalize URL format
    const baseUrl = ollamaUrl.endsWith('/v1') ? ollamaUrl.replace('/v1', '') : ollamaUrl;
    const testUrl = `${baseUrl}/api/tags`;

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: `Connected successfully. Found ${data.models?.length || 0} models.`,
      models: data.models || [],
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return {
          success: false,
          error: 'Connection timeout. Please check if Ollama is running and accessible.',
        };
      }
      return {
        success: false,
        error: `Connection failed: ${error.message}`,
      };
    }

    return {
      success: false,
      error: 'Unknown connection error occurred.',
    };
  }
}