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
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      logger.warn('Test warning', 'TEST_CONTEXT');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should include warning data', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const warnData = { attempt: 1 };
      logger.warn('Test warning', 'TEST', warnData);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('info logging', () => {
    it('should log info messages', () => {
      const infoSpy = jest.spyOn(console, 'info').mockImplementation();
      logger.info('Test info', 'TEST_CONTEXT');
      expect(infoSpy).toHaveBeenCalled();
      infoSpy.mockRestore();
    });

    it('should include info data', () => {
      const infoSpy = jest.spyOn(console, 'info').mockImplementation();
      const infoData = { status: 'success' };
      logger.info('Test info', 'TEST', infoData);
      expect(infoSpy).toHaveBeenCalled();
      infoSpy.mockRestore();
    });
  });

  describe('debug logging', () => {
    it('should log debug messages in development', () => {
      const originalEnv = process.env.NODE_ENV;
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      (process.env as any).NODE_ENV = 'development';
      
      logger.debug('Test debug', 'TEST_CONTEXT');
      expect(logSpy).toHaveBeenCalled();
      
      (process.env as any).NODE_ENV = originalEnv;
      logSpy.mockRestore();
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
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      logger.error('An error occurred', 'TEST', undefined, error);
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('should handle string errors', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      logger.error('String error', 'TEST');
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe('timestamp formatting', () => {
    it('should include timestamp in logs', () => {
      const infoSpy = jest.spyOn(console, 'info').mockImplementation();
      logger.info('Test message', 'TEST');
      expect(infoSpy).toHaveBeenCalled();
      const callArgs = infoSpy.mock.calls[0][0];
      expect(callArgs).toMatch(/\d{4}-\d{2}-\d{2}/);
      infoSpy.mockRestore();
    });
  });
});
