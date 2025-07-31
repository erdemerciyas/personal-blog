export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';

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

    // For now, return an empty array since there's no Page model yet
    // This can be expanded when a Page model is created
    const pages = [];

    return NextResponse.json(pages);

  } catch (error) {
    console.error('Pages fetch error:', error);
    return NextResponse.json(
      { error: 'Sayfalar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    await request.json();
    await connectDB();

    // TODO: Implement page creation when Page model is ready
    // For now, return a placeholder response
    
    return NextResponse.json(
      { message: 'Sayfa oluşturma özelliği yakında eklenecek' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Page creation error:', error);
    return NextResponse.json(
      { error: 'Sayfa oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}