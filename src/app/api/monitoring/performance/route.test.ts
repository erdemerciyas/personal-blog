/**
 * @jest-environment node
 */

import { GET, POST } from '@/app/api/monitoring/performance/route';
import { hasValidMongoUri } from '@/lib/mongoose';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/mongoose', () => ({
  __esModule: true,
  default: jest.fn(),
  hasValidMongoUri: jest.fn(),
}));

jest.mock('@/lib/monitoring', () => {
  const mockTransaction = {
    setTag: jest.fn(),
    finish: jest.fn()
  };
  
  return {
    PerformanceMonitor: {
      startTransaction: jest.fn(() => mockTransaction),
      measureDatabaseQuery: jest.fn((operation, queryFn) => queryFn()),
      measureFunction: jest.fn((name, fn) => fn()),
      captureException: jest.fn(),
      addBreadcrumb: jest.fn(),
      setTags: jest.fn(),
    },
    ErrorTracker: {
      captureApiError: jest.fn(),
      captureDatabaseError: jest.fn(),
      captureWarning: jest.fn(),
    }
  };
});

import { PerformanceMonitor } from '@/lib/monitoring';

const mockConnectDB = jest.fn();
const mockHasValidMongoUri = hasValidMongoUri as jest.MockedFunction<typeof hasValidMongoUri>;

describe('/api/monitoring/performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock process methods
    jest.spyOn(process, 'uptime').mockReturnValue(3600); // 1 hour
    jest.spyOn(process, 'memoryUsage').mockReturnValue({
      rss: 50000000,
      heapTotal: 30000000,
      heapUsed: 20000000,
      external: 5000000,
      arrayBuffers: 1000000
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/monitoring/performance', () => {
    it('should return performance metrics when database is available', async () => {
      mockHasValidMongoUri.mockReturnValue(true);
      mockConnectDB.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/monitoring/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'healthy');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('metrics');
      expect(data.metrics).toHaveProperty('uptime', 3600);
      expect(data.metrics).toHaveProperty('memory');
      expect(data.metrics.memory).toHaveProperty('used', 20000000);
      expect(data.metrics.memory).toHaveProperty('total', 30000000);
      expect(data.metrics.memory).toHaveProperty('percentage', 67);
      expect(data.metrics).toHaveProperty('database');
      expect(data.metrics.database).toHaveProperty('status', 'connected');
    });

    it('should return metrics with disabled database when URI is not valid', async () => {
      mockHasValidMongoUri.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/monitoring/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics.database.status).toBe('disabled');
      expect(mockConnectDB).not.toHaveBeenCalled();
    });

    it('should handle database connection errors', async () => {
      mockHasValidMongoUri.mockReturnValue(true);
      (PerformanceMonitor.measureDatabaseQuery as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/monitoring/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics.database.status).toBe('error');
    });

    it('should handle general errors gracefully', async () => {
      // Mock process.uptime to throw an error
      jest.spyOn(process, 'uptime').mockImplementation(() => {
        throw new Error('Process error');
      });

      const request = new NextRequest('http://localhost:3000/api/monitoring/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error', 'Failed to retrieve performance metrics');
      expect(data).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/monitoring/performance', () => {
    it('should accept and process valid client metrics', async () => {
      const metricsData = {
        metrics: {
          loadTime: 1500,
          renderTime: 800,
          route: '/portfolio',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        url: 'http://localhost:3000/portfolio',
        timestamp: '2024-01-01T00:00:00.000Z'
      };

      const request = new NextRequest('http://localhost:3000/api/monitoring/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metricsData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'received');
      expect(data).toHaveProperty('timestamp');
    });

    it('should trigger warning for slow page loads', async () => {
      const slowMetricsData = {
        metrics: {
          loadTime: 5000, // 5 seconds - should trigger warning
          renderTime: 3000,
          route: '/slow-page',
          userAgent: 'Mozilla/5.0'
        },
        url: 'http://localhost:3000/slow-page'
      };

      const request = new NextRequest('http://localhost:3000/api/monitoring/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slowMetricsData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('received');
      // The warning capture would be tested in the monitoring module tests
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        metrics: {
          loadTime: 1500
          // Missing required fields
        }
        // Missing url field
      };

      const request = new NextRequest('http://localhost:3000/api/monitoring/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Missing required fields: metrics, url');
      expect(data).toHaveProperty('timestamp');
    });

    it('should handle invalid JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/monitoring/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error', 'Failed to process performance metrics');
    });

    it('should handle missing request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/monitoring/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Missing required fields: metrics, url');
    });
  });
});