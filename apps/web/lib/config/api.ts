// API Configuration
export const BACKEND_URL =
  process.env.BACKEND_API_URL || "http://localhost:3001";

/**
 * Requests will be aborted after this duration
 */
export const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * Testing mode - set to true to use mock endpoints (saves tokens)
 */
export const USE_TEST_ENDPOINTS = true;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  SUBMIT_PROMPT: USE_TEST_ENDPOINTS ? "/api/v1/prompt-test" : "/api/v1/prompt",
  STREAM_UPDATES: USE_TEST_ENDPOINTS ? "/api/v1/stream-test" : "/api/v1/stream",
} as const;
