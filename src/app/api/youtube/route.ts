import { NextResponse } from "next/server";
import Video from "@/models/Video";
import mongoose from "mongoose";

// Function to fetch videos from YouTube API
async function fetchYouTubeVideos(queryParams: { limit?: number; type?: string; status?: string; pageToken?: string } = {}) {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    throw new Error("YouTube API credentials not configured");
  }

  // Build the YouTube API URL
  let url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&type=video`;
  
  // Add query parameters
  if (queryParams.limit) {
    url += `&maxResults=${Math.min(queryParams.limit, 50)}`; // YouTube API max is 50
  } else {
    url += "&maxResults=12"; // Default limit
  }
  
  // Add page token for pagination
  if (queryParams.pageToken) {
    url += `&pageToken=${queryParams.pageToken}`;
  }

  console.log("Fetching YouTube videos with URL:", url);

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    console.error("YouTube API error response:", data);
    throw new Error(`YouTube API error: ${data.error?.message || 'Unknown error'}`);
  }

  // Transform YouTube API response to our video format
  const youtubeVideos = data.items.map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.medium.url,
    publishedAt: item.snippet.publishedAt,
    type: "normal", // Default to normal, can be overridden in DB
    status: "visible", // Default to visible, can be overridden in DB
    tags: [] // Default to empty, can be overridden in DB
  }));

  return {
    videos: youtubeVideos,
    nextPageToken: data.nextPageToken,
    prevPageToken: data.prevPageToken,
    totalResults: data.pageInfo?.totalResults
  };
}

export async function GET(req: Request) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const pageToken = searchParams.get("pageToken") || undefined;

    console.log("Fetching videos with params:", { limit, type, status, pageToken });

    // Fetch videos from YouTube
    const youtubeData = await fetchYouTubeVideos({ limit, type, status, pageToken });
    const youtubeVideos = youtubeData.videos;

    // Get video IDs to check for overrides in our database
    const videoIds = youtubeVideos.map((video: any) => video.videoId);
    
    // Find any overrides in our database
    const dbVideos = await Video.find({ videoId: { $in: videoIds } });
    
    // Create a map for quick lookup of database overrides
    const dbVideosMap = dbVideos.reduce((map: any, dbVideo: any) => {
      map[dbVideo.videoId] = dbVideo;
      return map;
    }, {});

    // Merge YouTube data with database overrides
    const mergedVideos = youtubeVideos.map((youtubeVideo: any) => {
      const dbVideo = dbVideosMap[youtubeVideo.videoId];
      if (dbVideo) {
        // Merge database overrides with YouTube data
        return {
          ...youtubeVideo,
          title: dbVideo.title || youtubeVideo.title,
          description: dbVideo.description || youtubeVideo.description,
          thumbnail: dbVideo.thumbnail || youtubeVideo.thumbnail,
          type: dbVideo.type || youtubeVideo.type,
          status: dbVideo.status || youtubeVideo.status,
          tags: dbVideo.tags || youtubeVideo.tags,
          _id: dbVideo._id
        };
      }
      return youtubeVideo;
    });

    // Filter by type if specified
    let filteredVideos = mergedVideos;
    if (type) {
      filteredVideos = mergedVideos.filter((video: any) => video.type === type);
    }

    // Filter by status if specified
    if (status) {
      filteredVideos = filteredVideos.filter((video: any) => video.status === status);
    }

    console.log(`Returning ${filteredVideos.length} videos`);

    return NextResponse.json({
      videos: filteredVideos,
      nextPageToken: youtubeData.nextPageToken,
      totalResults: youtubeData.totalResults
    });
  } catch (error: any) {
    console.error("Error fetching YouTube videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube videos", details: error.message },
      { status: 500 }
    );
  }
}