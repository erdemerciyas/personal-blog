export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import Portfolio from '../../../../models/Portfolio';
import Product from '../../../../models/Product';
import Service from '../../../../models/Service';
import Message from '../../../../models/Message';
import User from '../../../../models/User';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';

export const GET = withSecurity(SecurityConfigs.admin)(async () => {
  try {
    await connectDB();

    // Medya sayısını Cloudinary'den al (Search API ile hızlı toplam, Admin API ile geri dönüş)
    let mediaCount = 0;
    try {
      const cloudinary = await import('cloudinary').then(m => m.v2);

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      // 1) Tercihen Search API ile toplam sayıyı al (en hızlı yol)
      try {
        const searchResult = await cloudinary.search
          .expression('resource_type:image AND type:upload')
          .max_results(1)
          .execute();
        if (typeof searchResult.total_count === 'number') {
          mediaCount = searchResult.total_count;
        }
      } catch (searchErr) {
        console.warn('Cloudinary Search API not available, falling back to Admin API:', searchErr instanceof Error ? searchErr.message : searchErr);
      }

      // 2) Fall back: Admin API ile sayfalamalı sayım
      if (!mediaCount) {
        let total = 0;
        let nextCursor: string | undefined = undefined;
        const prefixes = ['extremeecu/', 'personal-blog/'];
        for (const prefix of prefixes) {
          nextCursor = undefined;
          // Sayfalamalı çekim
          // En fazla birkaç sayfa çekecek şekilde güvenli limit (her sayfa 500)
          let safety = 10;
          do {
            // eslint-disable-next-line no-await-in-loop
            const adminRes = await cloudinary.api.resources({
              resource_type: 'image',
              type: 'upload',
              prefix,
              max_results: 500,
              next_cursor: nextCursor,
            } as { resource_type: string; type: string; prefix: string; max_results: number; next_cursor?: string });
            total += Array.isArray(adminRes.resources) ? adminRes.resources.length : 0;
            nextCursor = (adminRes as unknown as { next_cursor?: string }).next_cursor;
            safety -= 1;
          } while (nextCursor && safety > 0);
        }
        mediaCount = total;
      }
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
}); 