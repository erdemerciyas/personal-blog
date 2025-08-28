import { NextResponse } from "next/server";
import Video from "@/models/Video";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Function to get videos from database only (no YouTube API)
async function getVideosFromDatabase() {
  // Get all videos
  const dbVideos = await Video.find({
    $and: [
      { videoId: { $exists: true } },
      { videoId: { $ne: null } },
      { videoId: { $ne: "" } }
    ]
  }).sort({ publishedAt: -1 });

  return dbVideos;
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

    // Get videos from database only (no YouTube API)
    const dbVideos = await getVideosFromDatabase();
    
    console.log(`Returning ${dbVideos.length} videos to admin panel from database`);
    return NextResponse.json(dbVideos);

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