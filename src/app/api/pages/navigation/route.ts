export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import Page from '../../../../models/Page';

export async function GET() {
  try {
    await connectDB();

    const pages = await Page.find({
      isPublished: true,
      showInNavigation: true
    })
      .select('title slug order')
      .sort({ order: 1 })
      .lean();

    return NextResponse.json(pages);

  } catch (error) {
    console.error('Navigation pages fetch error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
