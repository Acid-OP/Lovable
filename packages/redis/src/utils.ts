import { redis } from "./index.js";

export const gracefulShutdown = async () => {
  console.log("Redis: Shutting down gracefully...");

  try {
    await redis.quit();
    console.log("Redis: Disconnected successfully");
  } catch (error) {
    console.error("Redis: Error during shutdown:", error);
  }
};
