import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product'; // Ensure Product model is registered

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // 1. Parse Pagination Params
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // 2. Build Query
        const query: any = {};

        if (session.user.id) {
            query.userId = session.user.id;
        } else {
            query.customerEmail = session.user.email;
        }

        // Filter out hidden orders
        query.isUserVisible = { $ne: false };

        // 3. Execute Query with Pagination
        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'items.product',
                    select: 'title slug coverImage price stock'
                }),
            Order.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: orders,
            pagination: {
                total,
                page,
                limit,
                totalPages
            }
        });

    } catch (error: any) {
        console.error('Error fetching my orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
