import { Router } from "express";
import promptRouter from "./prompt.js";
import testerRouter from "./tester.js";
import { previewRouter } from "./preview.js";
import { streamRouter } from "./stream.js";
import { healthCheckRouter } from "./healthCheck.js";
import usageRouter from "./usage.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Using tester endpoint for testing (replace with promptRouter for production)
router.use("/api/v1/prompt", testerRouter);
// router.use("/api/v1/prompt", promptRouter);
router.use("/api/v1/usage", usageRouter);
router.use("/internal", healthCheckRouter);
router.use(streamRouter);
router.use(previewRouter);
export default router;
