import { SessionManager, SESSION_STATUS } from "@repo/session";
import { createSandboxProvider } from "@repo/sandbox";
import { redis } from "@repo/redis";
import { logger } from "../utils/logger.js";
import { config } from "../config.js";

const IDLE_TIMEOUT = config.cleanup.idleTimeout;
const CLEANUP_INTERVAL = config.cleanup.checkInterval;
const MAX_CONTAINER_AGE = config.cleanup.maxContainerAge;
const SCAN_BATCH_SIZE = 100;

async function scanSessionKeys(): Promise<string[]> {
  const keys: string[] = [];
  const stream = redis.scanStream({
    match: "session:job:*",
    count: SCAN_BATCH_SIZE,
  });

  return new Promise((resolve, reject) => {
    stream.on("data", (batch: string[]) => {
      keys.push(...batch);
    });
    stream.on("end", () => resolve(keys));
    stream.on("error", reject);
  });
}

let cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

export function startCleanupWorker() {
  logger.info("cleanup.worker.starting", {
    idleTimeout: IDLE_TIMEOUT / 60000 + " minutes",
    checkInterval: CLEANUP_INTERVAL / 60000 + " minutes",
    maxAge: MAX_CONTAINER_AGE / 60000 + " minutes",
  });

  cleanupIntervalId = setInterval(async () => {
    try {
      await runCleanup();
    } catch (error) {
      logger.error("cleanup.worker.error", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }, CLEANUP_INTERVAL);

  logger.info("cleanup.worker.started", {
    message: "Cleanup worker is running",
  });
}

export async function stopCleanupWorker() {
  logger.info("cleanup.worker.shutdown", {
    message: "Stopping cleanup worker",
  });

  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }

  try {
    await cleanupAllContainers();
    logger.info("cleanup.worker.shutdown.complete", {
      message: "All containers cleaned up",
    });
  } catch (error) {
    logger.error("cleanup.worker.shutdown.error", { error });
  }
}

async function runCleanup() {
  logger.info("cleanup.check.start", { timestamp: new Date().toISOString() });

  const keys = await scanSessionKeys();
  let checkedCount = 0;
  let killedCount = 0;

  for (const key of keys) {
    try {
      const jobId = key.replace("session:job:", "");
      const session = await SessionManager.get(jobId);

      if (!session?.containerId) {
        continue;
      }

      checkedCount++;

      // Destroy containers for failed jobs immediately
      if (session.status === SESSION_STATUS.FAILED) {
        await killContainer(jobId, session.containerId, "job_failed", 0);
        killedCount++;
        continue;
      }

      const now = Date.now();
      const createdAt = parseInt(session.createdAt || "0");
      const lastActivity = parseInt(
        session.lastActivity || session.createdAt || "0",
      );

      const age = now - createdAt;
      const idle = now - lastActivity;

      // Check if container exceeded absolute max age
      if (age > MAX_CONTAINER_AGE) {
        await killContainer(
          jobId,
          session.containerId,
          "max_age_exceeded",
          age,
        );
        killedCount++;
        continue;
      }

      // Check if container is idle for too long
      if (idle > IDLE_TIMEOUT) {
        await killContainer(jobId, session.containerId, "idle_timeout", idle);
        killedCount++;
        continue;
      }

      logger.info("cleanup.check.skip", {
        jobId,
        containerId: session.containerId.slice(0, 12),
        age: Math.floor(age / 60000) + "m",
        idle: Math.floor(idle / 60000) + "m",
      });
    } catch (error) {
      logger.error("cleanup.check.error", {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.info("cleanup.check.complete", {
    checked: checkedCount,
    killed: killedCount,
    timestamp: new Date().toISOString(),
  });
}

async function killContainer(
  jobId: string,
  containerId: string,
  reason: string,
  timeMs: number,
) {
  try {
    // Re-check session status to avoid race with prompt worker picking up the container
    const freshSession = await SessionManager.get(jobId);
    if (
      freshSession?.status === SESSION_STATUS.QUEUED ||
      freshSession?.status === SESSION_STATUS.PROCESSING
    ) {
      logger.info("cleanup.container.skipped", {
        jobId,
        containerId: containerId.slice(0, 12),
        reason: "session_active",
        status: freshSession.status,
      });
      return;
    }

    const sandbox = createSandboxProvider();
    await sandbox.destroy(containerId);

    await SessionManager.update(jobId, {
      status: SESSION_STATUS.COMPLETED,
      currentStep: `Container auto-stopped: ${reason}`,
      completedAt: Date.now().toString(),
    });

    logger.info("cleanup.container.killed", {
      jobId,
      containerId: containerId.slice(0, 12),
      reason,
      time: Math.floor(timeMs / 60000) + " minutes",
    });
  } catch (error) {
    logger.error("cleanup.container.kill.error", {
      jobId,
      containerId: containerId.slice(0, 12),
      reason,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function cleanupAllContainers() {
  const keys = await scanSessionKeys();

  for (const key of keys) {
    try {
      const jobId = key.replace("session:job:", "");
      const session = await SessionManager.get(jobId);

      if (session?.containerId) {
        const sandbox = createSandboxProvider();
        await sandbox.destroy(session.containerId);

        await SessionManager.update(jobId, {
          status: SESSION_STATUS.COMPLETED,
          currentStep: "Container stopped due to server shutdown",
        });

        logger.info("cleanup.shutdown.container", {
          jobId,
          containerId: session.containerId.slice(0, 12),
        });
      }
    } catch (error) {
      logger.error("cleanup.shutdown.error", { key, error });
    }
  }
}
