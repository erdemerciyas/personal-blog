
import { NextResponse } from 'next/server';
import { SitemapService } from '@/lib/sitemap-service';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const publicDir = path.join(process.cwd(), 'public');
        const filePath = path.join(publicDir, 'sitemap.xml');

        if (!fs.existsSync(filePath)) {
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
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
