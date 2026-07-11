import type { RequestHandler } from 'express';

import { env } from '../config/env.js';

// A blunt, restart-required kill switch for emergencies (bad deploy, DB
// migration in progress, etc.) — not a live-toggleable admin feature, which
// would need a DB-backed flag and real-time propagation. Health checks stay
// reachable so uptime monitors can still tell the process is alive.
export const maintenanceGate: RequestHandler = (req, res, next) => {
  if (!env.maintenanceMode || req.path.startsWith('/health')) {
    next();
    return;
  }

  res.status(503).json({
    success: false,
    maintenance: true,
    message: "We're down for scheduled maintenance. Please check back shortly.",
  });
};
