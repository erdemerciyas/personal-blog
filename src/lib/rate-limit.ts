import { NextRequest } from 'next/server';
import { logger } from '@/core/lib/logger';

// Enhanced rate limiting with security features
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

const requestCounts = new Map<string, RateLimitEntry>();
const suspiciousIPs = new Set<string>();

// Different limits for different endpoints
const PRODUCTION_LIMITS = {
  // Authentication endpoints - very strict
  AUTH: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  LOGIN: { limit: 3, windowMs: 15 * 60 * 1000 }, // 3 attempts per 15 minutes
  REGISTER: { limit: 2, windowMs: 60 * 60 * 1000 }, // 2 attempts per hour
  PASSWORD_RESET: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour

  // API endpoints - çok gevşek
  API_STRICT: { limit: 1000, windowMs: 15 * 60 * 1000 }, // 1000 requests per 15 minutes
  API_MODERATE: { limit: 2000, windowMs: 15 * 60 * 1000 }, // 2000 requests per 15 minutes

  // Contact form
  CONTACT: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 messages per hour

  // File upload
  UPLOAD: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour

  // General - çok gevşek normal gezinme için
  GENERAL: { limit: 5000, windowMs: 15 * 60 * 1000 }, // 5000 requests per 15 minutes
};

const DEVELOPMENT_LIMITS = {
  // Development'da daha güvenli limitler
  AUTH: { limit: 10, windowMs: 15 * 60 * 1000 }, // 10 attempts per 15 minutes
  LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  REGISTER: { limit: 3, windowMs: 15 * 60 * 1000 }, // 3 attempts per 15 minutes
  PASSWORD_RESET: { limit: 3, windowMs: 15 * 60 * 1000 }, // 3 attempts per 15 minutes

  // API endpoints
  API_STRICT: { limit: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  API_MODERATE: { limit: 200, windowMs: 15 * 60 * 1000 }, // 200 requests per 15 minutes

  // Contact form
  CONTACT: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 messages per 15 minutes

  // File upload
  UPLOAD: { limit: 10, windowMs: 15 * 60 * 1000 }, // 10 uploads per 15 minutes

  // General
  GENERAL: { limit: 1000, windowMs: 15 * 60 * 1000 }, // 1000 requests per 15 minutes
};

export const RATE_LIMITS = process.env.NODE_ENV === 'production' ? PRODUCTION_LIMITS : DEVELOPMENT_LIMITS;

export function rateLimit(
  ip: string,
  type: keyof typeof RATE_LIMITS = 'GENERAL',
  customLimit?: { limit: number; windowMs: number }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const config = customLimit || RATE_LIMITS[type];
  const { limit, windowMs } = config;
  const windowStart = now - windowMs;

  // Clean up old entries periodically
  if (Math.random() < 0.1) { // 10% chance to clean up
    cleanupOldEntries(windowStart);
  }

  // Check if IP is temporarily blocked
  const current = requestCounts.get(ip);
  if (current?.blocked && current.blockUntil && now < current.blockUntil) {
    logger.warn('Blocked IP attempted access', 'SECURITY', {
      ip,
      type,
      blockUntil: new Date(current.blockUntil).toISOString()
    });
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.blockUntil
    };
  }

  // Initialize or reset if window expired
  if (!current || current.resetTime < windowStart) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + windowMs,
      blocked: false
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: now + windowMs
    };
  }

  // Check if limit exceeded
  if (current.count >= limit) {
    // Block IP for extended period if repeatedly hitting limits
    const blockDuration = getBlockDuration(ip, type);
    current.blocked = true;
    current.blockUntil = now + blockDuration;

    // Mark as suspicious if hitting auth endpoints repeatedly
    if (['AUTH', 'LOGIN', 'REGISTER', 'PASSWORD_RESET'].includes(type)) {
      suspiciousIPs.add(ip);
      logger.error('Suspicious authentication activity detected', 'SECURITY', {
        ip,
        type,
        count: current.count,
        blockDuration: blockDuration / 1000 / 60 // minutes
      });
    }

    logger.warn('Rate limit exceeded', 'SECURITY', {
      ip,
      type,
      count: current.count,
      limit
    });

    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    };
  }

  // Increment counter
  current.count++;

  // Log suspicious activity
  if (current.count > limit * 0.8) { // 80% of limit
    logger.warn('High request rate detected', 'SECURITY', {
      ip,
      type,
      count: current.count,
      limit,
      percentage: Math.round((current.count / limit) * 100)
    });
  }

  return {
    allowed: true,
    remaining: limit - current.count,
    resetTime: current.resetTime
  };
}

function getBlockDuration(ip: string, type: string): number {
  const baseBlockTime = 15 * 60 * 1000; // 15 minutes

  // Longer blocks for auth endpoints
  if (['AUTH', 'LOGIN', 'REGISTER', 'PASSWORD_RESET'].includes(type)) {
    return suspiciousIPs.has(ip) ? 60 * 60 * 1000 : 30 * 60 * 1000; // 1 hour or 30 minutes
  }

  return baseBlockTime;
}

function cleanupOldEntries(windowStart: number): void {
  const keysToDelete: string[] = [];
  requestCounts.forEach((value, key) => {
    if (value.resetTime < windowStart && !value.blocked) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => requestCounts.delete(key));

  // Clean up suspicious IPs older than 24 hours
  // This is a simple cleanup - in production, you'd want more sophisticated tracking
  if (Math.random() < 0.01) { // 1% chance
    suspiciousIPs.clear();
  }
}

export function getClientIP(request: NextRequest): string {
  // More secure IP detection with validation
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  const xClientIP = request.headers.get('x-client-ip');

  // Priority order for IP detection
  const potentialIPs = [
    cfConnectingIP,
    real,
    forwarded?.split(',')[0]?.trim(),
    xClientIP
  ].filter(Boolean);

  for (const ip of potentialIPs) {
    if (ip && isValidIP(ip)) {
      return ip;
    }
  }

  // Fallback to connection remote address
  return request.ip || 'unknown';
}

function isValidIP(ip: string): boolean {
  // Basic IP validation (IPv4 and IPv6)
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Check if IP is suspicious
export function isSuspiciousIP(ip: string): boolean {
  return suspiciousIPs.has(ip);
}

// Get rate limit status for an IP
export function getRateLimitStatus(ip: string): RateLimitEntry | null {
  return requestCounts.get(ip) || null;
} 