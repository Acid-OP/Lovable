import { Router } from "express";
import { logger } from "../utils/logger";

const router = Router();

// Mock session logs for testing
// Frontend controls pacing - no artificial delays here
const MOCK_LOGS = [
  { currentStep: "Initializing workspace" },
  { currentStep: "Analyzing requirements" },
  { currentStep: "Setting up project structure" },
  { currentStep: "Installing core dependencies" },
  { currentStep: "Configuring TypeScript" },
  { currentStep: "Setting up build pipeline" },
  { currentStep: "Creating component architecture" },
  { currentStep: "Generating UI components" },
  { currentStep: "Setting up routing system" },
  { currentStep: "Configuring state management" },
  { currentStep: "Installing UI libraries" },
  { currentStep: "Setting up styling system" },
  { currentStep: "Creating page templates" },
  { currentStep: "Configuring API integration" },
  { currentStep: "Setting up authentication" },
  { currentStep: "Optimizing bundle size" },
  { currentStep: "Running type checks" },
  { currentStep: "Running linter" },
  { currentStep: "Building production bundle" },
  { currentStep: "Finalizing deployment" },
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
  },
  { type: "complete", status: "completed" },
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

    // Schedule next log - send at steady pace matching display
    if (currentIndex < MOCK_LOGS.length) {
      setTimeout(sendNextLog, 2500); // Match frontend display speed - 2.5s per log
    } else {
      // End stream after last message
      setTimeout(() => {
        res.end();
      }, 2500);
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
