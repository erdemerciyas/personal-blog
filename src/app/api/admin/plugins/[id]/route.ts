/**
 * API Route for Plugin Edit and Delete
 */

import { NextRequest, NextResponse } from 'next/server';
import Plugin from '../../../../../models/Plugin';
import { pluginManager } from '../../../../../plugins/core/PluginManager';
import connectDB from '../../../../../lib/mongoose';

// GET /api/admin/plugins/[id] - Get single plugin
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    
    console.log(`[Plugin API] Fetching plugin: ${id}`);
    const plugin = await Plugin.findById(id);
    
    if (!plugin) {
      return NextResponse.json(
        { success: false, error: 'Plugin not found' },
        { status: 404 }
      );
    }
    
    console.log(`[Plugin API] Found plugin: ${plugin.name}`);
    return NextResponse.json({ success: true, data: plugin });
  } catch (error) {
    console.error('[Plugin API] Error fetching plugin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plugin' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/plugins/[id] - Update plugin
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    
    console.log(`[Plugin Edit API] Updating plugin: ${id}`);
    const body = await request.json();
    
    const plugin = await Plugin.findById(id);
    if (!plugin) {
      return NextResponse.json(
        { success: false, error: 'Plugin not found' },
        { status: 404 }
      );
    }

    // Update plugin fields
    Object.assign(plugin, body);
    await plugin.save();
    
    console.log(`[Plugin Edit API] Plugin updated: ${plugin.name}`);
    
    // If plugin was active, reload it
    if (plugin.isActive && plugin.type === 'custom') {
      try {
        await pluginManager.reloadPlugin(plugin.slug);
        console.log(`[Plugin Edit API] Plugin reloaded: ${plugin.name}`);
      } catch (error) {
        console.error('[Plugin Edit API] Error reloading plugin:', error);
        // Continue even if reload fails
      }
    }
    
    return NextResponse.json({
      success: true,
      data: plugin,
      message: `Plugin ${plugin.name} updated successfully`
    });
  } catch (error) {
    console.error('[Plugin Edit API] Error updating plugin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update plugin' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/plugins/[id] - Delete plugin
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    
    console.log(`[Plugin Delete API] Deleting plugin: ${id}`);
    
    const plugin = await Plugin.findById(id);
    if (!plugin) {
      return NextResponse.json(
        { success: false, error: 'Plugin not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of built-in plugins
    if (plugin.type === 'built-in') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete built-in plugins' },
        { status: 400 }
      );
    }

    // Unload plugin if it's active
    if (plugin.isActive) {
      try {
        await pluginManager.unloadPlugin(plugin.slug);
        console.log(`[Plugin Delete API] Plugin unloaded: ${plugin.name}`);
      } catch (error) {
        console.error('[Plugin Delete API] Error unloading plugin:', error);
        // Continue even if unload fails
      }
    }

    // Delete plugin
    await Plugin.findByIdAndDelete(id);
    
    console.log(`[Plugin Delete API] Plugin deleted: ${plugin.name}`);
    
    return NextResponse.json({
      success: true,
      message: `Plugin ${plugin.name} deleted successfully`
    });
  } catch (error) {
    console.error('[Plugin Delete API] Error deleting plugin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete plugin' },
      { status: 500 }
    );
  }
}
