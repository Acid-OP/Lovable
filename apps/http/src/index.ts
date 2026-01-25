import "dotenv/config";
import express from "express";
import helmet from "helmet";
import routes from "./routes/index.js";
import { config } from "./config.js";
import { SSEManager } from "./services/SSEManager.js";

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
  console.log(`Server running on http://localhost:${PORT}`);
});

const gracefulShutdown = async () => {
  console.log('Shutting down HTTP server...');

  server.close(() => {
    console.log('HTTP server closed');
  });

  await SSEManager.shutdown();

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
