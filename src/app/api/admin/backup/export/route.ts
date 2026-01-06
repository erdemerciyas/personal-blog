import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { logger } from '@/core/lib/logger';

// Import All Models
import News from '@/models/News';
import Product from '@/models/Product';
import SiteSettings from '@/models/SiteSettings';
import Portfolio from '@/models/Portfolio';
import Service from '@/models/Service';
import Slider from '@/models/Slider';
import About from '@/models/About';
import Contact from '@/models/Contact';
import FooterSettings from '@/models/FooterSettings';
import ContentSettings from '@/models/ContentSettings';
import Category from '@/models/Category';
import ProductCategory from '@/models/ProductCategory';
import ProductReview from '@/models/ProductReview';
import Video from '@/models/Video';
import User from '@/models/User';
import Settings from '@/models/Settings';
import Message from '@/models/Message';
import PageSetting from '@/models/PageSetting';

export const dynamic = 'force-dynamic';

// Helper to download image (using global fetch)
async function downloadImage(url: string): Promise<Buffer | null> {
    try {
        if (!url || !url.startsWith('http')) return null;
        const res = await fetch(url);
        if (!res.ok) return null;
        return Buffer.from(await res.arrayBuffer());
    } catch (e) {
        return null;
    }
}

// Convert stream to iterator for Next.js response
function iteratorToStream(iterator: any) {
    return new ReadableStream({
        async pull(controller) {
            const { value, done } = await iterator.next();
            if (done) {
                controller.close();
            } else {
                controller.enqueue(value);
            }
        },
    });
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const includeMedia = searchParams.get('includeMedia') === 'true';

        await connectDB();

        // Fetch ALL data
        const [
            news, products, siteSettings, portfolios, services,
            sliders, about, contact, footer, contentSettings,
            categories, productCategories, reviews, videos,
            users, settings, messages, pageSettings
        ] = await Promise.all([
            News.find({}).lean(),
            Product.find({}).lean(),
            SiteSettings.find({}).lean(),
            Portfolio.find({}).lean(),
            Service.find({}).lean(),
            Slider.find({}).lean(),
            About.find({}).lean(),
            Contact.find({}).lean(),
            FooterSettings.find({}).lean(),
            ContentSettings.find({}).lean(),
            Category.find({}).lean(),
            ProductCategory.find({}).lean(),
            ProductReview.find({}).lean(),
            Video.find({}).lean(),
            User.find({}).select('-password').lean(),
            Settings.find({}).lean(),
            Message.find({}).lean(),
            PageSetting.find({}).lean()
        ]);

        const backupData = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            source: process.env.NEXTAUTH_URL,
            content: {
                news, products, siteSettings, portfolios, services,
                sliders, about, contact, footer, contentSettings,
                categories, productCategories, reviews, videos,
                users, settings, messages, pageSettings
            }
        };

        if (includeMedia) {
            const archive = archiver('zip', { zlib: { level: 9 } });
            const stream = new PassThrough();

            archive.pipe(stream);
            archive.append(JSON.stringify(backupData, null, 2), { name: 'full_backup_data.json' });

            const mediaFiles: { url: string; name: string }[] = [];
            const seenUrls = new Set<string>();

            const addMedia = (url: string | undefined, prefix: string, slugOrId: string) => {
                if (url && !seenUrls.has(url)) {
                    // Clean URL params if any
                    const cleanUrl = url.split('?')[0];
                    const ext = cleanUrl.split('.').pop() || 'jpg';
                    const safeSlug = slugOrId.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    mediaFiles.push({ url, name: `media/${prefix}/${safeSlug}.${ext}` });
                    seenUrls.add(url);
                }
            };

            // 1. Site Settings (Logo)
            siteSettings.forEach((s: any) => {
                if (s.logo?.url) addMedia(s.logo.url, 'site', 'logo');
            });

            // 2. News
            news.forEach((item: any) => {
                if (item.featuredImage?.url) addMedia(item.featuredImage.url, 'news', `${item.slug}-featured`);
            });

            // 3. Products
            products.forEach((item: any) => {
                if (item.coverImage) addMedia(item.coverImage, 'products', `${item.slug}-cover`);
                if (Array.isArray(item.images)) {
                    item.images.forEach((url: string, idx: number) => addMedia(url, 'products', `${item.slug}-img-${idx}`));
                }
                if (Array.isArray(item.attachments)) {
                    item.attachments.forEach((att: any, idx: number) => addMedia(att.url, 'products/attachments', `${item.slug}-att-${idx}`));
                }
            });

            // 4. Portfolios
            portfolios.forEach((item: any) => {
                if (item.coverImage) addMedia(item.coverImage, 'portfolio', `${item.slug}-cover`);
                if (Array.isArray(item.images)) {
                    item.images.forEach((url: string, idx: number) => addMedia(url, 'portfolio', `${item.slug}-img-${idx}`));
                }
            });

            // 5. Services
            services.forEach((item: any) => {
                if (item.icon) addMedia(item.icon, 'services', `${item.slug}-icon`);
                if (item.image) addMedia(item.image, 'services', `${item.slug}-image`);
            });

            // 6. Sliders
            sliders.forEach((slider: any) => {
                if (Array.isArray(slider.items)) {
                    slider.items.forEach((item: any, idx: number) => {
                        if (item.image) addMedia(item.image, 'sliders', `${slider._id}-slide-${idx}`);
                        if (item.mobileImage) addMedia(item.mobileImage, 'sliders', `${slider._id}-slide-mob-${idx}`);
                    });
                }
            });

            // 7. About
            about.forEach((item: any) => {
                if (item.image) addMedia(item.image, 'about', 'main-image');
                if (Array.isArray(item.gallery)) {
                    item.gallery.forEach((url: string, idx: number) => addMedia(url, 'about', `gallery-${idx}`));
                }
            });

            (async () => {
                for (const file of mediaFiles) {
                    const buffer = await downloadImage(file.url);
                    if (buffer) {
                        try {
                            archive.append(buffer, { name: file.name });
                        } catch (err) {
                            logger.warn('Failed to append file to zip', 'BACKUP', { file: file.name });
                        }
                    }
                }
                await archive.finalize();
            })().catch(err => {
                logger.error('Archive generation failed', 'BACKUP', { error: err });
                archive.abort();
            });

            return new NextResponse(iteratorToStream(stream[Symbol.asyncIterator]()), {
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename="fixral-full-backup-${new Date().toISOString().split('T')[0]}.zip"`,
                },
            });

        } else {
            // JSON Only
            return new NextResponse(JSON.stringify(backupData, null, 2), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="fixral-full-backup-data-${new Date().toISOString().split('T')[0]}.json"`
                }
            });
        }

    } catch (error) {
        logger.error('Export failed', 'BACKUP', { error });
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
