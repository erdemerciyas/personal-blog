export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import connectDB from '../../../../../lib/mongoose';
import Page from '../../../../../models/Page';
import slugify from 'slugify';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();

    const page = await Page.findById(params.id).lean();

    if (!page) {
      return NextResponse.json(
        { error: 'Sayfa bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(page);

  } catch (error) {
    console.error('Page fetch error:', error);
    return NextResponse.json(
      { error: 'Sayfa yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await request.json();
    await connectDB();

    // Generate slug if title changed
    if (body.title && !body.slug) {
      body.slug = slugify(body.title, { lower: true, strict: true });
    }

    const page = await Page.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!page) {
      return NextResponse.json(
        { error: 'Sayfa bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(page);

  } catch (error) {
    console.error('Page update error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Bu slug zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Sayfa güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();

    const page = await Page.findByIdAndDelete(params.id);

    if (!page) {
      return NextResponse.json(
        { error: 'Sayfa bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Sayfa silindi' });

  } catch (error) {
    console.error('Page delete error:', error);
    return NextResponse.json(
      { error: 'Sayfa silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
