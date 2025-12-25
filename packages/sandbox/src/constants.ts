export const DOCKER_SOCKET =
  process.env.DOCKER_SOCKET || "//./pipe/docker_engine";

export const DEFAULT_IMAGE = process.env.SANDBOX_IMAGE || "node:20";

export const CONTAINER_CONFIG = {
  MEMORY_LIMIT: 512 * 1024 * 1024, // 512MB
  WORKING_DIR: "/workspace",
};

