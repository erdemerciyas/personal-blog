import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Portfolio from '@/models/Portfolio';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();
    
    const baseUrl = process.env.NEXTAUTH_URL || 'https://erdemerciyas.com.tr';
    
    // Get all portfolio and product items for dynamic URLs
    const portfolioItems = await Portfolio.find({ isActive: true }).select('slug updatedAt');
    const productItems = await Product.find({ isActive: true }).select('slug updatedAt');
    
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 1.0
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.8
      },
      {
        url: `${baseUrl}/services`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.8
      },
      {
        url: `${baseUrl}/portfolio`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.9
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.7
      }
    ];
    
    const portfolioPages = portfolioItems.map(item => ({
      url: `${baseUrl}/portfolio/${item.slug}`,
      lastModified: item.updatedAt.toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6
    }));
    
    const productPages = productItems.map(item => ({
      url: `${baseUrl}/products/${item.slug}`,
      lastModified: item.updatedAt.toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7
    }));

    const allPages = [...staticPages, ...portfolioPages, ...productPages];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400'
      }
    });
    
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}