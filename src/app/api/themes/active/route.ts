/**
 * API Route for Active Theme
 * GET - Returns the currently active theme configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import Theme from '../../../../models/Theme';
import connectDB from '../../../../lib/mongoose';

// GET /api/themes/active - Get active theme
export async function GET(_request: NextRequest) {
  try {
    await connectDB();

    const activeTheme = await Theme.findOne({ isActive: true });

    if (!activeTheme) {
      // Return default theme if no active theme found
      return NextResponse.json({
        success: true,
        data: {
          _id: 'default',
          name: 'Default Theme',
          slug: 'default',
          config: {
            colors: {
              primary: '#003450',
              secondary: '#3A506B',
              accent: '#003450',
              background: '#F8F9FA',
              text: '#3D3D3D',
            },
            fonts: {
              heading: 'Inter',
              body: 'Inter',
            },
            layout: {
              maxWidth: 1280,
              sidebar: false,
              headerStyle: 'fixed',
              footerStyle: 'simple',
            },
            features: {
              heroSlider: true,
              portfolioGrid: true,
              blogList: true,
              contactForm: true,
            },
          },
        }
      });
    }

    console.log(`[Themes API] Active theme: ${activeTheme.name}`);
    return NextResponse.json({
      success: true,
      data: activeTheme
    });
  } catch (error) {
    console.error('[Themes API] Error fetching active theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch active theme' },
      { status: 500 }
    );
  }
}
