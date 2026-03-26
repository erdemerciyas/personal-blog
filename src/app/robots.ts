import { MetadataRoute } from 'next';
import { config } from '../core/lib/config';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = config.app.url || 'https://www.fixral.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/tr/account/',
                '/es/account/',
                '/tr/checkout/',
                '/es/checkout/',
                '/tr/login/',
                '/es/login/',
                '/tr/register/',
                '/es/register/',
                '/tr/cart/',
                '/es/cart/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
