import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, REQUEST_TIMEOUT } from "@/lib/config/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json({ error: "Invalid jobId" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${BACKEND_URL}/api/v1/session/${jobId}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 },
    );
  }
}
