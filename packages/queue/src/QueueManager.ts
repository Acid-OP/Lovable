import { Queue } from "bullmq";
import * as IORedis from "ioredis";
import { QUEUE_NAMES, JOB_NAMES } from "./constants.js";

const Redis = (IORedis as any).default || IORedis;
type RedisClient = InstanceType<typeof Redis>;

export class QueueManager {
  private queue: Queue;
  private static instance: QueueManager;
  private connection: RedisClient;

  private constructor() {
    this.connection = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue(QUEUE_NAMES.PROMPT_QUEUE, {
      connection: this.connection,
    });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new QueueManager();
    }
    return this.instance;
  }

  getConnection() {
    return this.connection;
  }

  createId() {
    const id =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    return id;
  }

  async pushToQueue(prompt: string) {
    const clientId = this.createId();
    const job = await this.queue.add(JOB_NAMES.PROCESS_PROMPT, {
      clientId,
      prompt,
      timestamp: Date.now(),
    });
    return { jobId: job.id, clientId };
  }
}

