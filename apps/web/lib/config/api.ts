// API Configuration

/**
 * Backend API base URL
 * - Development: http://localhost:3001
 * - Production: Should be set via BACKEND_API_URL env variable
 */
export const BACKEND_URL =
  process.env.BACKEND_API_URL || "http://localhost:3001";

/**
 * Request timeout in milliseconds
 * Requests will be aborted after this duration
 */
export const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  SUBMIT_PROMPT: "/api/v1/prompt",
  STREAM_UPDATES: "/api/v1/stream",
} as const;
