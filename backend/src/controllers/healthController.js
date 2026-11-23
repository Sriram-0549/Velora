import { db } from '../db/db.js';

const startTime = Date.now();

export function getHealth(req, res) {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();

  res.json({
    status: 'healthy',
    service: 'velora-backend-api',
    version: '1.0.0',
    uptime_seconds: uptimeSeconds,
    database_mode: db.getMode(),
    timestamp: new Date().toISOString(),
    system: {
      node_version: process.version,
      platform: process.platform,
      memory: {
        rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
        heap_used_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      }
    }
  });
}
