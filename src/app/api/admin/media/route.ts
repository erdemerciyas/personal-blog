export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';

interface CloudinaryResource {
  public_id: string;
  display_name?: string;
  secure_url: string;
  bytes: number;
  format: string;
  resource_type: string;
  created_at: string;
}

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

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET - List all media files from both Cloudinary and local storage
export const GET = withSecurity(SecurityConfigs.admin)(async (request: NextRequest) => {
  try {
    // Get pageContext filter from query params
    // Supported values:
    // - 'site' (default): show only non-product site media
    // - 'products': show only product media
    // - specific contexts (e.g., 'portfolio', 'services'): show only that folder
    const { searchParams } = new URL(request.url);
    const pageContextFilter = (searchParams.get('pageContext') || 'site').toLowerCase();

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
        // Admin API ile görselleri çek
        const resourceOptions: { resource_type: string; max_results: number; type: string; prefix?: string } = {
          resource_type: 'image',
          max_results: 100,
          type: 'upload'
        };

        // PageContext filtresi varsa prefix ekle
        // 'products' -> sadece ürünler klasörü
        // 'site' -> tüm site klasörleri (personal-blog/) fakat ürünler hariç (sonradan filtrelenecek)
        // belirli klasör -> sadece o klasör
        if (pageContextFilter === 'products') {
          resourceOptions.prefix = 'personal-blog/products/';
        } else if (pageContextFilter !== 'all' && pageContextFilter !== 'site') {
          resourceOptions.prefix = `personal-blog/${pageContextFilter}/`;
        } else {
          resourceOptions.prefix = 'personal-blog/';
        }

        const adminResult = await cloudinary.api.resources(resourceOptions);
        
        console.log('📋 Admin API raw response:', JSON.stringify(adminResult, null, 2));
        
        if (adminResult.resources && adminResult.resources.length > 0) {
          // Admin API response'unu search API formatına çevir
          cloudinaryResult = {
            total_count: adminResult.resources.length,
            resources: adminResult.resources.map((resource: CloudinaryResource) => ({
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
        // Ürün medyasını sadece 'site' kapsamındayken hariç tut
        const shouldExcludeProducts = pageContextFilter === 'site';
        for (const resource of cloudinaryResult.resources as CloudinaryResource[]) {
          const isProduct = resource.public_id?.startsWith('personal-blog/products/');
          if (shouldExcludeProducts && isProduct) {
            continue;
          }
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
});

// DELETE - Delete selected media files
export const DELETE = withSecurity(SecurityConfigs.admin)(async (request: NextRequest) => {
  try {
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
});