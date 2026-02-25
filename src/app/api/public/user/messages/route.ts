
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Message from '@/models/Message';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Query for:
        // 1. Messages sent BY the user (userId or senderId)
        // 2. Messages sent TO the user (receiverId)
        // 3. Global announcements (isGlobal: true)
        const query = {
            $or: [
                { userId: session.user.id },
                { senderId: session.user.id },
                { receiverId: session.user.id },
                { isGlobal: true }
            ]
        };

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Message.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: messages,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            unreadCount: await Message.countDocuments({
                $and: [
                    query, // reuse the base query
                    {
                        $or: [
                            { status: 'replied' }, // Responses to user
                            { isGlobal: true, isRead: false }, // Announcements (simplified, normally requires per-user tracking)
                            // Ideally, we'd have a 'userRead' flag. For now, 'replied' implies there is something to see.
                        ]
                    }
                ]
            })
        });

    } catch (error) {
        console.error('Fetch messages error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
