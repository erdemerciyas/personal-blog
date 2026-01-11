import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Service from '@/models/Service';
import connectDB from '@/lib/mongoose';

/**
 * GET /api/admin/services - List all services for admin
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const services = await Service.find()
      .sort({ createdAt: -1 })
      .sort({ createdAt: -1 });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/services - Create a new service
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();

    const service = new Service({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.save();

    return NextResponse.json(
      { success: true, data: service },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
