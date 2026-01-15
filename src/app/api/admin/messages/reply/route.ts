import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Message from '@/models/Message';
import connectDB from '@/lib/mongoose';
import { sendMessageEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messageId, reply } = await req.json();

        if (!messageId || !reply) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        await connectDB();

        // 1. Update the message in DB
        const message = await Message.findById(messageId);
        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        // Initialize conversation if it doesn't exist (legacy documents)
        if (!message.conversation) {
            message.conversation = [];
            // Optionally, we could migrate the 'message.message' and 'message.adminReply' into conversation here
            // but let's just start the thread from here to be safe and simple.
        }

        // Push to conversation
        message.conversation.push({
            sender: 'admin',
            message: reply,
            createdAt: new Date(),
            isRead: false // User hasn't read it
        });

        // Also keep deprecated field for legacy support if needed, or better, stop using it.
        // We will update it to the LATEST reply just in case some UI depends on it.
        message.adminReply = reply;

        message.status = 'replied';
        message.repliedAt = new Date();

        // Mark previous user messages as read since admin is replying
        if (message.conversation) {
            message.conversation.forEach((msg: any) => {
                if (msg.sender === 'user') msg.isRead = true;
            });
        }

        await message.save();

        // 2. Send email to user
        try {
            await sendMessageEmail({
                to: message.email,
                subject: `Sayın ${message.name}, sorunuz yanıtlandı`,
                messageData: {
                    senderName: message.name, // The user is the original sender
                    messageContent: message.message,
                    adminReply: reply,
                    orderId: message.orderId,
                    productName: message.productName,
                    createdAt: message.createdAt
                },
                isAdminNotification: false
            });
        } catch (emailError) {
            console.error('Reply email sending failed:', emailError);
            // Non-fatal, but we should probably inform admin or log it.
        }

        return NextResponse.json({ success: true, message: 'Yanıt gönderildi ve kaydedildi.' });

    } catch (error) {
        console.error('Reply API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
