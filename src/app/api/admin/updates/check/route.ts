import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { logger } from '@/core/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Read local version
        const versionPath = path.join(process.cwd(), 'src', 'core', 'version.json');
        let localVersion = { version: '1.0.0' };

        if (fs.existsSync(versionPath)) {
            const fileContent = fs.readFileSync(versionPath, 'utf-8');
            localVersion = JSON.parse(fileContent);
        }

        // GitHub Repository Info
        const OWNER = 'erdemerciyas';
        const REPO = 'personal-blog';
        const GITHUB_API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;

        // Check Remote
        const res = await fetch(GITHUB_API_URL, {
            headers: {
                'User-Agent': 'fixral-blog-system',
                'Accept': 'application/vnd.github.v3+json'
            },
            next: { revalidate: 60 } // Cache for 1 minute
        });

        if (!res.ok) {
            if (res.status === 404) {
                // No releases found
                return NextResponse.json({
                    current: localVersion,
                    remote: null,
                    hasUpdate: false,
                    message: 'No releases found on GitHub'
                });
            }
            throw new Error(`GitHub API Error: ${res.statusText}`);
        }

        const remoteData = await res.json();

        const remoteVersion = {
            version: remoteData.tag_name.replace('v', ''), // Normalize v1.0.0 -> 1.0.0
            build: remoteData.published_at,
            features: remoteData.body ? remoteData.body.split('\n').filter((line: string) => line.trim().startsWith('-')).map((l: string) => l.replace('-', '').trim()) : [],
            downloadUrl: remoteData.zipball_url,
            name: remoteData.name
        };

        const hasUpdate = isNewer(remoteVersion.version, localVersion.version);

        return NextResponse.json({
            current: localVersion,
            remote: remoteVersion,
            hasUpdate
        });

    } catch (error) {
        logger.error('Update check failed', 'SYSTEM', { error });
        // Return mostly empty success to avoid breaking UI, but with error log
        return NextResponse.json({
            current: { version: 'Unknown' },
            hasUpdate: false,
            error: 'Failed to check GitHub'
        });
    }
}

function isNewer(remote: string, local: string) {
    if (!remote || !local) return false;
    const r = remote.split('.').map(num => parseInt(num, 10));
    const l = local.split('.').map(num => parseInt(num, 10));

    for (let i = 0; i < Math.max(r.length, l.length); i++) {
        const rv = r[i] || 0;
        const lv = l[i] || 0;
        if (rv > lv) return true;
        if (rv < lv) return false;
    }
    return false;
}
