import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, fullName, phone, country, city, district, address, zipCode, isPrimary } = body;
        const addressId = params.id;

        await connectDB();
        const user = await User.findOne({ email: session.user.email });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const addrIndex = user.addresses.findIndex((a: any) => a._id.toString() === addressId);
        if (addrIndex === -1) return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 404 });

        // If setting as primary, unset others first
        if (isPrimary) {
            user.addresses.forEach((a: any) => a.isPrimary = false);
        }

        // Update fields
        const addr = user.addresses[addrIndex];
        if (title) addr.title = title;
        if (fullName) addr.fullName = fullName;
        if (phone) addr.phone = phone;
        if (country) addr.country = country;
        if (city) addr.city = city;
        if (district) addr.district = district;
        if (address) addr.address = address;
        if (zipCode) addr.zipCode = zipCode;
        if (isPrimary !== undefined) addr.isPrimary = isPrimary;

        await user.save();

        return NextResponse.json({ success: true, message: 'Adres güncellendi.' });

    } catch (error: any) {
        console.error('Update Address Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const addressId = params.id;

        await connectDB();
        const user = await User.findOne({ email: session.user.email });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Filter out the address
        const originalLength = user.addresses.length;
        user.addresses = user.addresses.filter((a: any) => a._id.toString() !== addressId);

        if (user.addresses.length === originalLength) {
            return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 404 });
        }

        await user.save();

        return NextResponse.json({ success: true, message: 'Adres silindi.' });

    } catch (error: any) {
        console.error('Delete Address Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
