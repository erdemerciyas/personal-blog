export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import Portfolio from '../../../../models/Portfolio';
import Product from '../../../../models/Product';
import Service from '../../../../models/Service';
import Message from '../../../../models/Message';
import User from '../../../../models/User';
import News from '../../../../models/News';
import Order from '../../../../models/Order';
import ProductCategory from '../../../../models/ProductCategory';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';

export const GET = withSecurity(SecurityConfigs.admin)(async () => {
  try {
    await connectDB();

    // Medya sayılarını Cloudinary'den al
    let mediaCount = 0;
    let productMediaCount = 0;

    try {
      const cloudinary = await import('cloudinary').then(m => m.v2);

      // Cloudinary config
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      // 1. Get Total Count (approximate using max_results loop or just one page for now)
      // Note: For accurate counts we should use Search API but Admin API listed resources is okay for now

      // Get Product Images Count directly by folder
      const productResult = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'personal-blog/products/',
        max_results: 500
      });
      productMediaCount = productResult.resources ? productResult.resources.length : 0;

      // Get Site Images (Total - Products is a rough approximation if we grab everything)
      // Or just get root folder content if well organized. 
      // Current approach: Get 'all' and subtract products or filter out.
      // Better: Just assume 'personal-blog/' prefix for everything.

      const allResult = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'personal-blog/',
        max_results: 500
      });



      // Site media is whatever is NOT in products folder
      // Simple logic: Total - Product. 
      // Note: This assumes all product images are correctly in that folder.

      // Refined logic: Manually filter the 'allResult' to be safe if total < 500
      if (allResult.resources) {
        mediaCount = allResult.resources.filter((r: any) => !r.public_id.startsWith('personal-blog/products/')).length;
      }

    } catch (cloudinaryError) {
      console.error('Cloudinary media count error:', cloudinaryError);
      mediaCount = 0;
      productMediaCount = 0;
    }

    const [
      portfolioCount, servicesCount, messagesCount, usersCount,
      recentMessages, productsCount, newsCount, productQuestionsCount,
      recentNews, recentPortfolio, recentServices, recentProducts, recentUsers,
      ordersCount, productCategoriesCount
    ] = await Promise.all([
      Portfolio.countDocuments(),
      Service.countDocuments(),
      Message.countDocuments({ type: { $ne: 'product_question' } }), // General messages only
      User.countDocuments(),
      Message.find({ type: { $ne: 'product_question' } }).sort({ createdAt: -1 }).limit(5).select('name email subject createdAt status'),
      Product.countDocuments(),
      News.countDocuments(),
      Message.countDocuments({ type: 'product_question' }), // Product Questions Count
      News.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt views'),
      Portfolio.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt'),
      Service.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt'),
      Product.find().sort({ createdAt: -1 }).limit(5).select('name status createdAt'),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Order.countDocuments(),
      ProductCategory.countDocuments()
    ]);

    const stats = {
      portfolioCount,
      servicesCount,
      messagesCount,
      usersCount,
      mediaCount,
      productMediaCount,
      productsCount,
      newsCount,
      productQuestionsCount,
      ordersCount,
      productCategoriesCount,
      recentMessages: recentMessages.map(msg => ({
        _id: msg._id,
        name: msg.name,
        email: msg.email,
        subject: msg.subject,
        createdAt: msg.createdAt,
        type: 'message',
        status: msg.status || 'unread'
      })),
      recentUsers: recentUsers.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        type: 'user'
      })),
      recentContent: [
        ...recentNews.map(item => ({ ...item.toObject(), type: 'news', title: item.title })),
        ...recentPortfolio.map(item => ({ ...item.toObject(), type: 'portfolio', title: item.title })),
        ...recentServices.map(item => ({ ...item.toObject(), type: 'service', title: item.title })),
        ...recentProducts.map(item => ({ ...item.toObject(), type: 'product', title: item.name || item.title }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
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