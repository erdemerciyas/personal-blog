import { MetadataRoute } from 'next';
import connectDB from '../lib/mongoose';
import News from '../models/News';
import Portfolio from '../models/Portfolio';
import Product from '../models/Product';
import { config } from '../core/lib/config';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = (config.app.url || 'https://www.fixral.com').replace(/\/$/, '');
    const locale = 'tr';

    const sitemapUrls: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/${locale}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/${locale}/services`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/${locale}/portfolio`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/${locale}/haberler`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/${locale}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/${locale}/videos`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
    ];

    try {
        await connectDB();

        // Fetch dynamic News URLs
        const newsItems = await News.find({ status: 'published' }).select('slug updatedAt createdAt').lean();
        newsItems.forEach((post: any) => {
            const lastModified = post.updatedAt || post.createdAt || new Date();
            sitemapUrls.push({
                url: `${baseUrl}/${locale}/haberler/${post.slug}`,
                lastModified,
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        });

        // Fetch dynamic Portfolio URLs
        const portfolios = await Portfolio.find({ isActive: true }).select('slug updatedAt createdAt').lean();
        portfolios.forEach((portfolio: any) => {
            sitemapUrls.push({
                url: `${baseUrl}/${locale}/portfolio/${portfolio.slug}`,
                lastModified: portfolio.updatedAt || portfolio.createdAt || new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            });
        });

        // Fetch dynamic Product URLs
        const products = await Product.find({ isActive: true }).select('slug updatedAt createdAt').lean();
        products.forEach((product: any) => {
            sitemapUrls.push({
                url: `${baseUrl}/${locale}/products/${product.slug}`,
                lastModified: product.updatedAt || product.createdAt || new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        });

    } catch (error) {
        console.error('Error generating dynamic sitemap routes:', error);
    }

    return sitemapUrls;
}
