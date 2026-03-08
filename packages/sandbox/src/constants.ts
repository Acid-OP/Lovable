export const DOCKER_SOCKET =
  process.env.DOCKER_SOCKET || "//./pipe/docker_engine";

export const DEFAULT_IMAGE = process.env.SANDBOX_IMAGE || "lovable-sandbox";

export const DOCKER_NETWORK =
  process.env.DOCKER_NETWORK || "lovable_sandbox-network";

export const CONTAINER_CONFIG = {
  MEMORY_LIMIT: 512 * 1024 * 1024,
  MEMORY_SWAP: 512 * 1024 * 1024, // Same as memory limit — disables swap
  CPU_PERIOD: 100_000, // Default 100ms period
  CPU_QUOTA: 100_000, // 1 CPU core max (quota/period = 1.0)
  PIDS_LIMIT: 256, // Prevent fork bombs
  WORKING_DIR: "/workspace",
};
