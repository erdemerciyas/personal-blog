import { NextResponse } from "next/server";
import Video from "@/models/Video";
import mongoose from "mongoose";

export async function GET() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    
    // Check if we can access the Video collection
    const videoCount = await Video.countDocuments();
    
    // Check if required environment variables are set
    const youtubeApiKeySet = !!process.env.YOUTUBE_API_KEY;
    const youtubeChannelIdSet = !!process.env.YOUTUBE_CHANNEL_ID;
    
    // Check if we can access the YouTube API (simple check)
    let youtubeApiAccessible = false;
    if (youtubeApiKeySet && youtubeChannelIdSet) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/channels?key=${process.env.YOUTUBE_API_KEY}&id=${process.env.YOUTUBE_CHANNEL_ID}&part=snippet`;
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        youtubeApiAccessible = response.ok;
      } catch (error) {
        console.error("YouTube API access check failed:", error);
      }
    }
    
    return NextResponse.json({
      status: "ok",
      videoCount,
      youtubeApiKeySet,
      youtubeChannelIdSet,
      youtubeApiAccessible,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("YouTube health check failed:", error);
    return NextResponse.json(
      { 
        status: "error", 
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}