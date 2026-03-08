import http from "http";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";

let server: http.Server | null = null;
let workerHealthy = true;

export function setWorkerHealthy(healthy: boolean) {
  workerHealthy = healthy;
}

export function startHealthServer(): http.Server {
  server = http.createServer((req, res) => {
    if (req.url === "/health" && req.method === "GET") {
      const status = workerHealthy ? 200 : 503;
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: workerHealthy ? "ok" : "unhealthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        }),
      );
      return;
    }

    res.writeHead(404);
    res.end();
  });

  server.listen(config.health.port, () => {
    logger.info("health.server.started", { port: config.health.port });
  });

  return server;
}

export function stopHealthServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!server) {
      resolve();
      return;
    }
    server.close(() => {
      logger.info("health.server.stopped");
      resolve();
    });
  });
}
