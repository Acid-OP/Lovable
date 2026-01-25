import "dotenv/config";
import express from "express";
import helmet from "helmet";
import routes from "./routes/index.js";
import { config } from "./config.js";

const app = express();
const PORT = config.server.port;

app.use((req, res, next) => {
  if (req.hostname !== 'localhost' && req.hostname.includes('.')) {
    return next();
  }
  helmet()(req, res, next);
});

app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
