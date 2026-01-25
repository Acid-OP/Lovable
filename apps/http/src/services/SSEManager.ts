import { Response } from 'express';
import { redis } from '@repo/redis';

type RedisClient = typeof redis;

export class SSEManagerClass {
  private static instance: SSEManagerClass;
  private subscribers: Map<string, RedisClient>;
  private clients: Map<string, Set<Response>>;

  private constructor() {
    this.subscribers = new Map();
    this.clients = new Map();
  }

  public static getInstance(): SSEManagerClass {
    if (!this.instance) {
      this.instance = new SSEManagerClass();
    }
    return this.instance;
  }

  public async addClient(jobId: string, res: Response): Promise<void> {
    const channel = `job:${jobId}`;

    if (!this.clients.has(channel)) {
      this.clients.set(channel, new Set());
    }
    this.clients.get(channel)!.add(res);

    if (!this.subscribers.has(channel)) {
      await this.createSubscriber(channel);
    }
    console.log(`Client added to ${channel}. Total clients: ${this.clients.get(channel)!.size}`);
  }

  private async createSubscriber(channel: string): Promise<void> {
    const subscriber = redis.duplicate();

    await subscriber.subscribe(channel);
    console.log(`Subscribed to ${channel}`);

    subscriber.on('message', (ch: string, message: string) => {
      if (ch === channel) {
        this.broadcast(channel, message);
      }
    });

    subscriber.on('error', (err: Error) => {
      console.error(`Subscriber error for ${channel}:`, err.message);
    });

    this.subscribers.set(channel, subscriber);
  }

  public async removeClient(jobId: string, res: Response): Promise<void> {
    const channel = `job:${jobId}`;
    const clientSet = this.clients.get(channel);

    if (!clientSet) return;

    clientSet.delete(res);
    console.log(`Client removed from ${channel}. Remaining: ${clientSet.size}`);

    // If no more clients, unsubscribe and cleanup
    if (clientSet.size === 0) {
      await this.destroySubscriber(channel);
      this.clients.delete(channel);
    }
  }

  private broadcast(channel: string, message: string): void {
    const clientSet = this.clients.get(channel);
    if (!clientSet) return;

    const deadClients: Response[] = [];

    clientSet.forEach((res) => {
      try {
        res.write(`data: ${message}\n\n`);
      } catch (error) {
        console.error(`Failed to write to client on ${channel}:`, error);
        deadClients.push(res);
      }
    });

    // Remove dead clients
    deadClients.forEach((res) => {
      clientSet.delete(res);
    });

    if (deadClients.length > 0) {
      console.log(`Removed ${deadClients.length} dead clients from ${channel}`);
    }
  }

  private async destroySubscriber(channel: string): Promise<void> {
    const subscriber = this.subscribers.get(channel);
    if (!subscriber) return;

    await subscriber.unsubscribe(channel);
    await subscriber.quit();
    this.subscribers.delete(channel);
    console.log(`Unsubscribed from ${channel}`);
  }

  public async shutdown(): Promise<void> {
    console.log('Shutting down SSE Manager...');

    // Notify all clients
    for (const clientSet of this.clients.values()) {
      clientSet.forEach((res) => {
        try {
          res.write(`data: ${JSON.stringify({ status: 'server_shutdown' })}\n\n`);
          res.end();
        } catch (err) {
          console.error('Error closing client:', err);
        }
      });
    }

    // Unsubscribe all
    for (const [channel, subscriber] of this.subscribers.entries()) {
      await subscriber.unsubscribe(channel);
      await subscriber.quit();
    }

    this.clients.clear();
    this.subscribers.clear();
    console.log('SSE Manager shutdown complete');
  }
}

export const SSEManager = SSEManagerClass.getInstance();
