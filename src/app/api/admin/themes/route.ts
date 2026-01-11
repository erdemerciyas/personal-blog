/**
 * API Route for Theme Management
 */

import { NextRequest, NextResponse } from 'next/server';
import Theme from '../../../../models/Theme';
import connectDB from '../../../../lib/mongoose';

// GET /api/admin/themes - List all themes
export async function GET(_request: NextRequest) {
  try {
    await connectDB();
    console.log('[Themes API] Fetching all themes...');
    const themes = await Theme.getAllThemes();
    console.log(`[Themes API] Found ${themes.length} themes`);
    return NextResponse.json(themes || []);
  } catch (error) {
    console.error('[Themes API] Error fetching themes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}

// POST /api/admin/themes - Create a new theme
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    console.log('[Themes API] Creating new theme...');
    const body = await request.json();

    const theme = await Theme.create(body);
    console.log(`[Themes API] Created theme: ${theme.name}`);
    return NextResponse.json({ success: true, data: theme }, { status: 201 });
  } catch (error) {
    console.error('[Themes API] Error creating theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create theme' },
      { status: 500 }
    );
  }
}
