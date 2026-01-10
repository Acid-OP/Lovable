// Orchestrator configuration
export const config = {
  // Cleanup worker settings
  cleanup: {
    idleTimeout: 30 * 60 * 1000, // 30 minutes
    checkInterval: 5 * 60 * 1000, // 5 minutes
    maxContainerAge: 2 * 60 * 60 * 1000, // 2 hours
  },

  // API endpoints
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  },

  // Container settings
  container: {
    port: parseInt(process.env.CONTAINER_PORT || '3003'),
  },
};

