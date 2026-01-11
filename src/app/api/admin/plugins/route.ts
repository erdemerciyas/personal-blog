/**
 * API Route for Plugin Management
 */

import { NextRequest, NextResponse } from 'next/server';
import Plugin from '../../../../models/Plugin';
import connectDB from '../../../../lib/mongoose';

// GET /api/admin/plugins - List all plugins
export async function GET(_request: NextRequest) {
  try {
    await connectDB();
    console.log('[Plugins API] Fetching all plugins...');
    const plugins = await Plugin.getAllPlugins();
    console.log(`[Plugins API] Found ${plugins.length} plugins`);
    return NextResponse.json({ success: true, data: plugins });
  } catch (error) {
    console.error('[Plugins API] Error fetching plugins:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plugins' },
      { status: 500 }
    );
  }
}

// POST /api/admin/plugins - Create a new plugin
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    console.log('[Plugins API] Creating new plugin...');
    const body = await request.json();
    
    const plugin = await Plugin.create(body);
    console.log(`[Plugins API] Created plugin: ${plugin.name}`);
    return NextResponse.json({ success: true, data: plugin }, { status: 201 });
  } catch (error) {
    console.error('[Plugins API] Error creating plugin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create plugin' },
      { status: 500 }
    );
  }
}
