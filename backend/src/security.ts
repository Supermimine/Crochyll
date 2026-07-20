import type { NextFunction, Request, Response } from 'express';

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-XSS-Protection': '0',
};

export function applySecurityHeaders(req: Request, res: Response, next: NextFunction): void {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' http://localhost:3000 https://localhost:3000"
  );

  next();
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const current = rateLimitStore.get(ip);

    if (!current || current.resetAt <= now) {
      rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (current.count >= maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    current.count += 1;
    next();
  };
}

export function normalizeText(value: unknown, maxLength = 500): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  if (!normalized || normalized.length > maxLength || /[\u0000-\u001F\u007F]/.test(normalized)) {
    return null;
  }

  return normalized;
}

export function validateEmail(value: unknown): string | null {
  const normalized = normalizeText(value, 254);

  if (!normalized) {
    return null;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || /[\r\n]/.test(normalized)) {
    return null;
  }

  return normalized;
}

export function validatePromoCode(value: unknown): string | null {
  const normalized = normalizeText(value, 36);

  if (!normalized) {
    return null;
  }

  if (!/^[A-Z0-9-]+$/.test(normalized.toUpperCase())) {
    return null;
  }

  return normalized.toUpperCase();
}

export function isSafeEndpoint(endpoint: string): boolean {
  return typeof endpoint === 'string' && /^\/(?!\/)[^\s]*$/.test(endpoint) && !endpoint.includes('://') && !endpoint.includes('<') && !endpoint.includes('>');
}

export function isAllowedOrigin(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin);
}
