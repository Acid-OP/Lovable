import "dotenv/config";
import { SandboxManager } from "@repo/sandbox";
import { gracefulShutdown as redisShutdown } from "@repo/redis/utils";
import { createPromptWorker } from "./workers/promptWorker.js";
import {
  startCleanupWorker,
  stopCleanupWorker,
} from "./workers/cleanupWorker.js";
import { startHealthServer, stopHealthServer } from "./healthServer.js";
import { logger } from "./utils/logger.js";

const SHUTDOWN_TIMEOUT_MS = 30_000;

(async () => {
  logger.info("startup.cleanup.start", {
    message: "Cleaning up orphaned containers",
  });
  await SandboxManager.getInstance().cleanupOldContainers();
  logger.info("startup.cleanup.complete", { message: "Cleanup complete" });

  const promptWorker = createPromptWorker();
  startCleanupWorker();
  startHealthServer();

  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info("orchestrator.shutdown.start", {
      signal,
      message: "Graceful shutdown initiated",
    });

    // Force exit if shutdown takes too long
    const forceTimer = setTimeout(() => {
      logger.error("orchestrator.shutdown.timeout", {
        message: `Shutdown timed out after ${SHUTDOWN_TIMEOUT_MS / 1000}s, forcing exit`,
      });
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceTimer.unref();

    try {
      // 1. Stop accepting new jobs, wait for current jobs to finish
      logger.info("orchestrator.shutdown.worker", {
        message: "Closing prompt worker (waiting for active jobs)...",
      });
      await promptWorker.close();
      logger.info("orchestrator.shutdown.worker.done", {
        message: "Prompt worker closed",
      });

      // 2. Stop cleanup interval and clean up containers
      await stopCleanupWorker();

      // 3. Stop health server
      await stopHealthServer();

      // 4. Close Redis connection
      await redisShutdown();

      logger.info("orchestrator.shutdown.complete", {
        message: "Graceful shutdown complete",
      });
    } catch (error) {
      logger.error("orchestrator.shutdown.error", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error("unhandledRejection", {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });

  process.on("uncaughtException", (error) => {
    logger.error("uncaughtException", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
})();
