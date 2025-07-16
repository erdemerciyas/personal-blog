export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Portfolio from '../../../../models/Portfolio';
import Service from '../../../../models/Service';
import Message from '../../../../models/Message';

export async function GET(request: NextRequest) {
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

    // Paralel olarak tüm istatistikleri al
    const [portfolioCount, servicesCount, messagesCount, recentMessages] = await Promise.all([
      Portfolio.countDocuments(),
      Service.countDocuments(),
      Message.countDocuments(),
      Message.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email subject createdAt status')
    ]);

    const stats = {
      portfolioCount,
      servicesCount,
      messagesCount,
      mediaCount: 0, // Placeholder - medya sayısı için
      recentMessages: recentMessages.map(msg => ({
        _id: msg._id,
        name: msg.name,
        email: msg.email,
        subject: msg.subject,
        createdAt: msg.createdAt,
        status: msg.status || 'pending'
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'İstatistikler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
} 