export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { withSecurity, SecurityConfigs } from '../../../../../lib/security-middleware';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// DELETE - Delete a single media file
export const DELETE = withSecurity(SecurityConfigs.admin)(async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  const { params } = context;
  try {
    // Decode the ID in case it's URL encoded
    const id = decodeURIComponent(params.id);

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // Delete from Cloudinary using public_id
    const result = await cloudinary.uploader.destroy(id);
    
    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({
        success: true,
        message: 'Media file deleted successfully',
        publicId: id
      });
    } else {
      return NextResponse.json({
        error: 'Failed to delete media file from Cloudinary',
        details: result,
        publicId: id
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to delete media file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});
