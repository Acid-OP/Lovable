import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { SessionManager } from '@repo/session';
import { config } from '../config.js';

export const previewRouter = Router();

previewRouter.use('/', async (req, res, next) => {
  const hostname = req.hostname;  
  const jobId = hostname.split('.')[0];  
  
  console.log('hostname:', hostname);
  console.log('jobId:', jobId);
  console.log('path:', req.path);

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
  target: config.container.baseUrl,  
  changeOrigin: true,
}));
