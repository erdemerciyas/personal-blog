/**
 * API Route for Plugin Toggle
 */

import { NextRequest, NextResponse } from 'next/server';
import Plugin from '../../../../../models/Plugin';
import { pluginManager } from '../../../../../plugins/core/PluginManager';
import connectDB from '../../../../../lib/mongoose';

// POST /api/admin/plugins/toggle - Toggle plugin activation
export async function POST(request: NextRequest) {
  try {
    console.log('[Plugin Toggle API] Starting plugin toggle process...');
    await connectDB();
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      console.log('[Plugin Toggle API] Missing plugin slug');
      return NextResponse.json(
        { success: false, error: 'Plugin slug is required' },
        { status: 400 }
      );
    }

    // Toggle plugin in database
    console.log(`[Plugin Toggle API] Toggling plugin: ${slug}`);
    const plugin = await Plugin.togglePlugin(slug);
    console.log(`[Plugin Toggle API] Plugin ${plugin.name} is now ${plugin.isActive ? 'active' : 'inactive'}`);
    
    // Only load/unload custom plugins (built-in plugins don't have module files)
    if (plugin.type === 'custom') {
      if (plugin.isActive) {
        try {
          console.log(`[Plugin Toggle API] Loading custom plugin: ${slug}`);
          await pluginManager.loadPlugin(slug);
          console.log(`[Plugin Toggle API] Plugin loaded successfully: ${plugin.name}`);
        } catch (error) {
          console.error('[Plugin Toggle API] Error loading plugin:', error);
          // Revert activation
          console.log('[Plugin Toggle API] Reverting activation due to error');
          await Plugin.togglePlugin(slug);
          return NextResponse.json(
            { success: false, error: 'Failed to load plugin. Check console for details.' },
            { status: 500 }
          );
        }
      } else {
        // If deactivating, unload plugin
        console.log(`[Plugin Toggle API] Unloading plugin: ${slug}`);
        try {
          await pluginManager.unloadPlugin(slug);
          console.log(`[Plugin Toggle API] Plugin unloaded successfully: ${plugin.name}`);
        } catch (error) {
          console.error('[Plugin Toggle API] Error unloading plugin:', error);
          // Continue even if unload fails
        }
      }
    }
    
    console.log(`[Plugin Toggle API] Plugin ${plugin.name} ${plugin.isActive ? 'activated' : 'deactivated'} successfully`);
    
    return NextResponse.json({
      success: true,
      data: plugin,
      message: `Plugin ${plugin.name} ${plugin.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('[Plugin Toggle API] Fatal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle plugin. Check console for details.' },
      { status: 500 }
    );
  }
}
