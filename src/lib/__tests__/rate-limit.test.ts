// Mock the logger to suppress output during tests
jest.mock('@/core/lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

import { rateLimit, RATE_LIMITS } from '../rate-limit';

// Use a unique IP prefix per test suite to avoid cross-test pollution from the module-level Map
const IP_PREFIX = 'test-ip-' + Date.now() + '-';
let counter = 0;
function freshIp() {
  return `${IP_PREFIX}${counter++}`;
}

describe('RATE_LIMITS', () => {
  it('has expected endpoint types', () => {
    expect(RATE_LIMITS).toHaveProperty('AUTH');
    expect(RATE_LIMITS).toHaveProperty('LOGIN');
    expect(RATE_LIMITS).toHaveProperty('CONTACT');
    expect(RATE_LIMITS).toHaveProperty('GENERAL');
  });

  it('AUTH limit is stricter than GENERAL', () => {
    expect(RATE_LIMITS.AUTH.limit).toBeLessThan(RATE_LIMITS.GENERAL.limit);
  });
});

describe('rateLimit', () => {
  it('allows first request', () => {
    const result = rateLimit(freshIp(), 'GENERAL');
    expect(result.allowed).toBe(true);
  });

  it('decrements remaining on each allowed request', () => {
    const ip = freshIp();
    const r1 = rateLimit(ip, 'GENERAL');
    const r2 = rateLimit(ip, 'GENERAL');
    expect(r2.remaining).toBe(r1.remaining - 1);
  });

  it('returns resetTime in the future', () => {
    const result = rateLimit(freshIp(), 'GENERAL');
    expect(result.resetTime).toBeGreaterThan(Date.now());
  });

  it('blocks after limit is exceeded with a tiny custom limit', () => {
    const ip = freshIp();
    const tiny = { limit: 2, windowMs: 60_000 };

    rateLimit(ip, 'GENERAL', tiny); // 1st
    rateLimit(ip, 'GENERAL', tiny); // 2nd — hits limit
    const blocked = rateLimit(ip, 'GENERAL', tiny); // 3rd — should be blocked

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('blocked result has resetTime in the future', () => {
    const ip = freshIp();
    const tiny = { limit: 1, windowMs: 60_000 };

    rateLimit(ip, 'GENERAL', tiny); // 1st — ok
    const blocked = rateLimit(ip, 'GENERAL', tiny); // 2nd — blocked

    expect(blocked.allowed).toBe(false);
    expect(blocked.resetTime).toBeGreaterThan(Date.now());
  });

  it('uses LOGIN type limits correctly', () => {
    const ip = freshIp();
    const result = rateLimit(ip, 'LOGIN');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(RATE_LIMITS.LOGIN.limit - 1);
  });

  it('uses CONTACT type limits correctly', () => {
    const ip = freshIp();
    const result = rateLimit(ip, 'CONTACT');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(RATE_LIMITS.CONTACT.limit - 1);
  });
});
