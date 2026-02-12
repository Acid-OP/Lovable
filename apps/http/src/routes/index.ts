import { Router } from "express";
import promptRouter from "./prompt.js";
import testerRouter from "./tester.js";
import { previewRouter } from "./preview.js";
import { streamRouter } from "./stream.js";
import streamTesterRouter from "./streamTester.js";
import { healthCheckRouter } from "./healthCheck.js";
import usageRouter from "./usage.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/api/v1/prompt-test", testerRouter); // Test endpoint
router.use("/api/v1/prompt", promptRouter); // Real prompt endpoint

router.use("/api/v1/usage", usageRouter);
router.use("/internal", healthCheckRouter);

router.use("/api/v1/stream-test", streamTesterRouter); // Test endpoint
router.use(streamRouter); // Real SSE endpoint

router.use(previewRouter);
export default router;
