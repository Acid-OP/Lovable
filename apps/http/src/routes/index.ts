import { Router } from "express";
import promptRouter from "./prompt.js";
import { previewRouter } from "./preview.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/api/v1/prompt", promptRouter);
router.use(previewRouter);

export default router;

