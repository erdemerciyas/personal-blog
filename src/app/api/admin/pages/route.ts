export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Page from '../../../../models/Page';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    await connectDB();

    const pages = await Page.find()
      .select('title slug isPublished showInNavigation order publishedAt createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(pages);

  } catch (error) {
    console.error('Pages fetch error:', error);
    return NextResponse.json(
      { error: 'Sayfalar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

