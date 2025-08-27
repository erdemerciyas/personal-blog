# YouTube Video Integration Documentation

This document explains how the YouTube video integration works in this project.

## Overview

The YouTube video integration allows you to automatically fetch and display videos from your YouTube channel on your website. It includes both automatic synchronization and manual management capabilities through the admin panel.

## Architecture

The integration consists of several components:

1. **Video Model** - MongoDB schema for storing video metadata
2. **YouTube API Route** - Fetches videos from YouTube and merges with database overrides
3. **Admin API Routes** - Handles video management operations
4. **Public Videos Page** - Displays videos to visitors
5. **Admin Videos Page** - Allows administrators to manage videos
6. **Cron Job** - Automatically syncs videos from YouTube
7. **Manual Sync Script** - Allows manual synchronization

## Components

### Video Model

Located at `src/models/Video.ts`, this Mongoose model defines the structure for storing video information:

```typescript
const VideoSchema = new Schema({
  videoId: { type: String, required: true, unique: true },
  title: String,
  description: String,
  thumbnail: String,
  duration: String,
  publishedAt: Date,
  type: { type: String, enum: ["short", "normal"], default: "normal" },
  status: { type: String, enum: ["visible", "hidden"], default: "visible" },
  tags: [String],
});
```

### YouTube API Route

Located at `src/app/api/youtube/route.ts`, this route:

1. Fetches videos from the YouTube Data API
2. Merges YouTube data with database overrides
3. Supports filtering by type and status
4. Returns the combined video data

### Admin API Routes

Located in `src/app/api/admin/videos/`, these routes handle:

1. **GET /api/admin/videos** - List all videos with YouTube data merged
2. **POST /api/admin/videos** - Add a new video manually
3. **PUT /api/admin/videos/[id]** - Update video details
4. **PUT /api/admin/videos/[id]/status** - Toggle video visibility

### Public Videos Page

Located at `src/app/videos/page.tsx`, this page displays videos to visitors with:

1. Search functionality
2. Filtering by video type (normal/short)
3. Responsive grid layout
4. Links to YouTube for watching videos

### Admin Videos Page

Located at `src/app/admin/videos/page.tsx`, this page provides:

1. Video listing with edit capabilities
2. Modal for adding new videos
3. Toggle for video visibility
4. Search and filtering
5. Integration with admin layout and authentication

### Cron Job

Located at `src/app/api/cron/sync-youtube-videos/route.ts`, this route:

1. Automatically fetches videos from YouTube
2. Adds new videos to the database
3. Can be triggered by a cron job or manually

### Manual Sync Script

Located at `scripts/sync-youtube-videos.js`, this script:

1. Can be run manually to sync videos
2. Provides detailed logging
3. Can be scheduled as a cron job

## Setup

### Environment Variables

To enable YouTube integration, you need to set these environment variables:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_youtube_channel_id_here
```

### YouTube API Key

1. Go to the Google Cloud Console
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API key)
5. Add the API key to your environment variables

### YouTube Channel ID

1. Go to your YouTube channel page
2. View the page source (Ctrl+U)
3. Search for "channelId"
4. Copy the channel ID and add it to your environment variables

## Usage

### Automatic Sync

Videos are automatically synced daily through the cron job. You can also trigger sync manually:

```bash
npm run sync-videos
```

### Manual Management

1. Log in to the admin panel
2. Navigate to "Video Yönetimi"
3. Add, edit, or hide videos as needed

### Public Display

Visitors can view videos at `/videos` with search and filtering capabilities.

## API Endpoints

### Public Endpoints

- `GET /api/youtube` - Fetch videos from YouTube with database overrides
  - Query parameters:
    - `limit` - Number of videos to return (max 50)
    - `type` - Filter by video type (normal/short)
    - `status` - Filter by status (visible/hidden)

### Admin Endpoints

- `GET /api/admin/videos` - List all videos
- `POST /api/admin/videos` - Add a new video
- `PUT /api/admin/videos/[id]` - Update video details
- `PUT /api/admin/videos/[id]/status` - Toggle video visibility
- `GET /api/cron/sync-youtube-videos` - Trigger video sync

## Data Flow

1. YouTube Data API fetches latest videos from your channel
2. Videos are merged with database overrides (title, description, etc.)
3. Videos are filtered by status (visible/hidden)
4. Videos are displayed on the public page or managed in the admin panel
5. New videos are automatically added to the database
6. Administrators can manually add, edit, or hide videos

## Customization

### Video Types

Videos can be categorized as:
- `normal` - Regular YouTube videos
- `short` - YouTube Shorts

### Video Status

Videos can be:
- `visible` - Displayed to visitors
- `hidden` - Hidden from visitors (but still in database)

### Tags

Videos can have custom tags for better organization and search.

## Troubleshooting

### Videos Not Appearing

1. Check that `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` are set correctly
2. Verify that the YouTube Data API is enabled in Google Cloud Console
3. Check the server logs for any error messages
4. Ensure MongoDB is accessible and the Video collection exists

### Sync Issues

1. Run the manual sync script to see detailed error messages
2. Check that the cron job is running correctly
3. Verify that the YouTube API key has the correct permissions

### Admin Panel Issues

1. Ensure you're logged in as an administrator
2. Check that the API routes are accessible
3. Verify that MongoDB is working correctly

## Security

The integration follows these security practices:

1. API keys are stored in environment variables
2. Admin routes are protected with authentication
3. Input validation is performed on all API endpoints
4. Database queries are properly sanitized
5. Rate limiting is implemented to prevent abuse

## Performance

The integration is optimized for performance:

1. Videos are cached in the database to reduce API calls
2. Only necessary video data is fetched from YouTube
3. Database queries are optimized with proper indexing
4. Frontend components are optimized with virtualization where needed
5. API responses are properly structured for efficient client-side processing

## Future Improvements

Potential enhancements for the YouTube integration:

1. Add video categories and more advanced filtering
2. Implement video playlists
3. Add video statistics (views, likes, etc.)
4. Implement video upload functionality
5. Add more detailed analytics
6. Implement video recommendations
7. Add support for multiple YouTube channels