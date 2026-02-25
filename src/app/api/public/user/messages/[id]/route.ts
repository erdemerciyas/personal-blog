
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Message from '@/models/Message';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
        }

        await connectDB();

        // Ensure the message belongs to the user (either sent by them or sent to them)
        const message = await Message.findOne({
            _id: id,
            $or: [
                { userId: session.user.id },
                { senderId: session.user.id },
                { receiverId: session.user.id }
            ]
        });

        if (!message) {
            return NextResponse.json({ error: 'Message not found or access denied' }, { status: 404 });
        }

        // Logic for "deleting":
        // For now, we can hard delete. In a real app, we might want 'deletedBySender', 'deletedByReceiver'.
        // Given simplicity, we'll hard delete.
        await Message.deleteOne({ _id: id });

        return NextResponse.json({ success: true, message: 'Message deleted successfully' });

    } catch (error) {
        console.error('Delete message error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
