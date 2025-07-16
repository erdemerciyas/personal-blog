import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import LoadingSystemConfig from '../../../../models/LoadingSystemConfig';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        let config = await LoadingSystemConfig.findOne();

        if (!config) {
            // Create default config
            config = new LoadingSystemConfig({
                globalEnabled: true,
                systemInstalled: true,
                pages: {
                    home: {
                        enabled: true,
                        loadingText: 'Ana Sayfa yükleniyor...',
                        installed: true
                    },
                    about: {
                        enabled: true,
                        loadingText: 'Hakkımda sayfası yükleniyor...',
                        installed: true
                    },
                    services: {
                        enabled: true,
                        loadingText: 'Hizmetler yükleniyor...',
                        installed: true
                    },
                    portfolio: {
                        enabled: true,
                        loadingText: 'Portfolio yükleniyor...',
                        installed: true
                    },
                    'portfolio-detail': {
                        enabled: true,
                        loadingText: 'Proje detayları yükleniyor...',
                        installed: true
                    },
                    contact: {
                        enabled: true,
                        loadingText: 'İletişim sayfası yükleniyor...',
                        installed: true
                    }
                }
            });
            await config.save();
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error('Loading system config fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        await connectDB();

        let config = await LoadingSystemConfig.findOne();

        if (config) {
            // Update existing config
            config.globalEnabled = data.globalEnabled;
            config.systemInstalled = data.systemInstalled;
            config.pages = data.pages;
            config.updatedAt = new Date();
        } else {
            // Create new config
            config = new LoadingSystemConfig(data);
        }

        await config.save();

        return NextResponse.json({
            success: true,
            message: 'Loading system configuration updated successfully',
            config
        });
    } catch (error) {
        console.error('Loading system config save error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}