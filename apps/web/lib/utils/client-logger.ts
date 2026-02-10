/**
 * Client-safe logger wrapper
 * Uses the server-side logger when available (server components/API routes)
 * Falls back to console when in browser (client components)
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

interface Logger {
  info: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown> | Error) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  debug: (message: string, context?: Record<string, unknown>) => void;
}

// Server-side logger (only imported on server)
let serverLogger: Logger | null = null;
if (!isBrowser) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    serverLogger = require("./logger").logger as Logger;
  } catch {
    // Fallback if import fails
  }
}

interface LogContext {
  [key: string]: unknown;
}

function formatMessage(message: string, context?: LogContext): string {
  if (!context) return message;
  return `${message} ${JSON.stringify(context)}`;
}

export const logger = {
  info: (message: string, context?: LogContext) => {
    if (serverLogger) {
      serverLogger.info(message, context);
    } else {
      console.log(`[INFO] ${formatMessage(message, context)}`);
    }
  },

  error: (message: string, context?: LogContext | Error) => {
    if (serverLogger) {
      serverLogger.error(message, context);
    } else {
      console.error(`[ERROR] ${formatMessage(message, context as LogContext)}`);
    }
  },

  warn: (message: string, context?: LogContext) => {
    if (serverLogger) {
      serverLogger.warn(message, context);
    } else {
      console.warn(`[WARN] ${formatMessage(message, context)}`);
    }
  },

  debug: (message: string, context?: LogContext) => {
    if (serverLogger) {
      serverLogger.debug(message, context);
    } else {
      console.debug(`[DEBUG] ${formatMessage(message, context)}`);
    }
  },
};
