import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { v2 as cloudinary } from 'cloudinary';

interface CloudinaryResource {
  public_id: string;
  display_name?: string;
  secure_url: string;
  bytes: number;
  format: string;
  resource_type: string;
  created_at: string;
}

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface MediaItem {
  _id?: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploader?: string;
  source?: 'cloudinary' | 'local';
  publicId?: string;
}

// GET - List all media files from both Cloudinary and local storage
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mediaItems: MediaItem[] = [];

    // 1. Cloudinary'den dosyaları çek
    try {
      console.log('🔍 Fetching from Cloudinary...');
      console.log('🔑 Cloudinary config:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING'
      });
      
      // Search API çalışmıyor, direkt Admin API kullan
      let cloudinaryResult = { total_count: 0, resources: [] };
      
      console.log('🔄 Using Admin API directly...');
      
      try {
        // Admin API ile tüm görselleri çek
        const adminResult = await cloudinary.api.resources({
          resource_type: 'image',
          max_results: 100,
          type: 'upload'
        });
        
        console.log('📋 Admin API raw response:', JSON.stringify(adminResult, null, 2));
        
        if (adminResult.resources && adminResult.resources.length > 0) {
          // Admin API response'unu search API formatına çevir
          cloudinaryResult = {
            total_count: adminResult.resources.length,
            resources: adminResult.resources.map(resource => ({
              ...resource,
              created_at: resource.created_at,
              secure_url: resource.secure_url,
              public_id: resource.public_id,
              bytes: resource.bytes,
              format: resource.format,
              resource_type: resource.resource_type
            }))
          };
          
          console.log('📋 Admin API files found:', cloudinaryResult.total_count);
        } else {
          console.log('📋 No files found in Admin API');
        }
      } catch (adminError) {
        console.log('❌ Admin API error:', adminError);
        cloudinaryResult = { total_count: 0, resources: [] };
      }

      console.log('📁 Cloudinary files found:', cloudinaryResult.resources?.length || 0);
      console.log('📊 Cloudinary response:', JSON.stringify(cloudinaryResult, null, 2));

      if (cloudinaryResult.resources) {
        for (const resource of cloudinaryResult.resources as CloudinaryResource[]) {
          const fileName = resource.display_name || resource.public_id.split('/').pop() || resource.public_id;
          
          mediaItems.push({
            _id: resource.public_id,
            filename: fileName,
            originalName: fileName,
            url: resource.secure_url,
            size: resource.bytes || 0,
            mimeType: resource.resource_type === 'image' ? `image/${resource.format}` : 'application/octet-stream',
            uploadedAt: new Date(resource.created_at),
            uploader: 'cloudinary',
            source: 'cloudinary',
            publicId: resource.public_id
          });
        }
      }
    } catch (cloudinaryError) {
      console.error('❌ Cloudinary fetch error:', cloudinaryError);
      // Cloudinary hatası olsa bile devam et
    }

    // Only Cloudinary files are supported now

    // Sort by upload date (newest first)
    mediaItems.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    console.log('📊 Total media items found:', mediaItems.length);
    console.log('📊 Cloudinary items:', mediaItems.filter(item => item.source === 'cloudinary').length);
    console.log('📊 Local items:', mediaItems.filter(item => item.source === 'local').length);

    return NextResponse.json(mediaItems);
  } catch (error) {
    console.error('❌ Media listing error:', error);
    return NextResponse.json({ error: 'Failed to list media files' }, { status: 500 });
  }
}

// DELETE - Delete selected media files
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mediaIds } = await request.json();
    
    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json({ error: 'No media IDs provided' }, { status: 400 });
    }

    const deletedFiles: string[] = [];
    const errors: string[] = [];

    for (const mediaId of mediaIds) {
      try {
        // Only Cloudinary file deletion is supported
        const result = await cloudinary.uploader.destroy(mediaId);
        if (result.result === 'ok' || result.result === 'not found') {
          deletedFiles.push(mediaId);
        } else {
          errors.push(`Failed to delete from Cloudinary: ${mediaId}`);
        }
      } catch (error) {
        console.error(`Error deleting file ${mediaId}:`, error);
        errors.push(`Failed to delete: ${mediaId}`);
      }
    }

    return NextResponse.json({
      success: true,
      deletedFiles,
      errors,
      message: `${deletedFiles.length} file(s) deleted successfully`
    });

  } catch (error) {
    console.error('Media deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete media files' }, { status: 500 });
  }
} 