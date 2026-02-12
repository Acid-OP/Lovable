import { Router } from "express";
import { logger } from "../utils/logger";

const router = Router();

// Mock session logs for testing
const MOCK_LOGS = [
  { currentStep: "Initializing workspace", delay: 600 },
  { currentStep: "Analyzing requirements", delay: 700 },
  { currentStep: "Setting up project structure", delay: 800 },
  { currentStep: "Installing core dependencies", delay: 900 },
  { currentStep: "Configuring TypeScript", delay: 600 },
  { currentStep: "Setting up build pipeline", delay: 700 },
  { currentStep: "Creating component architecture", delay: 800 },
  { currentStep: "Generating UI components", delay: 900 },
  { currentStep: "Setting up routing system", delay: 700 },
  { currentStep: "Configuring state management", delay: 600 },
  { currentStep: "Installing UI libraries", delay: 800 },
  { currentStep: "Setting up styling system", delay: 700 },
  { currentStep: "Creating page templates", delay: 900 },
  { currentStep: "Configuring API integration", delay: 800 },
  { currentStep: "Setting up authentication", delay: 700 },
  { currentStep: "Optimizing bundle size", delay: 600 },
  { currentStep: "Running type checks", delay: 700 },
  { currentStep: "Running linter", delay: 600 },
  { currentStep: "Building production bundle", delay: 900 },
  { currentStep: "Finalizing deployment", delay: 700 },
  {
    type: "code",
    files: [
      {
        path: "index.tsx",
        content: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="container">\n      <h1>Hello World</h1>\n      <p>This is a test application</p>\n    </div>\n  );\n}`,
        language: "typescript",
      },
      {
        path: "styles.css",
        content: `.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 2rem;\n}\n\nh1 {\n  color: #333;\n  font-size: 2.5rem;\n}`,
        language: "css",
      },
    ],
    delay: 800,
  },
  { type: "complete", status: "completed", delay: 1000 },
];

router.get("/:jobId", (req, res) => {
  const { jobId } = req.params;

  logger.info("[SSE Tester] Test stream requested", { jobId });

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  // Send initial connection event
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      status: "connected",
      jobId,
      message: "Test session started (mock data)",
    })}\n\n`,
  );

  let currentIndex = 0;

  const sendNextLog = () => {
    if (currentIndex >= MOCK_LOGS.length) {
      logger.info("[SSE Tester] Test stream completed", { jobId });
      res.end();
      return;
    }

    const log = MOCK_LOGS[currentIndex];
    if (!log) {
      res.end();
      return;
    }

    currentIndex++;

    // Send the log event
    res.write(`data: ${JSON.stringify(log)}\n\n`);

    // Schedule next log
    if (currentIndex < MOCK_LOGS.length) {
      setTimeout(sendNextLog, log.delay);
    } else {
      // End stream after last message
      setTimeout(() => {
        res.end();
      }, log.delay);
    }
  };

  // Start sending logs after initial delay
  setTimeout(sendNextLog, 500);

  // Handle client disconnect
  req.on("close", () => {
    logger.info("[SSE Tester] Client disconnected", { jobId });
    res.end();
  });
});

export default router;
