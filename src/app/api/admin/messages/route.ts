import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Message from '@/models/Message';
import connectDB from '@/lib/mongoose';

/**
 * GET /api/admin/messages - List all messages for admin
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .select('_id name email subject message status type productId productName createdAt updatedAt');

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/messages - Create a new message
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const message = new Message({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'unread',
    });

    await message.save();

    return NextResponse.json(
      { success: true, data: message },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
