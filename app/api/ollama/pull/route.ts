import { NextRequest, NextResponse } from "next/server";
import { getUserSettings } from "@/lib/actions/getUserSettings";

export async function POST(req: NextRequest) {
  try {
    const { modelName } = await req.json();

    if (!modelName) {
      return NextResponse.json(
        { error: "Model name is required" },
        { status: 400 }
      );
    }

    const settings = await getUserSettings();
    const baseUrl = settings.ollamaUrl.replace("/v1", "");

    const response = await fetch(`${baseUrl}/api/pull`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: modelName,
        stream: true,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to download model: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    // Stream the response back to the client
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: "Failed to read response stream" },
        { status: 500 }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode the chunk and send it to the client
            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (error) {
          console.error("Error streaming response:", error);
          controller.error(error);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in pull API route:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}