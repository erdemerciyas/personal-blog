import { MetadataRoute } from 'next';
import connectDB from '../lib/mongoose';
import News from '../models/News';
import Portfolio from '../models/Portfolio';
import { config } from '../core/lib/config';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = config.app.url || 'https://www.fixral.com';

    const sitemapUrls: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/services`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/portfolio`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/tr/haberler`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/es/noticias`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ];

    try {
        await connectDB();

        // Fetch dynamic News URLs
        const newsItems = await News.find({ status: 'published' }).select('slug updatedAt createdAt').lean();
        newsItems.forEach((post: any) => {
            const lastModified = post.updatedAt || post.createdAt || new Date();
            // Turkish News
            sitemapUrls.push({
                url: `${baseUrl}/tr/haberler/${post.slug}`,
                lastModified,
                changeFrequency: 'weekly',
                priority: 0.7,
            });
            // Spanish News
            sitemapUrls.push({
                url: `${baseUrl}/es/noticias/${post.slug}`,
                lastModified,
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        });

        // Fetch dynamic Portfolio URLs
        const portfolios = await Portfolio.find({ isActive: true }).select('slug updatedAt createdAt').lean();
        portfolios.forEach((portfolio: any) => {
            sitemapUrls.push({
                url: `${baseUrl}/portfolio/${portfolio.slug}`,
                lastModified: portfolio.updatedAt || portfolio.createdAt || new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            });
        });

    } catch (error) {
        console.error('Error generating dynamic sitemap routes:', error);
    }

    return sitemapUrls;
}
