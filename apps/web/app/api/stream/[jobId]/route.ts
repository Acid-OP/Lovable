import { NextRequest } from "next/server";
import { BACKEND_URL, API_ENDPOINTS } from "@/lib/config/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;

  if (!jobId) {
    return new Response(JSON.stringify({ error: "jobId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("[SSE] Stream requested", { jobId });

  // Use the configured stream endpoint (respects test mode)
  const backendUrl = `${BACKEND_URL}${API_ENDPOINTS.STREAM_UPDATES}/${jobId}`;

  try {
    // Fetch from backend SSE endpoint
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    if (!response.ok) {
      console.error("[SSE] Backend stream error", {
        status: response.status,
        statusText: response.statusText,
      });
      return new Response(
        JSON.stringify({
          error: "Failed to connect to backend stream",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Create a TransformStream to proxy the SSE data
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Pipe backend SSE to frontend
    (async () => {
      try {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log("[SSE] Stream completed", { jobId });
            await writer.close();
            break;
          }

          // Forward the chunk to the client
          await writer.write(value);
        }
      } catch (error) {
        console.error("[SSE] Streaming error", {
          jobId,
          error: error instanceof Error ? error.message : String(error),
        });
        // Only close if not already closed
        try {
          await writer.close();
        } catch {
          // Writer already closed, ignore
        }
      }
    })();

    // Return SSE response
    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("[SSE] Proxy error", {
      jobId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({
        error: "Failed to establish stream connection",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
