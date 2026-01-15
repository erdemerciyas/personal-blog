import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // We use findOne to get the subdocument array
        const user = await User.findOne({ email: session.user.email }).select('addresses');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Sort: Primary first, then others
        const sortedAddresses = user.addresses?.sort((a: any, b: any) =>
            (b.isPrimary === a.isPrimary) ? 0 : b.isPrimary ? 1 : -1
        ) || [];

        return NextResponse.json({ success: true, data: sortedAddresses });

    } catch (error: any) {
        console.error('Fetch Addresses Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, fullName, phone, country, city, district, address, zipCode, isPrimary } = body;

        if (!title || !address || !city) {
            return NextResponse.json({ error: 'Zorunlu alanları doldurunuz.' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If making this primary, unset others
        if (isPrimary) {
            user.addresses.forEach((addr: any) => addr.isPrimary = false);
        } else if (!user.addresses || user.addresses.length === 0) {
            // First address is always primary
            body.isPrimary = true;
        }

        user.addresses.push({
            title, fullName, phone, country, city, district, address, zipCode, isPrimary: body.isPrimary
        });

        await user.save();

        return NextResponse.json({ success: true, data: user.addresses, message: 'Adres eklendi.' });

    } catch (error: any) {
        console.error('Add Address Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
