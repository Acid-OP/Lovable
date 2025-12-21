import { redis } from "@repo/redis";
import { SESSION_PREFIX, SESSION_STATUS, SessionData } from "./constants.js";

class SessionManagerClass {
  private getKey(jobId: string) {
    return `${SESSION_PREFIX}${jobId}`;
  }

  async create(jobId: string) {
    await redis.hset(this.getKey(jobId), {
      jobId,
      status: SESSION_STATUS.QUEUED,
      progress: "0",
      createdAt: Date.now().toString(),
    });
  }

  async update(jobId: string, data: SessionData) {
    const flatData: Record<string, string> = {};
    for (const [field, value] of Object.entries(data)) {
      if (value !== undefined) {
        flatData[field] = Array.isArray(value) ? JSON.stringify(value) : String(value);
      }
    }
    if (Object.keys(flatData).length > 0) {
      await redis.hset(this.getKey(jobId), flatData);
    }
  }

  async get(jobId: string): Promise<SessionData | null> {
    const data = await redis.hgetall(this.getKey(jobId));
    if (!data || Object.keys(data).length === 0) return null;
    if (data.errors) {
      try { data.errors = JSON.parse(data.errors); } catch { data.errors = [data.errors]; }
    }
    return data as SessionData;
  }
}

export const SessionManager = new SessionManagerClass();
