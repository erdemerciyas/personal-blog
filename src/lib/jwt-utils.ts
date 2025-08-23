import { sign, verify, decode } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// JWT configuration
const getJWTAccessSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.NEXTAUTH_SECRET || 'your-access-secret';
  if (!secret || secret.length < 8) {
    throw new Error('JWT_ACCESS_SECRET must be at least 8 characters long');
  }
  return secret;
};

const getJWTRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET || (process.env.NEXTAUTH_SECRET ? process.env.NEXTAUTH_SECRET + '_refresh' : 'your-refresh-secret');
  if (!secret || secret.length < 8) {
    throw new Error('JWT_REFRESH_SECRET must be at least 8 characters long');
  }
  return secret;
};

const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d'; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  try {
    const secret = getJWTAccessSecret();
    // @ts-expect-error - TypeScript overload issue with jsonwebtoken
    return sign(payload, secret, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'personal-blog',
      audience: 'personal-blog-users'
    });
  } catch (error) {
    console.error('Access token generation error:', error);
    throw new Error('Failed to generate access token');
  }
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  try {
    const secret = getJWTRefreshSecret();
    // @ts-expect-error - TypeScript overload issue with jsonwebtoken
    return sign(payload, secret, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'personal-blog',
      audience: 'personal-blog-users'
    });
  } catch (error) {
    console.error('Refresh token generation error:', error);
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * Generate token pair (access + refresh)
 */
export function generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  // Calculate expiry time in seconds
  const expiresIn = 15 * 60; // 15 minutes in seconds
  
  return {
    accessToken,
    refreshToken,
    expiresIn
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    const secret = getJWTAccessSecret();
    const decoded = verify(token, secret, {
      issuer: 'personal-blog',
      audience: 'personal-blog-users'
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    console.error('Access token verification error:', error);
    throw new Error('Invalid access token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    const secret = getJWTRefreshSecret();
    const decoded = verify(token, secret, {
      issuer: 'personal-blog',
      audience: 'personal-blog-users'
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    console.error('Refresh token verification error:', error);
    throw new Error('Invalid refresh token');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Extract refresh token from cookies
 */
export function extractRefreshTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('refresh_token')?.value || null;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

/**
 * Get token expiry time
 */
export function getTokenExpiry(token: string): number | null {
  try {
    const decoded = decode(token) as JWTPayload;
    return decoded.exp || null;
  } catch {
    return null;
  }
}

/**
 * Validate token format
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check if token has 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Create secure cookie options for refresh token
 */
export function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/'
  };
}

const jwtUtils = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  extractRefreshTokenFromCookies,
  isTokenExpired,
  getTokenExpiry,
  isValidTokenFormat,
  getRefreshTokenCookieOptions
};

export default jwtUtils;