import { NextResponse } from "next/server";
import Video from "@/models/Video";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get a specific video
export async function GET(
  req: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);

    // Get the video ID from params
    const { videoId } = params;

    // Find the video
    const video = await Video.findById(videoId);

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error: any) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Failed to fetch video", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a video
export async function PUT(
  req: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);

    // Get the video ID from params
    const { videoId } = params;
    
    // Get update data from request body
    const updateData = await req.json();
    
    // Find and update the video
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      updateData,
      { new: true }
    );

    if (!updatedVideo) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedVideo);
  } catch (error: any) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Failed to update video", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a video
export async function DELETE(
  req: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);

    // Get the video ID from params
    const { videoId } = params;

    // Find and delete the video
    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Video deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video", details: error.message },
      { status: 500 }
    );
  }
}