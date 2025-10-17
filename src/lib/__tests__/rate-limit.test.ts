import { rateLimit, RATE_LIMITS } from '../rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rateLimit function', () => {
    it('should allow requests within limit', () => {
      const result = rateLimit('192.168.1.1', 'GENERAL');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should track multiple requests from same IP', () => {
      const ip = '192.168.1.2';
      
      const result1 = rateLimit(ip, 'LOGIN');
      expect(result1.allowed).toBe(true);
      
      const result2 = rateLimit(ip, 'LOGIN');
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBeLessThan(result1.remaining);
    });

    it('should block after exceeding limit', () => {
      const ip = '192.168.1.3';
      const limit = RATE_LIMITS.LOGIN.limit;
      
      // Exceed the limit
      for (let i = 0; i < limit + 1; i++) {
        rateLimit(ip, 'LOGIN');
      }
      
      const result = rateLimit(ip, 'LOGIN');
      expect(result.allowed).toBe(false);
    });

    it('should return reset time', () => {
      const result = rateLimit('192.168.1.4', 'GENERAL');
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should use custom limits when provided', () => {
      const customLimit = { limit: 5, windowMs: 60000 };
      const result = rateLimit('192.168.1.5', 'GENERAL', customLimit);
      expect(result.allowed).toBe(true);
    });

    it('should have different limits for different endpoints', () => {
      const loginLimit = RATE_LIMITS.LOGIN.limit;
      const apiLimit = RATE_LIMITS.API_MODERATE.limit;
      
      expect(loginLimit).toBeLessThan(apiLimit);
    });

    it('should handle production vs development limits', () => {
      const limits = RATE_LIMITS;
      
      if (process.env.NODE_ENV === 'production') {
        expect(limits.LOGIN.limit).toBeLessThanOrEqual(5);
      } else {
        expect(limits.LOGIN.limit).toBeGreaterThanOrEqual(20);
      }
    });
  });

  describe('Rate limit types', () => {
    it('should have LOGIN rate limit', () => {
      expect(RATE_LIMITS.LOGIN).toBeDefined();
      expect(RATE_LIMITS.LOGIN.limit).toBeGreaterThan(0);
      expect(RATE_LIMITS.LOGIN.windowMs).toBeGreaterThan(0);
    });

    it('should have REGISTER rate limit', () => {
      expect(RATE_LIMITS.REGISTER).toBeDefined();
      expect(RATE_LIMITS.REGISTER.limit).toBeGreaterThan(0);
    });

    it('should have PASSWORD_RESET rate limit', () => {
      expect(RATE_LIMITS.PASSWORD_RESET).toBeDefined();
      expect(RATE_LIMITS.PASSWORD_RESET.limit).toBeGreaterThan(0);
    });

    it('should have CONTACT rate limit', () => {
      expect(RATE_LIMITS.CONTACT).toBeDefined();
      expect(RATE_LIMITS.CONTACT.limit).toBeGreaterThan(0);
    });

    it('should have UPLOAD rate limit', () => {
      expect(RATE_LIMITS.UPLOAD).toBeDefined();
      expect(RATE_LIMITS.UPLOAD.limit).toBeGreaterThan(0);
    });

    it('should have API_STRICT rate limit', () => {
      expect(RATE_LIMITS.API_STRICT).toBeDefined();
      expect(RATE_LIMITS.API_STRICT.limit).toBeGreaterThan(0);
    });

    it('should have API_MODERATE rate limit', () => {
      expect(RATE_LIMITS.API_MODERATE).toBeDefined();
      expect(RATE_LIMITS.API_MODERATE.limit).toBeGreaterThan(0);
    });

    it('should have GENERAL rate limit', () => {
      expect(RATE_LIMITS.GENERAL).toBeDefined();
      expect(RATE_LIMITS.GENERAL.limit).toBeGreaterThan(0);
    });
  });
});
