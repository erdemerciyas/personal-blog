import { NextRequest } from 'next/server';

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string, limit: number = 100, windowMs: number = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  const keysToDelete: string[] = [];
  requestCounts.forEach((value, key) => {
    if (value.resetTime < windowStart) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => requestCounts.delete(key));
  
  const current = requestCounts.get(ip);
  
  if (!current || current.resetTime < windowStart) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (real) {
    return real;
  }
  
  return 'unknown';
} 