import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { 
  verifyRefreshToken, 
  generateTokenPair, 
  extractRefreshTokenFromCookies,
  getRefreshTokenCookieOptions 
} from '@/lib/jwt-utils';

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: Generate new access token using refresh token
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token (alternative to cookie)
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New access token
 *                 refreshToken:
 *                   type: string
 *                   description: New refresh token
 *                 expiresIn:
 *                   type: number
 *                   description: Token expiry time in seconds
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token cookie
 *             schema:
 *               type: string
 *       400:
 *         description: Missing or invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get refresh token from cookie or request body
    let refreshToken = extractRefreshTokenFromCookies(request);
    
    if (!refreshToken) {
      const body = await request.json().catch(() => ({}));
      refreshToken = body.refreshToken;
    }

    if (!refreshToken) {
      return NextResponse.json(
        { 
          error: 'Refresh token not provided',
          code: 'REFRESH_TOKEN_MISSING'
        },
        { status: 400 }
      );
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return NextResponse.json(
        { 
          error: 'Invalid or expired refresh token',
          code: 'REFRESH_TOKEN_INVALID'
        },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select('email role isActive');
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { 
          error: 'User account is deactivated',
          code: 'USER_DEACTIVATED'
        },
        { status: 401 }
      );
    }

    // Generate new token pair
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const tokens = generateTokenPair(tokenPayload);

    // Create response with new tokens
    const response = NextResponse.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      }
    });

    // Set refresh token as secure cookie
    const cookieOptions = getRefreshTokenCookieOptions();
    
    response.cookies.set('refresh_token', tokens.refreshToken, cookieOptions);

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { 
        error: 'Token refresh failed',
        code: 'REFRESH_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Method not allowed for other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';