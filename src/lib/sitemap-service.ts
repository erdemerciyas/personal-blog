
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongoose';
import SiteSettings from '@/models/SiteSettings';
import News from '@/models/News';
import Product from '@/models/Product';
import Portfolio from '@/models/Portfolio';
import Service from '@/models/Service';
import Category from '@/models/Category';
import fs from 'fs';
import path from 'path';

export interface SitemapURL {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

export class SitemapService {
    private static readonly STATIC_PAGES = [
        '',           // Home
        '/about',     // About
        '/contact',   // Contact
        '/services',  // Services
        '/portfolio', // Portfolio
        '/blog',      // Blog
        '/products',  // Shop
    ];

    static async generateSitemapXML(): Promise<string> {
        await connectToDatabase();

        // 1. Get Base URL
        const settings = await SiteSettings.getSiteSettings();
        const baseUrl = (settings.siteUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://example.com').replace(/\/$/, '');

        const urls: SitemapURL[] = [];

        // 2. Add Static Pages
        this.STATIC_PAGES.forEach(page => {
            urls.push({
                loc: `${baseUrl}${page}`,
                changefreq: 'daily',
                priority: page === '' ? 1.0 : 0.8,
                lastmod: new Date().toISOString()
            });
        });

        // 3. Add News (Blog Posts)
        try {
            const posts = await News.find({ status: 'published' }).select('slug updatedAt').lean();
            posts.forEach((post: any) => {
                urls.push({
                    loc: `${baseUrl}/blog/${post.slug}`,
                    lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString(),
                    changefreq: 'weekly',
                    priority: 0.7
                });
            });
        } catch (e) {
            console.error('Error fetching news for sitemap:', e);
        }

        // 4. Add Products
        try {
            const products = await Product.find({ isActive: true }).select('slug updatedAt').lean();
            products.forEach((product: any) => {
                urls.push({
                    loc: `${baseUrl}/products/${product.slug}`,
                    lastmod: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
                    changefreq: 'weekly',
                    priority: 0.8
                });
            });
        } catch (e) {
            console.error('Error fetching products for sitemap:', e);
        }

        // 5. Add Portfolio
        try {
            const projects = await Portfolio.find({ isActive: true }).select('slug updatedAt').lean();
            projects.forEach((project: any) => {
                urls.push({
                    loc: `${baseUrl}/portfolio/${project.slug}`,
                    lastmod: project.updatedAt ? new Date(project.updatedAt).toISOString() : new Date().toISOString(),
                    changefreq: 'monthly',
                    priority: 0.6
                });
            });
        } catch (e) {
            console.error('Error fetching portfolio for sitemap:', e);
        }



        // Generate XML
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod.split('T')[0]}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

        return xml;
    }

    static async saveSitemapToFile(): Promise<string> {
        const xml = await this.generateSitemapXML();
        const publicDir = path.join(process.cwd(), 'public');

        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        const filePath = path.join(publicDir, 'sitemap.xml');
        fs.writeFileSync(filePath, xml);

        return filePath;
    }
}
