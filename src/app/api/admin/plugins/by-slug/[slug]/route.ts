/**
 * API Route for Plugin by Slug
 */

import { NextRequest, NextResponse } from 'next/server';
import Plugin from '../../../../../../models/Plugin';
import connectDB from '../../../../../../lib/mongoose';

// GET /api/admin/plugins/by-slug/[slug] - Get plugin by slug
export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const { slug } = params;
    
    console.log(`[Plugin API] Fetching plugin by slug: ${slug}`);
    const plugin = await Plugin.findOne({ slug });
    
    if (!plugin) {
      return NextResponse.json(
        { success: false, error: 'Plugin not found' },
        { status: 404 }
      );
    }
    
    console.log(`[Plugin API] Found plugin: ${plugin.name}`);
    return NextResponse.json({ success: true, data: plugin });
  } catch (error) {
    console.error('[Plugin API] Error fetching plugin by slug:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plugin' },
      { status: 500 }
    );
  }
}
