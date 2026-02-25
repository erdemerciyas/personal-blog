
import { NextResponse } from 'next/server';
import { SitemapService } from '@/lib/sitemap-service';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Resolve the sitemap file path.
 * In Vercel Serverless, public/ is read-only so we check /tmp/ as fallback.
 */
function getSitemapPath(): string | null {
    // Check public/ first (local dev & VPS)
    const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    if (fs.existsSync(publicPath)) return publicPath;

    // Check /tmp/ (Vercel Serverless fallback)
    const tmpPath = path.join(os.tmpdir(), 'sitemap.xml');
    if (fs.existsSync(tmpPath)) return tmpPath;

    return null;
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const filePath = getSitemapPath();

        if (!filePath) {
            return NextResponse.json({
                exists: false,
                lastModified: null,
                size: 0,
                urlCount: 0
            });
        }

        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf-8');
        const urlCount = (content.match(/<loc>/g) || []).length;

        return NextResponse.json({
            exists: true,
            lastModified: stats.mtime,
            size: stats.size,
            urlCount
        });

    } catch (error) {
        console.error('Error fetching sitemap status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const filePath = await SitemapService.saveSitemapToFile();
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf-8');
        const urlCount = (content.match(/<loc>/g) || []).length;

        return NextResponse.json({
            success: true,
            message: 'Sitemap generated successfully',
            lastModified: stats.mtime,
            size: stats.size,
            urlCount
        });

    } catch (error) {
        console.error('Error generating sitemap:', error);
        return NextResponse.json({
            error: 'Sitemap oluşturulurken hata oluştu',
            details: error instanceof Error ? error.message : 'Bilinmeyen hata'
        }, { status: 500 });
    }
}
