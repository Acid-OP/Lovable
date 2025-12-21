import "dotenv/config";
import { Redis } from "ioredis";
import { createPromptWorker } from "./workers/promptWorker.js";

const connection = new Redis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

createPromptWorker(connection);