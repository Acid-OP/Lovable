import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { prisma } from "@repo/db";
import routes from "./routes/index.js";
import { config } from "./config.js";

const app = express();
const PORT = config.server.port;

app.use(helmet());
app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
