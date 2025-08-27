import { NextResponse } from "next/server";
import Video from "@/models/Video";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Function to fetch videos from YouTube API
async function fetchYouTubeVideos() {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    throw new Error("YouTube API credentials not configured");
  }

  const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&type=video&maxResults=50`;
  
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

  return youtubeVideos;
}

export async function GET(req: Request) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);

    // Fetch videos from YouTube
    const youtubeVideos = await fetchYouTubeVideos();

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
      // For videos not in database, don't set _id so MongoDB can generate one when saved
      // Add a temporary field to identify these videos
      return {
        ...youtubeVideo,
        _isSaved: false
      };
    });

    console.log(`Returning ${mergedVideos.length} videos to admin panel`);

    return NextResponse.json(mergedVideos);
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);

    // Get video data from request body
    const videoData = await req.json();

    // Validate required fields
    if (!videoData.videoId || !videoData.title) {
      return NextResponse.json({ error: "Video ID and title are required" }, { status: 400 });
    }

    // Check if video already exists
    const existingVideo = await Video.findOne({ videoId: videoData.videoId });
    if (existingVideo) {
      return NextResponse.json({ error: "Video already exists" }, { status: 400 });
    }

    // Create new video in database
    const newVideo = new Video(videoData);
    await newVideo.save();

    console.log("Created new video:", newVideo.title);

    return NextResponse.json(newVideo);
  } catch (error: any) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video", details: error.message },
      { status: 500 }
    );
  }
}