/**
 * API Route for Theme Activation
 * POST - Activate a theme (deactivates all others)
 */

import { NextRequest, NextResponse } from 'next/server';
import Theme from '../../../../../models/Theme';
import connectDB from '../../../../../lib/mongoose';

// POST /api/admin/themes/activate - Activate a theme
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    console.log('[Themes API] Activating theme...');
    
    const body = await request.json();
    const { slug } = body;
    
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Theme slug is required' },
        { status: 400 }
      );
    }
    
    // Deactivate all themes first
    await Theme.updateMany({}, { isActive: false });
    
    // Activate the requested theme
    const theme = await Theme.findOneAndUpdate(
      { slug },
      { isActive: true },
      { new: true }
    );
    
    if (!theme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }
    
    console.log(`[Themes API] Activated theme: ${theme.name}`);
    return NextResponse.json({ 
      success: true, 
      message: 'Theme activated successfully',
      data: theme 
    });
  } catch (error) {
    console.error('[Themes API] Error activating theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to activate theme' },
      { status: 500 }
    );
  }
}
