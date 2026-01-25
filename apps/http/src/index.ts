import "dotenv/config";
import express from "express";
import helmet from "helmet";
import routes from "./routes/index.js";
import { config } from "./config.js";
import { SSEManager } from "./services/SSEManager.js";
import { logger } from "./utils/logger.js";

const app = express();
const PORT = config.server.port;

app.use((req, res, next) => {
  if (req.hostname !== 'localhost' && req.hostname.includes('.')) {
    return next();
  }
  helmet()(req, res, next);
});

app.use(express.json());
app.use(routes);

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

const gracefulShutdown = async () => {
  logger.info('Shutting down HTTP server...');

  server.close(() => {
    logger.info('HTTP server closed');
  });

  await SSEManager.shutdown();

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
