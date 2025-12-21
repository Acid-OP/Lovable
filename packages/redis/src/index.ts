import * as IORedis from "ioredis";

const Redis = (IORedis as any).default || IORedis;

export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});
