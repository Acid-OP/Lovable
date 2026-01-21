import { WebSocketServer } from "ws";
import { redis } from "@repo/redis";

const PORT = parseInt(process.env.WS_PORT || "3002");
const wss = new WebSocketServer({ port: PORT });
const subscriber = redis.duplicate();

wss.on("connection", (ws, req) => {
  console.log("Client connected");
  console.log("URL:", req.url);      
  console.log("Headers:", req.headers);   

  // Parse jobId from URL: ws://localhost:3002/?jobId=5
  const url = new URL(req.url || "", `ws://localhost:${PORT}`);
  const jobId = url.searchParams.get("jobId");

  console.log("JobId:", jobId);

  if (!jobId) {
    ws.close(1008, "Missing jobId");
    return;
  }

  // Subscribe to Redis channel for this job
  const channel = `job:${jobId}`;
  subscriber.subscribe(channel);
  console.log(`Subscribed to ${channel}`);

  ws.on("close", () => {
    console.log("Client disconnected");
    subscriber.unsubscribe(channel);
  });
});

// Forward Redis messages to WebSocket clients
subscriber.on("message", (channel: string, message: string) => {
  console.log(`Redis [${channel}]:`, message);
  
  // Send to all connected clients (simple broadcast)
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
