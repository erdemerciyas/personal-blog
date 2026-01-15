import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Order from '@/models/Order';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const order = await Order.findById(params.id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Verify ownership (Check both ID and Email for robustness)
        const isOwner = (session.user.id && order.userId?.toString() === session.user.id) ||
            (order.customerEmail === session.user.email);

        if (!isOwner) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check status
        if (!['pending', 'preparing', 'new'].includes(order.status)) {
            return NextResponse.json({ error: 'Bu sipariş artık iptal edilemez.' }, { status: 400 });
        }

        // Update status
        order.status = 'cancelled';
        await order.save();

        // TODO: Send cancellation email to Admin and User

        return NextResponse.json({ success: true, message: 'Sipariş iptal edildi.' });

    } catch (error: any) {
        console.error('Cancel Order Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
