/**
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/refresh/route';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/mongoose', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/models/User', () => ({
  findById: jest.fn(),
}));

jest.mock('@/lib/jwt-utils', () => ({
  generateTokenPair: jest.fn(),
  verifyRefreshToken: jest.fn(),
  extractRefreshTokenFromCookies: jest.fn(),
  getRefreshTokenCookieOptions: jest.fn(),
}));

// Mock NextResponse
const mockCookiesSet = jest.fn();
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => {
      const response = {
        json: async () => data,
        status: options?.status || 200,
        cookies: {
          set: mockCookiesSet,
        },
      };
      return response;
    }),
  },
}));

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;
const mockUser = User as jest.Mocked<typeof User>;

describe('/api/auth/refresh', () => {
  const mockUserData = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    role: 'user',
    isActive: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful connection with proper mongoose type
    mockConnectDB.mockResolvedValue({} as typeof import('mongoose'));
  });

  it('should refresh token successfully with valid refresh token in cookie', async () => {
    // Mock JWT utils
    const jwtUtils = require('@/lib/jwt-utils');
    const refreshToken = 'valid_refresh_token';
    jwtUtils.extractRefreshTokenFromCookies.mockReturnValue(refreshToken);
    jwtUtils.verifyRefreshToken.mockReturnValue({
      userId: mockUserData._id,
      email: mockUserData.email,
      role: mockUserData.role
    });
    jwtUtils.generateTokenPair.mockReturnValue({
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
      expiresIn: 900
    });
    jwtUtils.getRefreshTokenCookieOptions.mockReturnValue({
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 604800,
      path: '/'
    });

    // Mock user lookup
    (mockUser.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUserData)
    });

    // Create request with refresh token cookie
    const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refresh_token=${refreshToken}`
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('accessToken');
    expect(data).toHaveProperty('refreshToken');
    expect(data).toHaveProperty('expiresIn');
    expect(data).toHaveProperty('user');
    expect(data.user.email).toBe(mockUserData.email);
    expect(mockConnectDB).toHaveBeenCalledTimes(1);
    expect(mockUser.findById).toHaveBeenCalledWith(mockUserData._id);
  });

  it('should refresh token successfully with valid refresh token in request body', async () => {
    // Mock JWT utils
    const jwtUtils = require('@/lib/jwt-utils');
    const refreshToken = 'valid_refresh_token';
    jwtUtils.extractRefreshTokenFromCookies.mockReturnValue(null);
    jwtUtils.verifyRefreshToken.mockReturnValue({
      userId: mockUserData._id,
      email: mockUserData.email,
      role: mockUserData.role
    });
    jwtUtils.generateTokenPair.mockReturnValue({
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
      expiresIn: 900
    });
    jwtUtils.getRefreshTokenCookieOptions.mockReturnValue({
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 604800,
      path: '/'
    });

    (mockUser.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUserData)
    });

    const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('accessToken');
    expect(data).toHaveProperty('refreshToken');
    expect(data.user.email).toBe(mockUserData.email);
  });

  it('should return 400 when refresh token is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Refresh token not provided');
    expect(data.code).toBe('REFRESH_TOKEN_MISSING');
  });

  it('should return 401 when refresh token is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken: 'invalid-token' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid or expired refresh token');
    expect(data.code).toBe('REFRESH_TOKEN_INVALID');
  });

  it('should return 404 when user is not found', async () => {
    // Mock JWT utils
    const jwtUtils = require('@/lib/jwt-utils');
    const refreshToken = 'valid_refresh_token';
    jwtUtils.extractRefreshTokenFromCookies.mockReturnValue(refreshToken);
    jwtUtils.verifyRefreshToken.mockReturnValue({
      userId: 'nonexistent_user_id',
      email: 'nonexistent@example.com'
    });

    (mockUser.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('User not found');
    expect(data.code).toBe('USER_NOT_FOUND');
  });

  it('should return 401 when user is deactivated', async () => {
    const deactivatedUser = {
      ...mockUserData,
      isActive: false
    };

    // Mock JWT utils
    const jwtUtils = require('@/lib/jwt-utils');
    const refreshToken = 'valid_refresh_token';
    jwtUtils.extractRefreshTokenFromCookies.mockReturnValue(refreshToken);
    jwtUtils.verifyRefreshToken.mockReturnValue({
      userId: deactivatedUser._id,
      email: deactivatedUser.email,
      role: deactivatedUser.role
    });

    (mockUser.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(deactivatedUser)
    });

    const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('User account is deactivated');
    expect(data.code).toBe('USER_DEACTIVATED');
  });

  it('should handle database connection errors', async () => {
    mockConnectDB.mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken: 'any-token' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Token refresh failed');
    expect(data.code).toBe('REFRESH_FAILED');
  });
});