import { NextRequest, NextResponse } from "next/server";
import { promptSchema } from "@/lib/validations/prompt";
import type { ApiErrorResponse, SubmitPromptResponse } from "@/lib/types/api";
import { BACKEND_URL, REQUEST_TIMEOUT, API_ENDPOINTS } from "@/lib/config/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = promptSchema.safeParse(body);

    if (!validation.success) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: "Invalid input",
        details: validation.error.message,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { prompt, previousJobId } = validation.data;

    // Call backend API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(
        `${BACKEND_URL}${API_ENDPOINTS.SUBMIT_PROMPT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, previousJobId }),
          signal: controller.signal,
        },
      );

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
      const successResponse: SubmitPromptResponse = {
        success: true,
        data: {
          message: data.message,
          jobId: data.jobId,
          clientId: data.clientId,
          isIteration: data.isIteration,
        },
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
    console.error("[API] Submit prompt error:", error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
