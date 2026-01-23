import { WebSocketServer } from "ws";
import { redis } from "@repo/redis";

const PORT = parseInt(process.env.WS_PORT || "3002");
const wss = new WebSocketServer({ port: PORT });

const subscriber = redis.duplicate();
const clientChannels = new Map<any, string>();

wss.on("connection", async (ws, req) => {
  const url = new URL(req.url || "", `ws://localhost:${PORT}`);
  const jobId = url.searchParams.get("jobId");

  if (!jobId) {
    ws.close(1008, "Missing jobId");
    return;
  }

  const channel = `job:${jobId}`;
  await subscriber.subscribe(channel);
  clientChannels.set(ws, channel);

  ws.on("close", () => {
    clientChannels.delete(ws);
    subscriber.unsubscribe(channel);
  });
});

subscriber.on("message", (channel: string, message: string) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && clientChannels.get(client) === channel) {
      client.send(message);
    }
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
