import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, REQUEST_TIMEOUT } from "@/lib/config/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid jobId" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/runtime-report/${jobId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);
      const data = await response.json();

      return NextResponse.json(data, { status: response.status });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { success: false, error: "Request timeout" },
          { status: 504 },
        );
      }

      throw fetchError;
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to forward runtime report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
