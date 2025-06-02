import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

interface MediaItem {
  _id?: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploader?: string;
}

// GET - List all media files
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Read files from uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const mediaItems: MediaItem[] = [];

    if (fs.existsSync(uploadsDir)) {
      // Function to recursively scan directories
      const scanDirectory = (dirPath: string, relativePath: string = '') => {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
          if (item.startsWith('.')) continue; // Skip hidden files
          
          const itemPath = path.join(dirPath, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isFile()) {
            const ext = path.extname(item).toLowerCase();
            let mimeType = 'application/octet-stream';
            
            // Determine MIME type based on extension
            if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
            else if (ext === '.png') mimeType = 'image/png';
            else if (ext === '.gif') mimeType = 'image/gif';
            else if (ext === '.webp') mimeType = 'image/webp';
            else if (ext === '.svg') mimeType = 'image/svg+xml';
            else if (['.mp4', '.webm', '.ogg'].includes(ext)) mimeType = 'video/' + ext.slice(1);
            else if (ext === '.pdf') mimeType = 'application/pdf';
            
            // Create ID and URL based on location
            const fileId = relativePath ? `${relativePath}/${item}` : item;
            const fileUrl = relativePath ? `/uploads/${relativePath}/${item}` : `/uploads/${item}`;
            
            mediaItems.push({
              _id: fileId,
              filename: item,
              originalName: item,
              url: fileUrl,
              size: stats.size,
              mimeType,
              uploadedAt: stats.birthtime,
              uploader: 'system'
            });
          } else if (stats.isDirectory()) {
            // Recursively scan subdirectories
            scanDirectory(itemPath, relativePath ? `${relativePath}/${item}` : item);
          }
        }
      };

      // Start scanning from uploads root
      scanDirectory(uploadsDir);
    }

    // Sort by upload date (newest first)
    mediaItems.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json(mediaItems);
  } catch (error) {
    console.error('Media listing error:', error);
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
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    for (const mediaId of mediaIds) {
      try {
        // mediaId can be either "filename" (root level) or "subdir/filename" (subdirectory)
        const filePath = path.join(uploadsDir, mediaId);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedFiles.push(mediaId);
        } else {
          errors.push(`File not found: ${mediaId}`);
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