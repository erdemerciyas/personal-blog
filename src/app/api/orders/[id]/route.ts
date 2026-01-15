import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        // Basic admin check - in a real app, use middleware or role check
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();
        const { status, adminNotes, notifyCustomer } = body;

        const order = await Order.findById(params.id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Stock Deduction Logic
        // Deduct if changing TO 'shipped' or 'completed' and it wasn't already 'shipped' or 'completed'
        // This prevents double deduction if admin clicks update multiple times or moves from shipped -> completed
        const isStockReducedStatus = (s: string) => ['shipped', 'completed'].includes(s);
        const wasStockReduced = isStockReducedStatus(order.status);
        const willStockReduce = isStockReducedStatus(status);

        if (willStockReduce && !wasStockReduced) {

            // Iterate through items and reduce stock
            for (const item of order.items) {
                if (item.product) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        // Prevent negative stock if desired, or just allow it
                        product.stock = Math.max(0, product.stock - item.quantity);
                        await product.save();
                    }
                }
            }
        }

        // Update fields
        const oldStatus = order.status;
        if (status) order.status = status;
        if (adminNotes !== undefined) order.adminNotes = adminNotes;

        await order.save();

        // Send Email Notification if status changed
        console.log(`Order Update Debug: ID=${params.id}, OldStatus=${oldStatus}, NewStatus=${status}, Email=${order.customerEmail}`);

        // Check if we should send email
        const statusChanged = status && status !== oldStatus;
        const noteChanged = adminNotes !== undefined && adminNotes !== order.adminNotes;

        // Default notifyCustomer to true if status changed, unless explicitly set to false
        const shouldNotify = notifyCustomer !== undefined ? notifyCustomer : statusChanged;
        const shouldSendEmail = shouldNotify || (noteChanged && adminNotes);

        console.log(`Email Logic Check: ExplicitNotify=${notifyCustomer}, StatusChanged=${statusChanged} (New: ${status}, Old: ${oldStatus}), NoteChanged=${noteChanged}, ShouldSend=${shouldSendEmail}`);

        if (shouldSendEmail) {
            console.log(`[Email Trigger] Attempting to send status email. To: ${order.customerEmail}`);

            // Convert to POJO to avoid Mongoose Document quirks in template
            const orderObject = order.toObject();

            try {
                // 1. Send to Customer
                const emailResult = await sendOrderEmail({
                    to: order.customerEmail,
                    subject: `Sipariş Durumu Güncellendi: #${order._id.toString().slice(-6).toUpperCase()}`,
                    order: orderObject,
                    isStatusUpdate: true,
                    adminNote: adminNotes
                });

                if (emailResult) {
                    console.log(`[Email Success] Customer email sent to: ${order.customerEmail}`);
                } else {
                    console.error(`[Email Failure] Customer email function returned false`);
                }

                // 2. Send to Admin (Notify about the update)
                const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;
                if (adminEmail) {
                    await sendOrderEmail({
                        to: adminEmail,
                        subject: `Sipariş Durumu Değişti: #${order._id.toString().slice(-6).toUpperCase()} (${status || oldStatus})`,
                        order: orderObject,
                        isAdmin: true,
                        isStatusUpdate: true,
                        adminNote: `Durum "${status || oldStatus}" olarak güncellendi. Not: ${adminNotes || 'Yok'}`
                    });
                    console.log(`[Email Success] Admin notification sent to: ${adminEmail}`);
                }

            } catch (emailErr) {
                console.error('[Email Exception] Failed to send update emails:', emailErr);
            }
        } else {
            console.log(`[Email Skip] Conditions not met. Explicit: ${notifyCustomer}, StatusChanged: ${statusChanged}, NoteChanged: ${noteChanged}`);
        }

        return NextResponse.json({ success: true, data: order });
    } catch (error) {
        console.error('Update Order Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
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

        // Verify ownership
        const isOwner = (session.user.id && order.userId?.toString() === session.user.id) ||
            (order.customerEmail === session.user.email);

        // Allow admin to delete/soft-delete too (optional, but good for this generic route)
        // For now keeping original logic but ensuring context is correct

        if (!isOwner) {
            // In a real Admin API, we'd check for Admin role here. 
            // Assuming this route is used by both User (profile) and Admin.
            // If this is strictly Admin route, we should assume Admin access.
            // Ideally we check `session.user.role === 'admin'`
            // For safety, let's keep the original logic for DELETE for now as it was specific.
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check status - Only allow deleting cancelled or refunded orders
        if (!['cancelled', 'refunded', 'completed'].includes(order.status)) {
            return NextResponse.json({ error: 'Sadece iptal edilmiş veya tamamlanmış siparişleri silebilirsiniz.' }, { status: 400 });
        }

        // Soft Delete (Hide from user)
        order.isUserVisible = false;
        await order.save();

        return NextResponse.json({ success: true, message: 'Sipariş listenizden kaldırıldı.' });

    } catch (error: any) {
        console.error('Delete Order Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
