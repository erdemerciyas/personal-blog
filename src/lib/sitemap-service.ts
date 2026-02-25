
import { connectToDatabase } from '@/lib/mongoose';
import SiteSettings from '@/models/SiteSettings';
import News from '@/models/News';
import Product from '@/models/Product';
import Portfolio from '@/models/Portfolio';
import Service from '@/models/Service';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface SitemapURL {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

export class SitemapService {
    private static readonly SUPPORTED_LOCALES = ['tr'];

    private static readonly STATIC_PAGES = [
        { path: '', changefreq: 'daily' as const, priority: 1.0 },
        { path: '/contact', changefreq: 'monthly' as const, priority: 0.8 },
        { path: '/services', changefreq: 'weekly' as const, priority: 0.8 },
        { path: '/portfolio', changefreq: 'weekly' as const, priority: 0.8 },
        { path: '/products', changefreq: 'daily' as const, priority: 0.8 },
        { path: '/videos', changefreq: 'weekly' as const, priority: 0.7 },
        { path: '/haberler', changefreq: 'daily' as const, priority: 0.8 },
    ];

    static async generateSitemapXML(): Promise<string> {
        await connectToDatabase();

        // 1. Get Base URL
        const settings = await SiteSettings.getSiteSettings();
        const baseUrl = (settings.siteUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://www.fixral.com').replace(/\/$/, '');

        const urls: SitemapURL[] = [];

        // 2. Add Static Pages (with locale prefix)
        for (const locale of this.SUPPORTED_LOCALES) {
            this.STATIC_PAGES.forEach(page => {
                urls.push({
                    loc: `${baseUrl}/${locale}${page.path}`,
                    changefreq: page.changefreq,
                    priority: page.priority,
                    lastmod: new Date().toISOString()
                });
            });
        }

        // 3. Add News (Blog Posts)
        try {
            const posts = await News.find({ status: 'published' }).select('slug updatedAt').lean();
            posts.forEach((post: any) => {
                for (const locale of this.SUPPORTED_LOCALES) {
                    urls.push({
                        loc: `${baseUrl}/${locale}/haberler/${post.slug}`,
                        lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString(),
                        changefreq: 'weekly',
                        priority: 0.7
                    });
                }
            });
        } catch (e) {
            console.error('Error fetching news for sitemap:', e);
        }

        // 4. Add Products
        try {
            const products = await Product.find({ isActive: true }).select('slug updatedAt').lean();
            products.forEach((product: any) => {
                for (const locale of this.SUPPORTED_LOCALES) {
                    urls.push({
                        loc: `${baseUrl}/${locale}/products/${product.slug}`,
                        lastmod: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
                        changefreq: 'weekly',
                        priority: 0.8
                    });
                }
            });
        } catch (e) {
            console.error('Error fetching products for sitemap:', e);
        }

        // 5. Add Portfolio
        try {
            const projects = await Portfolio.find({ isActive: true }).select('slug updatedAt').lean();
            projects.forEach((project: any) => {
                for (const locale of this.SUPPORTED_LOCALES) {
                    urls.push({
                        loc: `${baseUrl}/${locale}/portfolio/${project.slug}`,
                        lastmod: project.updatedAt ? new Date(project.updatedAt).toISOString() : new Date().toISOString(),
                        changefreq: 'monthly',
                        priority: 0.6
                    });
                }
            });
        } catch (e) {
            console.error('Error fetching portfolio for sitemap:', e);
        }

        // 6. Add Services
        try {
            const services = await Service.find({ isActive: true }).select('slug updatedAt').lean();
            services.forEach((service: any) => {
                for (const locale of this.SUPPORTED_LOCALES) {
                    urls.push({
                        loc: `${baseUrl}/${locale}/services/${service.slug}`,
                        lastmod: service.updatedAt ? new Date(service.updatedAt).toISOString() : new Date().toISOString(),
                        changefreq: 'monthly',
                        priority: 0.7
                    });
                }
            });
        } catch (e) {
            console.error('Error fetching services for sitemap:', e);
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

        // Try writing to public/ first (works in local dev and VPS)
        // Fall back to /tmp/ for Vercel Serverless (read-only filesystem)
        let filePath: string;

        try {
            const publicDir = path.join(process.cwd(), 'public');
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }
            filePath = path.join(publicDir, 'sitemap.xml');
            fs.writeFileSync(filePath, xml);
        } catch (fsError) {
            // Serverless environment (Vercel) - write to /tmp
            console.warn('[SitemapService] Cannot write to public/, falling back to /tmp/');
            const tmpDir = os.tmpdir();
            filePath = path.join(tmpDir, 'sitemap.xml');
            fs.writeFileSync(filePath, xml);
        }

        return filePath;
    }
}
