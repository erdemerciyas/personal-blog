
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Message from '@/models/Message';
import connectDB from '@/lib/mongoose';
import { authOptions } from '@/lib/auth'; // Ensure this path is correct, might be in a different place

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Message ID is required' },
                { status: 400 }
            );
        }

        const deletedMessage = await Message.findByIdAndDelete(id);

        if (!deletedMessage) {
            return NextResponse.json(
                { success: false, error: 'Message not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Message deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting message:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete message' },
            { status: 500 }
        );
    }
}
