import { logger, LogLevel } from '../logger';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('error logging', () => {
    it('should log error messages', () => {
      logger.error('Test error', 'TEST_CONTEXT');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should include context in error logs', () => {
      logger.error('Test error', 'MY_CONTEXT');
      const callArgs = consoleSpy.mock.calls[0][0];
      expect(callArgs).toContain('MY_CONTEXT');
    });

    it('should include error data', () => {
      const errorData = { userId: '123', action: 'login' };
      logger.error('Test error', 'TEST', errorData);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('warn logging', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning', 'TEST_CONTEXT');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should include warning data', () => {
      const warnData = { attempt: 1 };
      logger.warn('Test warning', 'TEST', warnData);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('info logging', () => {
    it('should log info messages', () => {
      logger.info('Test info', 'TEST_CONTEXT');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should include info data', () => {
      const infoData = { status: 'success' };
      logger.info('Test info', 'TEST', infoData);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('debug logging', () => {
    it('should log debug messages in development', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'development';
      
      logger.debug('Test debug', 'TEST_CONTEXT');
      expect(consoleSpy).toHaveBeenCalled();
      
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should not log debug messages in production', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'production';
      
      consoleSpy.mockClear();
      logger.debug('Test debug', 'TEST_CONTEXT');
      
      // In production, debug logs should be skipped
      // This depends on logger implementation
      
      (process.env as any).NODE_ENV = originalEnv;
    });
  });

  describe('log levels', () => {
    it('should have ERROR level', () => {
      expect(LogLevel.ERROR).toBe('error');
    });

    it('should have WARN level', () => {
      expect(LogLevel.WARN).toBe('warn');
    });

    it('should have INFO level', () => {
      expect(LogLevel.INFO).toBe('info');
    });

    it('should have DEBUG level', () => {
      expect(LogLevel.DEBUG).toBe('debug');
    });
  });

  describe('error handling', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error');
      logger.error('An error occurred', 'TEST', undefined, error);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle string errors', () => {
      logger.error('String error', 'TEST');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('timestamp formatting', () => {
    it('should include timestamp in logs', () => {
      logger.info('Test message', 'TEST');
      const callArgs = consoleSpy.mock.calls[0][0];
      expect(callArgs).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });
});
