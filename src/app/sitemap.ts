import { MetadataRoute } from 'next';
import connectDB from '../lib/mongoose';
import News from '../models/News';
import Portfolio from '../models/Portfolio';
import Product from '../models/Product';
import { SITE_URL } from '../lib/seo-utils';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_URL;

    // Her statik sayfa için TR ve ES URL'leri
    const staticPages: MetadataRoute.Sitemap = [
        // Anasayfa
        { url: `${baseUrl}/tr`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/es`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },

        // İletişim
        { url: `${baseUrl}/tr/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/es/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },

        // Hizmetler
        { url: `${baseUrl}/tr/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/es/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },

        // Portfolyo
        { url: `${baseUrl}/tr/portfolio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/es/portfolio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },

        // Haberler / Noticias
        { url: `${baseUrl}/tr/haberler`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/es/noticias`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },

        // Ürünler
        { url: `${baseUrl}/tr/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/es/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },

        // Videolar
        { url: `${baseUrl}/tr/videos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/es/videos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    ];

    const dynamicUrls: MetadataRoute.Sitemap = [];

    try {
        await connectDB();

        // Haber / Makale URL'leri (TR: haberler, ES: noticias)
        const newsItems = await News.find({ status: 'published' }).select('slug updatedAt createdAt').lean();
        newsItems.forEach((post: any) => {
            const lastModified = post.updatedAt || post.createdAt || new Date();
            dynamicUrls.push(
                { url: `${baseUrl}/tr/haberler/${post.slug}`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
                { url: `${baseUrl}/es/noticias/${post.slug}`, lastModified, changeFrequency: 'weekly', priority: 0.6 }
            );
        });

        // Portfolyo URL'leri
        const portfolios = await Portfolio.find({ isActive: true }).select('slug updatedAt createdAt').lean();
        portfolios.forEach((portfolio: any) => {
            const lastModified = portfolio.updatedAt || portfolio.createdAt || new Date();
            dynamicUrls.push(
                { url: `${baseUrl}/tr/portfolio/${portfolio.slug}`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
                { url: `${baseUrl}/es/portfolio/${portfolio.slug}`, lastModified, changeFrequency: 'monthly', priority: 0.5 }
            );
        });

        // Ürün URL'leri
        const products = await Product.find({ isActive: true }).select('slug updatedAt createdAt').lean();
        products.forEach((product: any) => {
            const lastModified = product.updatedAt || product.createdAt || new Date();
            dynamicUrls.push(
                { url: `${baseUrl}/tr/products/${product.slug}`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
                { url: `${baseUrl}/es/products/${product.slug}`, lastModified, changeFrequency: 'weekly', priority: 0.7 }
            );
        });

    } catch (error) {
        console.error('Sitemap dinamik URL\'leri oluşturulurken hata:', error);
    }

    return [...staticPages, ...dynamicUrls];
}
