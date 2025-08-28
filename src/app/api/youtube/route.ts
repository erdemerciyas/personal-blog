import { NextResponse } from "next/server";
import Video from "@/models/Video";
import mongoose from "mongoose";

// Function to get videos from database only (no YouTube API)
async function getVideosFromDatabase(queryParams: { limit?: number; type?: string; status?: string; channelId?: string } = {}) {
  // Build query for videos
  const query: any = {
    $and: [
      { videoId: { $exists: true } },
      { videoId: { $ne: null } },
      { videoId: { $ne: "" } }
    ]
  };
  
  // Apply additional filters
  if (queryParams.type) query.type = queryParams.type;
  if (queryParams.status) query.status = queryParams.status;
  if (queryParams.channelId) query.channelId = queryParams.channelId;
  
  const limit = queryParams.limit || 12;
  const dbVideos = await Video.find(query)
    .sort({ publishedAt: -1 })
    .limit(limit);

  return {
    videos: dbVideos,
    nextPageToken: null,
    prevPageToken: null,
    totalResults: dbVideos.length
  };
}

export async function GET(req: Request) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 12;
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const pageToken = searchParams.get("pageToken") || undefined;
    const channelId = searchParams.get("channelId") || undefined;

    console.log("Fetching videos with params:", { limit, type, status, pageToken, channelId });

    // Get videos from database only (no YouTube API)
    const data = await getVideosFromDatabase({ limit, type, status, channelId });
    
    console.log(`Returning ${data.videos.length} videos from database`);

    return NextResponse.json({
      videos: data.videos,
      nextPageToken: data.nextPageToken,
      totalResults: data.totalResults
    });

  } catch (error: any) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos", details: error.message },
      { status: 500 }
    );
  }
}