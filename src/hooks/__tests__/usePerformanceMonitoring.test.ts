import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitoring } from '../usePerformanceMonitoring';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/test-path',
}));

// Mock fetch
global.fetch = jest.fn();

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    getEntriesByType: jest.fn(() => [
      {
        fetchStart: 100,
        loadEventEnd: 1600,
        domContentLoadedEventEnd: 1200,
      },
    ]),
  },
  writable: true,
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test-user-agent',
  },
  writable: true,
});

// Mock location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/test-path',
  },
  writable: true,
});

describe('usePerformanceMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it('should send custom metrics', async () => {
    const { result } = renderHook(() => usePerformanceMonitoring());

    await act(async () => {
      await result.current.measureCustomMetric('customMetric', 123);
    });

    expect(fetch).toHaveBeenCalledWith('/api/monitoring/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customMetric: 123,
        route: '/test-path',
        userAgent: 'test-user-agent',
        url: 'http://localhost:3000/test-path',
      }),
    });
  });

  it('should send performance metrics', async () => {
    const { result } = renderHook(() => usePerformanceMonitoring());

    const metrics = {
      loadTime: 1500,
      renderTime: 800,
      route: '/test-path',
      userAgent: 'test-user-agent',
      url: 'http://localhost:3000/test-path',
    };

    await act(async () => {
      await result.current.sendMetrics(metrics);
    });

    expect(fetch).toHaveBeenCalledWith('/api/monitoring/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    });
  });

  it('should handle fetch errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => usePerformanceMonitoring());

    await act(async () => {
      await result.current.measureCustomMetric('customMetric', 123);
    });

    // Should not throw error
    expect(consoleSpy).not.toHaveBeenCalled(); // In production, errors are silently ignored
    consoleSpy.mockRestore();
  });
});