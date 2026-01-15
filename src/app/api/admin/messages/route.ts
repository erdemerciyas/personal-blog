import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Message from '@/models/Message';
import connectDB from '@/lib/mongoose';

export const dynamic = 'force-dynamic';

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

    const { searchParams } = new URL(_req.url);
    const scope = searchParams.get('scope');

    let query = {};
    if (scope === 'general') {
      // Exclude e-commerce related messages
      query = { type: { $nin: ['product_question', 'order_question'] } };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .select('_id name email subject message status type productId productName orderId createdAt updatedAt conversation adminReply');

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
