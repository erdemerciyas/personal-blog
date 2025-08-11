export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Portfolio from '../../../../models/Portfolio';
import Product from '../../../../models/Product';
import Service from '../../../../models/Service';
import Message from '../../../../models/Message';
import User from '../../../../models/User';

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

    // Medya sayısını Cloudinary'den al
    let mediaCount = 0;
    try {
      const cloudinary = await import('cloudinary').then(m => m.v2);
      
      // Cloudinary config
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const result = await cloudinary.api.resources({
        resource_type: 'image',
        max_results: 500, // Maksimum sayı
        type: 'upload'
      });
      
      mediaCount = result.resources ? result.resources.length : 0;
    } catch (cloudinaryError) {
      console.error('Cloudinary media count error:', cloudinaryError);
      mediaCount = 0;
    }

    // Paralel olarak tüm istatistikleri al
    const [portfolioCount, servicesCount, messagesCount, usersCount, recentMessages, productsCount] = await Promise.all([
      Portfolio.countDocuments(),
      Service.countDocuments(),
      Message.countDocuments(),
      User.countDocuments(),
      Message.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email subject createdAt status'),
      Product.countDocuments()
    ]);

    const stats = {
      portfolioCount,
      servicesCount,
      messagesCount,
      usersCount,
      mediaCount,
      productsCount,
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