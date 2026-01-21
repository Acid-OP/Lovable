import { WebSocketServer } from "ws";

const PORT = parseInt(process.env.WS_PORT || "3002");

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.on("message", (data) => console.log("Received:", data.toString()));
  ws.on("close", () => console.log("Client disconnected"));
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
