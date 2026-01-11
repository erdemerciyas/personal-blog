/**
 * API Route for Theme Customization
 * PUT - Customize theme configuration (colors, fonts, layout, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import Theme from '../../../../../../models/Theme';
import connectDB from '../../../../../../lib/mongoose';

// PUT /api/admin/themes/[id]/customize - Customize theme
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Theme ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`[Themes API] Customizing theme with ID: ${id}`);
    
    const body = await request.json();
    const { config } = body;
    
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Configuration is required' },
        { status: 400 }
      );
    }
    
    // Update theme configuration
    const theme = await Theme.findByIdAndUpdate(
      id,
      {
        $set: {
          config: config
        }
      },
      { new: true, runValidators: true }
    );
    
    if (!theme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }
    
    console.log(`[Themes API] Customized theme: ${theme.name}`);
    return NextResponse.json({ 
      success: true, 
      message: 'Theme customized successfully',
      data: theme 
    });
  } catch (error) {
    console.error('[Themes API] Error customizing theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to customize theme' },
      { status: 500 }
    );
  }
}
