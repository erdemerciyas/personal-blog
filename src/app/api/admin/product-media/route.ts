import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Determine folder based on query param, default to product images
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'image';

        // We explicitly look into the folders defined in product-upload route
        const folderPrefix = type === 'document'
            ? 'personal-blog/products/docs'
            : 'personal-blog/products/images';

        // Cloudinary Admin API to list resources by folder
        // Note: Cloudinary API returns a flat list, we filter by prefix (folder)
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: folderPrefix,
            max_results: 500, // Reasonable limit
            direction: 'desc',
            sort_by: 'created_at'
        });

        // Map to standardized format
        const items = result.resources.map((res: any) => ({
            _id: res.public_id, // Use public_id as _id for consistency with media deletion API
            assetId: res.asset_id,
            public_id: res.public_id,
            name: res.public_id.split('/').pop(), // Extract filename from path
            url: res.secure_url,
            type: res.format,
            width: res.width,
            height: res.height,
            size: res.bytes,
            createdAt: res.created_at,
            source: 'cloudinary'
        }));

        return NextResponse.json(items);
    } catch (error: any) {
        console.error('Error fetching product media:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch media' }, { status: 500 });
    }
}
