import { NextRequest } from "next/server";
import { BACKEND_URL } from "@/lib/config/api";
import { logger } from "@/lib/utils/logger";

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

  logger.info("SSE stream requested", { jobId });

  const backendUrl = `${BACKEND_URL}/api/v1/stream/${jobId}`;

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
      logger.error("Backend stream error", {
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
            logger.info("SSE stream completed", { jobId });
            await writer.close();
            break;
          }

          // Forward the chunk to the client
          await writer.write(value);
        }
      } catch (error) {
        logger.error("SSE streaming error", {
          jobId,
          error: error instanceof Error ? error.message : String(error),
        });
        await writer.close();
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
    logger.error("SSE proxy error", {
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
