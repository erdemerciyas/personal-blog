/**
 * API Route for Single Theme Operations
 * GET - Get theme details
 * PUT - Update theme
 * DELETE - Delete theme
 */

import { NextRequest, NextResponse } from 'next/server';
import Theme from '../../../../../models/Theme';
import connectDB from '../../../../../lib/mongoose';

// GET /api/admin/themes/[id] - Get theme details
export async function GET(
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
    
    console.log(`[Themes API] Fetching theme with ID: ${id}`);
    
    const theme = await Theme.findById(id);
    
    if (!theme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }
    
    console.log(`[Themes API] Found theme: ${theme.name}`);
    return NextResponse.json({ success: true, data: theme });
  } catch (error) {
    console.error('[Themes API] Error fetching theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch theme' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/themes/[id] - Update theme
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
    
    console.log(`[Themes API] Updating theme with ID: ${id}`);
    
    const body = await request.json();
    
    const theme = await Theme.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!theme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }
    
    console.log(`[Themes API] Updated theme: ${theme.name}`);
    return NextResponse.json({ success: true, data: theme });
  } catch (error) {
    console.error('[Themes API] Error updating theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/themes/[id] - Delete theme
export async function DELETE(
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
    
    console.log(`[Themes API] Deleting theme with ID: ${id}`);
    
    const theme = await Theme.findByIdAndDelete(id);
    
    if (!theme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }
    
    console.log(`[Themes API] Deleted theme: ${theme.name}`);
    return NextResponse.json({ 
      success: true, 
      message: 'Theme deleted successfully',
      data: theme 
    });
  } catch (error) {
    console.error('[Themes API] Error deleting theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete theme' },
      { status: 500 }
    );
  }
}
