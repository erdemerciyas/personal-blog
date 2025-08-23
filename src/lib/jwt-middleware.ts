import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyAccessToken, 
  extractTokenFromHeader, 
  isValidTokenFormat 
} from './jwt-utils';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
}

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and adds user info to request
 */
export function withJWTAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Extract token from Authorization header
      const token = extractTokenFromHeader(request);

      if (!token) {
        return NextResponse.json(
          { 
            error: 'Access token not provided',
            code: 'ACCESS_TOKEN_MISSING'
          },
          { status: 401 }
        );
      }

      // Validate token format
      if (!isValidTokenFormat(token)) {
        return NextResponse.json(
          { 
            error: 'Invalid token format',
            code: 'INVALID_TOKEN_FORMAT'
          },
          { status: 401 }
        );
      }

      // Verify token
      try {
        const decoded = verifyAccessToken(token);
        
        // Add user info to request
        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };

        // Call the actual handler
        return await handler(authenticatedRequest);

      } catch (error) {
        return NextResponse.json(
          { 
            error: 'Invalid or expired access token',
            code: 'ACCESS_TOKEN_INVALID',
            message: error instanceof Error ? error.message : 'Token verification failed'
          },
          { status: 401 }
        );
      }

    } catch (error) {
      console.error('JWT Auth middleware error:', error);
      return NextResponse.json(
        { 
          error: 'Authentication failed',
          code: 'AUTH_FAILED'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Optional JWT Authentication Middleware
 * Adds user info if token is valid, but doesn't reject if missing
 */
export function withOptionalJWTAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const token = extractTokenFromHeader(request);
      const authenticatedRequest = request as AuthenticatedRequest;

      if (token && isValidTokenFormat(token)) {
        try {
          const decoded = verifyAccessToken(token);
          authenticatedRequest.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
          };
        } catch (error) {
          // Token is invalid, but we continue without user info
          console.warn('Optional JWT auth - invalid token:', error);
        }
      }

      return await handler(authenticatedRequest);

    } catch (error) {
      console.error('Optional JWT Auth middleware error:', error);
      return await handler(request as AuthenticatedRequest);
    }
  };
}

/**
 * Role-based authorization middleware
 */
export function withRoleAuth(allowedRoles: string[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return withJWTAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
      const userRole = request.user?.role;

      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { 
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            requiredRoles: allowedRoles,
            userRole
          },
          { status: 403 }
        );
      }

      return await handler(request);
    });
  };
}

/**
 * Admin only middleware
 */
export function withAdminAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRoleAuth(['admin'])(handler);
}

const jwtMiddleware = {
  withJWTAuth,
  withOptionalJWTAuth,
  withRoleAuth,
  withAdminAuth
};

export default jwtMiddleware;