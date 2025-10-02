export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Page from '../../../../models/Page';
import slugify from 'slugify';

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
      .select('title slug isPublished publishedAt createdAt updatedAt')
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

    const body = await request.json();
    await connectDB();

    // Generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = slugify(body.title, { lower: true, strict: true });
    }

    // Add author
    body.author = session.user.id;

    const page = await Page.create(body);
    
    return NextResponse.json(page, { status: 201 });

  } catch (error) {
    console.error('Page creation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Bu slug zaten kullanılıyor' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Geçersiz veri' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Sayfa oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}