// Orchestrator configuration
export const config = {
  // Cleanup worker settings
  cleanup: {
    idleTimeout: 30 * 60 * 1000,
    checkInterval: 5 * 60 * 1000,
    maxContainerAge: 2 * 60 * 60 * 1000,
  },

  api: {
    baseUrl: process.env.API_BASE_URL || "http://localhost:3001",
    // HTTP service URL for internal API calls (health check, etc.)
    // Uses host.docker.internal in Docker, can be configured for production
    httpServiceUrl:
      process.env.HTTP_SERVICE_URL || "http://host.docker.internal:3001",
  },

  // Container settings
  container: {
    port: parseInt(process.env.CONTAINER_PORT || "3003"),
  },
};
