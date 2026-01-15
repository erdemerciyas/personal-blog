
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendMessageEmail } from '@/lib/email';
import connectDB from '@/lib/mongoose';
import Message from '@/models/Message';
import Order from '@/models/Order';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId, message, subject, messageId } = await req.json();

        if (!orderId || !message) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        await connectDB();

        // Handle Reply to existing thread
        if (messageId) {
            const existingMessage = await Message.findById(messageId);
            if (existingMessage) {
                if (!existingMessage.conversation) existingMessage.conversation = [];

                existingMessage.conversation.push({
                    sender: 'user',
                    message: message,
                    createdAt: new Date(),
                    isRead: false
                });
                existingMessage.status = 'new'; // Re-open for admin attention
                existingMessage.isRead = false; // Admin hasn't read this new reply
                await existingMessage.save();

                // Fetch Order for Product Details
                const order = await Order.findById(orderId).lean();
                let productName = existingMessage.productName || '';
                let productId = existingMessage.productId;

                if (order && order.items && order.items.length > 0) {
                    const names = order.items.map((i: any) => i.productName).join(', ');
                    if (!productName) productName = names;

                    // If single item, we might have productId
                    if (order.items.length === 1 && order.items[0].product) {
                        productId = productId || order.items[0].product;
                    }
                }

                // Prepare History
                const conversationHistory = existingMessage.conversation.map((msg: any) => ({
                    sender: msg.sender,
                    message: msg.message,
                    date: msg.createdAt
                }));

                // Send Notification to Admin
                const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
                const messageData = {
                    senderName: session.user.name || 'İsimsiz Kullanıcı',
                    messageContent: message,
                    orderId: orderId,
                    createdAt: new Date(),
                    productName,
                    productId: productId?.toString(),
                    conversationHistory
                };

                try {
                    await sendMessageEmail({
                        to: adminEmail,
                        subject: `YENİ YANIT: Sipariş #${orderId.slice(-6)} - ${session.user.name}`,
                        messageData: messageData,
                        isAdminNotification: true
                    });
                } catch (e) { console.error(e); }

                return NextResponse.json({ success: true, message: 'Yanıtınız iletildi.' });
            }
        }

        // 1. Create New Message (Save to Database)
        await Message.create({
            name: session.user.name || 'İsimsiz Kullanıcı',
            email: session.user.email,
            phone: '', // Optional or fetch from user profile if needed
            subject: `Sipariş #${orderId.slice(-6)}: ${subject}`,
            message,
            conversation: [{
                sender: 'user',
                message: message,
                createdAt: new Date(),
                isRead: false
            }],
            type: 'order_question',
            status: 'new',
            isRead: false,
            userId: session.user.id,
            senderId: session.user.id,
            orderId: orderId,
            isGlobal: false
        });


        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

        // Fetch Order for Details
        const order = await Order.findById(orderId).lean();
        let productName = '';
        let productId = '';

        if (order && order.items && order.items.length > 0) {
            productName = order.items.map((i: any) => i.productName).join(', ');
            if (order.items.length === 1 && order.items[0].product) {
                productId = order.items[0].product;
            }
        }

        const messageData = {
            senderName: session.user.name || 'İsimsiz Kullanıcı',
            messageContent: message,
            orderId: orderId,
            createdAt: new Date(),
            productName,
            productId: productId?.toString(),
            conversationHistory: [{ sender: 'user', message, date: new Date() }]
        };

        // 2. Send Email to Admin
        try {
            await sendMessageEmail({
                to: adminEmail,
                subject: `YENİ MESAJ: Sipariş #${orderId.slice(-6)} - ${session.user.name}`,
                messageData: messageData,
                isAdminNotification: true
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        // 3. Send Confirmation Email to User
        try {
            await sendMessageEmail({
                to: session.user.email,
                subject: `Mesajınız Alındı - Sipariş #${orderId.slice(-6)}`,
                messageData: messageData,
                isAdminNotification: false
            });
        } catch (userEmailError) {
            console.error('User email sending failed:', userEmailError);
        }

        return NextResponse.json({ success: true, message: 'Mesajınız iletildi.' });

    } catch (error: any) {
        console.error('Order Message Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
