/**
 * @jest-environment node
 */

import { GET } from '@/app/api/health/route';
import connectDB from '@/lib/mongoose';
import * as healthModule from './route';

const { runtime, dynamic } = healthModule;

// Mock the mongoose connection
jest.mock('@/lib/mongoose', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.VERCEL;
    delete process.env.VERCEL_REGION;
  });

  it('should return healthy status when database connection is successful', async () => {
    // Mock successful database connection
    mockConnectDB.mockResolvedValueOnce({} as unknown);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      status: 'healthy',
      platform: 'local',
      region: 'unknown',
      database: 'connected',
    });
    expect(data.timestamp).toBeDefined();
    expect(mockConnectDB).toHaveBeenCalledTimes(1);
  });

  it('should return unhealthy status when database connection fails', async () => {
    // Mock database connection failure
    const mockError = new Error('Database connection failed');
    mockConnectDB.mockRejectedValueOnce(mockError);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toMatchObject({
      status: 'unhealthy',
      platform: 'local',
      region: 'unknown',
      database: 'disconnected',
      error: 'Database connection failed',
    });
    expect(data.timestamp).toBeDefined();
    expect(mockConnectDB).toHaveBeenCalledTimes(1);
  });

  it('should return vercel platform when VERCEL env is set', async () => {
    // Set Vercel environment variables
    process.env.VERCEL = '1';
    process.env.VERCEL_REGION = 'iad1';
    
    mockConnectDB.mockResolvedValueOnce({} as unknown);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      status: 'healthy',
      platform: 'vercel',
      region: 'iad1',
      database: 'connected',
    });
  });

  it('should handle non-Error objects thrown by database', async () => {
    // Mock database throwing a non-Error object
    mockConnectDB.mockRejectedValueOnce('String error');

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toMatchObject({
      status: 'unhealthy',
      database: 'disconnected',
      error: 'Unknown error',
    });
  });

  it('should have correct runtime and dynamic exports', () => {
    // Test module exports
    expect(runtime).toBe('nodejs');
    expect(dynamic).toBe('force-dynamic');
  });
});