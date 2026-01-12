
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Message from '@/models/Message';
import connectDB from '@/lib/mongoose';
import { authOptions } from '@/lib/auth';

export async function POST(
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

        const updatedMessage = await Message.findByIdAndUpdate(
            id,
            { status: 'read' },
            { new: true }
        );

        if (!updatedMessage) {
            return NextResponse.json(
                { success: false, error: 'Message not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Message marked as read', data: updatedMessage },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating message status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update message status' },
            { status: 500 }
        );
    }
}
