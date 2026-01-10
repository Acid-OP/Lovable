import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { SessionManager } from '@repo/session';
import { config } from '../config.js';

export const previewRouter = Router();

// Proxy all preview traffic and track activity
previewRouter.use('/preview/:jobId', async (req, res, next) => {
  const { jobId } = req.params;
  
  try {
    // Update last activity timestamp in session
    await SessionManager.update(jobId, {
      lastActivity: Date.now().toString()
    });
  } catch (error) {
    console.error(`Failed to update activity for ${jobId}:`, error);
    // Continue anyway - don't block the request
  }
  
  next();
}, createProxyMiddleware({
  target: config.container.baseUrl,
  changeOrigin: true,
  pathRewrite: (path) => {
    // Remove /preview/:jobId prefix from path
    return path.replace(/^\/preview\/[^\/]+/, '');
  }
}));

