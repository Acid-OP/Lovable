import "dotenv/config";
import { SandboxManager } from "@repo/sandbox";
import { createPromptWorker } from "./workers/promptWorker.js";
import { startCleanupWorker } from "./workers/cleanupWorker.js";
import { logger } from "./utils/logger.js";

// Clean up orphaned containers from previous runs on startup
(async () => {
  logger.info("startup.cleanup.start", {
    message: "Cleaning up orphaned containers",
  });
  await SandboxManager.getInstance().cleanupOldContainers();
  logger.info("startup.cleanup.complete", { message: "Cleanup complete" });

  createPromptWorker();
  startCleanupWorker();
})();
