import { Request, Response, NextFunction } from 'express';

interface AttemptRecord {
  count: number;
  firstAttempt: number;
}

const attempts = new Map<string, AttemptRecord>();

// Clean up stale IP records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of attempts.entries()) {
    if (now - record.firstAttempt > 15 * 60 * 1000) {
      attempts.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export function authRateLimiter(maxAttempts = 20, windowMs = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // In test environment, allow unlimited attempts
    if (process.env.NODE_ENV === 'test') {
      next();
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();
    const record = attempts.get(ip);

    if (!record) {
      attempts.set(ip, { count: 1, firstAttempt: now });
      next();
      return;
    }

    if (now - record.firstAttempt > windowMs) {
      // Window expired, reset counter
      attempts.set(ip, { count: 1, firstAttempt: now });
      next();
      return;
    }

    record.count++;
    if (record.count > maxAttempts) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
      });
      return;
    }

    next();
  };
}
