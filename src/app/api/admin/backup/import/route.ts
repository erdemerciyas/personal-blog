import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
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

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        if (!body.content || !body.version) {
            return NextResponse.json({ error: 'Invalid backup file format' }, { status: 400 });
        }

        await connectDB();

        const {
            news, products, siteSettings, portfolios, services,
            sliders, about, contact, footer, contentSettings,
            categories, productCategories, reviews, videos,
            users, settings, messages, pageSettings
        } = body.content;

        const stats = {
            news: 0, products: 0, portfolios: 0, services: 0,
            sliders: 0, categories: 0, productCategories: 0,
            users: 0, messages: 0, videos: 0, reviews: 0,
            pageSettings: 0,
            siteSettings: 0, footer: 0, contentSettings: 0,
            about: 0, contact: 0, settings: 0,
            errors: 0
        };

        // Helper to import collections (List of items)
        const importCollection = async (Model: any, items: any[], keyField: string, statKey: keyof typeof stats) => {
            if (!Array.isArray(items) || items.length === 0) return;

            for (const item of items) {
                try {
                    const { _id, ...rest } = item;
                    const filter: any = {};

                    if (keyField === '_id') {
                        filter._id = _id;
                    } else if (item[keyField]) {
                        filter[keyField] = item[keyField];
                    } else {
                        // If missing key, skip or try _id as fallback? 
                        if (_id) filter._id = _id;
                        else throw new Error(`Missing key ${keyField}`);
                    }

                    const updateOps: any = { $set: rest };
                    // Preserve original ID if inserting
                    if (_id) {
                        updateOps['$setOnInsert'] = { _id: _id };
                    }

                    await Model.updateOne(filter, updateOps, { upsert: true });
                    stats[statKey]++;

                } catch (e) {
                    stats.errors++;
                    logger.warn(`Failed to import ${statKey} item`, 'BACKUP', { error: e });
                }
            }
        };

        // Helper to import Singletons (Settings pages, About, etc.)
        const importSingleton = async (Model: any, items: any[], statKey: keyof typeof stats) => {
            if (!Array.isArray(items) || items.length === 0) return;
            try {
                // Usually take the first/only item
                const item = items[0];
                const { ...rest } = item;

                // We update the existing singleton or create one.
                // Using valid singleton query if possible, or empty filter to catch 'any' doc
                const filter = {};
                const updateOps: any = { $set: rest };

                await Model.updateOne(filter, updateOps, { upsert: true });
                stats[statKey]++;
            } catch (e) {
                stats.errors++;
                logger.warn(`Failed to import ${statKey}`, 'BACKUP', { error: e });
            }
        };

        // --- Execute Imports ---

        // 1. Lists with Slugs/Unique Keys
        await importCollection(News, news, 'slug', 'news');
        await importCollection(Product, products, 'slug', 'products');
        await importCollection(Portfolio, portfolios, 'slug', 'portfolios');
        await importCollection(Category, categories, 'slug', 'categories');
        await importCollection(ProductCategory, productCategories, 'slug', 'productCategories');
        await importCollection(PageSetting, pageSettings, 'pageId', 'pageSettings'); // pageId verified
        await importCollection(User, users, 'email', 'users');

        // 2. Lists with only IDs (no reliable slug)
        await importCollection(Service, services, '_id', 'services'); // No slug in schema
        await importCollection(Slider, sliders, '_id', 'sliders');
        await importCollection(Video, videos, '_id', 'videos');
        await importCollection(Message, messages, '_id', 'messages');
        await importCollection(ProductReview, reviews, '_id', 'reviews');

        // 3. Singletons
        await importSingleton(SiteSettings, siteSettings, 'siteSettings');
        await importSingleton(FooterSettings, footer, 'footer');
        await importSingleton(ContentSettings, contentSettings, 'contentSettings');
        await importSingleton(Settings, settings, 'settings');
        await importSingleton(About, about, 'about');
        await importSingleton(Contact, contact, 'contact');

        logger.info('Full Import completed', 'BACKUP', { stats });

        return NextResponse.json({
            success: true,
            message: `Import completed. Total Errors: ${stats.errors}`,
            stats
        });

    } catch (error) {
        logger.error('Import failed', 'BACKUP', { error });
        return NextResponse.json({ error: 'Import failed' }, { status: 500 });
    }
}
