import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Order from '@/models/Order';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';

export const POST = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
    try {
        await connectDB();
        const { orderIds, action } = await req.json();

        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return NextResponse.json({ success: false, error: 'No orders selected' }, { status: 400 });
        }

        if (action === 'soft_delete') {
            // Soft Delete: Set deletedAt to NOW
            const result = await Order.updateMany(
                { _id: { $in: orderIds } },
                { $set: { deletedAt: new Date() } }
            );
            console.log('Soft Delete Result:', {
                ids: orderIds,
                matched: result.matchedCount,
                modified: result.modifiedCount
            });

            return NextResponse.json({ success: true, message: `${result.modifiedCount} orders moved to trash.` });

        } else if (action === 'restore') {
            // Restore: Set deletedAt to NULL
            await Order.updateMany(
                { _id: { $in: orderIds } },
                { $set: { deletedAt: null } }
            );
            return NextResponse.json({ success: true, message: `${orderIds.length} orders restored.` });

        } else {
            return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Bulk action error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});

export const DELETE = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
    try {
        await connectDB();
        const { orderIds } = await req.json();

        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return NextResponse.json({ success: false, error: 'No orders selected' }, { status: 400 });
        }

        // Permanent Delete
        await Order.deleteMany({ _id: { $in: orderIds } });

        return NextResponse.json({ success: true, message: `${orderIds.length} orders permanently deleted.` });

    } catch (error: any) {
        console.error('Bulk permanent delete error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});
