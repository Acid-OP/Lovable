import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes/index.js";
import { config } from "./config.js";
import { SSEManager } from "./services/SSEManager.js";
import { logger } from "./utils/logger.js";

const app = express();
const PORT = config.server.port;

const allowedOrigins = (
  process.env.CORS_ORIGINS || "http://localhost:4050,http://localhost:3000"
)
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    // Disable X-Frame-Options — sandbox iframes need to embed previews
    frameguard: false,
    // Disable CSP — sandbox previews load scripts/styles from container origins
    contentSecurityPolicy: false,
    // Disable COEP — cross-origin requests to sandbox containers need to work
    crossOriginEmbedderPolicy: false,
    // Keep everything else: nosniff, HSTS, XSS, referrer-policy, etc.
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(routes);

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

const gracefulShutdown = async () => {
  logger.info("Shutting down HTTP server...");

  server.close(() => {
    logger.info("HTTP server closed");
  });

  await SSEManager.shutdown();

  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
