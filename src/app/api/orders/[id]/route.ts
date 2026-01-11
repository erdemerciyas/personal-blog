import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Order from '@/models/Order';
import { sendOrderEmail } from '@/lib/email';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();
        const { status, adminNotes } = body;

        // Verify order exists first to get customer email
        const originalOrder = await Order.findById(id);
        if (!originalOrder) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status, adminNotes },
            { new: true }
        );

        // Send status update email
        // Logic: Send email if status changed or there is a note with the update
        // For now, let's assume every update action in admin panel that calls this endpoint intends to notify user
        if (status !== originalOrder.status || adminNotes) {
            await sendOrderEmail({
                to: order.customerEmail,
                subject: `Sipariş Durumu Güncellemesi - #${order._id.toString().slice(-6).toUpperCase()}`,
                order: order,
                isStatusUpdate: true,
                adminNote: adminNotes
            });
        }

        return NextResponse.json({ success: true, data: order });

    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
    }
}
