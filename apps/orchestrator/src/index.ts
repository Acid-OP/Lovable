import "dotenv/config";
import { createPromptWorker } from "./workers/promptWorker.js";
import { startCleanupWorker } from "./workers/cleanupWorker.js";

createPromptWorker();
startCleanupWorker();
