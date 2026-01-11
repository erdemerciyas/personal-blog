/**
 * API Route for Theme Activation
 * POST - Activate a specific theme and deactivate all others
 */

import { NextRequest, NextResponse } from 'next/server';
import Theme from '../../../../../../models/Theme';
import connectDB from '../../../../../../lib/mongoose';

// POST /api/admin/themes/[id]/activate - Activate theme
export async function POST(
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

        console.log(`[Themes API] Activating theme with ID: ${id}`);

        // 1. Deactivate all themes
        await Theme.updateMany({}, { isActive: false });

        // 2. Activate the selected theme
        const theme = await Theme.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        );

        if (!theme) {
            // If theme not found, revert default theme to active (optional safety)
            // For now just error out
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
