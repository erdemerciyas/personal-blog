import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Portfolio from '@/models/Portfolio';
import connectDB from '@/lib/mongoose';

/**
 * GET /api/admin/models - List all 3D models
 */
/**
 * GET /api/admin/models - List all 3D models embedded in portfolios
 */
export async function GET(_req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // Fetch portfolios that have 3D models
        const portfolios = await Portfolio.find({
            'models3D.0': { $exists: true }
        }).select('title models3D slug');

        // Flatten to a single list of models with portfolio context
        const allModels = portfolios.flatMap(portfolio =>
            portfolio.models3D.map((model: any) => ({
                _id: model._id || model.publicId, // Fallback ID
                name: model.name,
                file: model.url,
                fileSize: model.size,
                format: model.format,
                downloads: 0,
                createdAt: model.uploadedAt || new Date(),
                portfolioId: portfolio._id,
                portfolioTitle: portfolio.title,
                portfolioSlug: portfolio.slug
            }))
        ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(allModels);
    } catch (error) {
        console.error('Error fetching models:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch models' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/models - Create a new 3D model
 * Note: Since models are now part of portfolios, simple creation might need portfolio ID.
 * For now, we'll keep it as is but it won't work with new architecture without portfolio context.
 * Ideally, models should be uploaded via Portfolio Edit page.
 */
export async function POST(_req: NextRequest) {
    return NextResponse.json(
        { success: false, error: 'Please upload models via Portfolio Edit page.' },
        { status: 400 }
    );
}
