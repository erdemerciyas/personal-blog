export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
// import { withSecurity } from '../../../../../lib/security-middleware';
import { logger } from '../../../../../lib/logger';

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// DELETE - Delete single media file
async function deleteHandler(
    request: NextRequest,
    context: { params: { id: string } }
) {
    const { params } = context;

    try {
        const mediaId = params.id;

        if (!mediaId) {
            return NextResponse.json({ error: 'Media ID gerekli' }, { status: 400 });
        }

        // Decode URL-encoded ID
        const decodedMediaId = decodeURIComponent(mediaId);

        logger.info('Deleting media file', 'MEDIA', { mediaId: decodedMediaId });

        try {
            // Cloudinary'den sil
            const result = await cloudinary.uploader.destroy(decodedMediaId);

            if (result.result === 'ok') {
                logger.info('Media file deleted successfully', 'MEDIA', {
                    mediaId: decodedMediaId,
                    result: result.result
                });

                return NextResponse.json({
                    success: true,
                    message: 'Dosya başarıyla silindi',
                    mediaId: decodedMediaId
                });
            } else if (result.result === 'not found') {
                logger.warn('Media file not found for deletion', 'MEDIA', {
                    mediaId: decodedMediaId
                });

                return NextResponse.json({
                    success: true,
                    message: 'Dosya zaten mevcut değil',
                    mediaId: decodedMediaId
                });
            } else {
                logger.error('Failed to delete media file', 'MEDIA', {
                    mediaId: decodedMediaId,
                    result: result.result
                });

                return NextResponse.json(
                    { error: 'Dosya silinemedi', details: result.result },
                    { status: 500 }
                );
            }
        } catch (cloudinaryError) {
            logger.error('Cloudinary deletion error', 'ERROR', {
                mediaId: decodedMediaId,
                error: cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error'
            });

            return NextResponse.json(
                { error: 'Cloudinary silme hatası', details: cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error' },
                { status: 500 }
            );
        }
    } catch (error) {
        logger.error('Media deletion error', 'ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error',
            mediaId: params?.id
        });

        return NextResponse.json(
            { error: 'Dosya silinirken hata oluştu' },
            { status: 500 }
        );
    }
}

// GET - Get single media file info
async function getHandler(
    request: NextRequest,
    context: { params: { id: string } }
) {
    const { params } = context;

    try {
        const mediaId = params.id;

        if (!mediaId) {
            return NextResponse.json({ error: 'Media ID gerekli' }, { status: 400 });
        }

        const decodedMediaId = decodeURIComponent(mediaId);

        try {
            // Cloudinary'den dosya bilgilerini al
            const result = await cloudinary.api.resource(decodedMediaId);

            return NextResponse.json({
                _id: result.public_id,
                filename: result.display_name || result.public_id.split('/').pop() || result.public_id,
                originalName: result.display_name || result.public_id.split('/').pop() || result.public_id,
                url: result.secure_url,
                size: result.bytes || 0,
                mimeType: result.resource_type === 'image' ? `image/${result.format}` : 'application/octet-stream',
                uploadedAt: new Date(result.created_at),
                uploader: 'cloudinary',
                source: 'cloudinary',
                publicId: result.public_id
            });
        } catch (cloudinaryError) {
            logger.error('Cloudinary resource fetch error', 'ERROR', {
                mediaId: decodedMediaId,
                error: cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error'
            });

            return NextResponse.json(
                { error: 'Dosya bulunamadı' },
                { status: 404 }
            );
        }
    } catch (error) {
        logger.error('Media fetch error', 'ERROR', {
            error: error instanceof Error ? error.message : 'Unknown error',
            mediaId: params?.id
        });

        return NextResponse.json(
            { error: 'Dosya bilgileri alınırken hata oluştu' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
    return deleteHandler(request, context);
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
    return getHandler(request, context);
}