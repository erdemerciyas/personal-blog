import { NextResponse } from "next/server";
import Video from "@/models/Video";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Update video status
export async function PUT(
  req: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    console.log("Toggle video visibility request received", { params });
    
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log("User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User authenticated", { userId: session.user.id });

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);

    // Get the video ID from params
    const { videoId } = params;
    console.log("Video ID from params", { videoId });
    
    // Get status from request body
    const { status } = await req.json();
    console.log("Status from request body", { status });
    
    if (!status || !['visible', 'hidden'].includes(status)) {
      console.log("Invalid status parameter", { status });
      return NextResponse.json(
        { error: "Invalid status. Must be 'visible' or 'hidden'" },
        { status: 400 }
      );
    }

    // Find and update the video
    console.log("Attempting to find and update video", { videoId, status });
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { status },
      { new: true }
    );
    console.log("Video update result", { updatedVideo: !!updatedVideo });

    if (!updatedVideo) {
      console.log("Video not found", { videoId });
      return NextResponse.json(
        { error: "Video not found in database. Save the video first before changing its status." },
        { status: 404 }
      );
    }

    console.log("Video status updated successfully", { videoId, newStatus: updatedVideo.status });
    return NextResponse.json(updatedVideo);
  } catch (error: any) {
    console.error("Error updating video status:", error);
    return NextResponse.json(
      { error: "Failed to update video status", details: error.message },
      { status: 500 }
    );
  }
}