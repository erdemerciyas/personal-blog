import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import { sendOrderEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { address, payment, cartId } = body;

        // Identify Cart
        const query = session?.user?.id
            ? { userId: session.user.id }
            : { cartId: cartId };

        const cart = await Cart.findOne(query).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Determine Customer Info
        const customerEmail = session?.user?.email || address.email;
        const customerName = session?.user?.name || address.fullName;

        // Create Order Items
        const orderItems = cart.items.map((item: any) => ({
            product: item.product._id,
            productName: item.product.title,
            productSlug: item.product.slug,
            quantity: item.quantity,
            price: item.product.price,
            selectedOptions: []
        }));

        const totalAmount = orderItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

        // Create Order
        const order = await Order.create({
            userId: session?.user?.id || undefined,
            guestId: !session?.user?.id ? cartId : undefined,
            customerName,
            customerEmail,
            customerPhone: address.phone,
            customerAddress: `${address.city} / ${address.zipCode} - ${address.country} / ${address.address}`,
            items: orderItems,
            totalPrice: totalAmount,
            paymentStatus: 'paid', // Mock
            orderStatus: 'preparing',
            status: 'preparing',
            paymentProvider: payment.provider,
            paymentId: crypto.randomUUID(),
        });

        // Clear Cart
        await Cart.deleteOne({ _id: cart._id });

        // Send Emails (Async - don't block response)
        const sendEmails = async () => {
            try {
                // 1. Send to Customer
                await sendOrderEmail({
                    to: customerEmail,
                    subject: `Siparişiniz Alındı: #${order._id.toString().slice(-6).toUpperCase()}`,
                    order: order.toObject(),
                    isAdmin: false
                });

                // 2. Send to Admin
                const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;
                if (adminEmail) {
                    await sendOrderEmail({
                        to: adminEmail,
                        subject: `Yeni Sipariş: #${order._id.toString().slice(-6).toUpperCase()}`,
                        order: order.toObject(),
                        isAdmin: true
                    });
                }
            } catch (emailError) {
                console.error('Failed to send order emails:', emailError);
            }
        };

        // Execute email sending but don't await to keep UI fast, or await if reliability is critical
        // Next.js Server Components/API routes might kill simple async tasks if response triggers too fast.
        // Safer to await in standard Next.js API routes unless using background workers.
        await sendEmails();

        return NextResponse.json({ success: true, orderId: order._id }, { status: 201 });

    } catch (error) {
        console.error('Create Order Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
