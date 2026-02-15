import { NextRequest, NextResponse } from "next/server";
import type { ApiErrorResponse, FetchFilesResponse } from "@/lib/types/api";
import { BACKEND_URL, REQUEST_TIMEOUT } from "@/lib/config/api";
import { logger } from "@/lib/utils/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;

    // Validate jobId
    if (!jobId || typeof jobId !== "string") {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: "Invalid jobId",
        details: "jobId parameter is required and must be a string",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Call backend API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/files/${jobId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse backend response
      const data = await response.json();

      if (!response.ok) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: data.error || "Backend request failed",
          details: data.details,
        };
        return NextResponse.json(errorResponse, { status: response.status });
      }

      // Success response
      const successResponse: FetchFilesResponse = {
        success: true,
        data: data,
      };

      return NextResponse.json(successResponse, { status: 200 });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle timeout or network errors
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: "Request timeout",
          details: "Backend did not respond in time",
        };
        return NextResponse.json(errorResponse, { status: 504 });
      }

      throw fetchError;
    }
  } catch (error) {
    logger.error("Fetch files error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
