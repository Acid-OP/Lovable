export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001'),
  },

  container: {
    port: parseInt(process.env.CONTAINER_PORT || '3003'),
    baseUrl: process.env.CONTAINER_BASE_URL || 'http://localhost:3003',
  },
};

