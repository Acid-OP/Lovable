import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { SessionManager } from '@repo/session';
import { config } from '../config.js';

export const previewRouter = Router();

// Proxy all preview traffic via subdomain (jobid.localhost:3001)
previewRouter.use('/', async (req, res, next) => {
  const hostname = req.hostname;  // e.g., "abc123.localhost"
  const jobId = hostname.split('.')[0];  // e.g., "abc123"
  
  console.log('hostname:', hostname);
  console.log('jobId:', jobId);
  console.log('path:', req.path);

  // Skip if no subdomain (just "localhost" - let other routes handle)
  if (hostname === 'localhost' || jobId === 'localhost') {
    return next('route');
  }

  try {
    await SessionManager.update(jobId as string, {
      lastActivity: Date.now().toString()
    });
  } catch (error) {
    console.error(`Failed to update activity for ${jobId}:`, error);
  }
  
  next();
}, createProxyMiddleware({
  target: config.container.baseUrl,  // http://localhost:3003
  changeOrigin: true,
  // No pathRewrite needed - path is already clean with subdomain approach
}));
