import * as IORedis from "ioredis";
import { gracefulShutdown } from "./utils.js";

const Redis = (IORedis as any).default || IORedis;

export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  connectTimeout: 10000,
  keepAlive: 30000,
  maxRetriesPerRequest: null,

  retryStrategy(times: number) {
    if (times > 10) {
      console.error("Redis: Max retry attempts reached. Giving up.");
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    console.log(`Redis: Reconnecting in ${delay}ms (attempt ${times}/10)`);
    return delay;
  },

  reconnectOnError(err: Error) {
    const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"];

    for (const targetError of targetErrors) {
      if (err.message.includes(targetError)) {
        console.log(`Redis: Reconnecting due to error: ${targetError}`);
        return true;
      }
    }
    return false;
  },
  lazyConnect: false,
  enableAutoPipelining: true,

  autoReconnect: true,
  autoResendUnfulfilledCommands: true,
});

redis.on("connect", () => {
  console.log("Redis: Connected successfully");
});

redis.on("error", (err: Error) => {
  console.error(" Redis error:", err.message);

  if (err.message.includes("ECONNREFUSED")) {
    console.error("Redis: Connection refused. Is Redis running?");
  } else if (err.message.includes("ETIMEDOUT")) {
    console.error(" Redis: Connection timeout");
  }
});

redis.on("reconnecting", (delay: number) => {
  console.log(`Redis: Reconnecting in ${delay}ms...`);
});

redis.on("close", () => {
  console.warn("Redis: Connection closed");
});

redis.on("end", () => {
  console.error("Redis: Connection ended. No more reconnection attempts.");
});

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
