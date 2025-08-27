import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Video from "@/models/Video";
import Channel from "@/models/Channel";
import mongoose from "mongoose";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    const video = await Video.findById(params.id);
    if (!video) {
      return NextResponse.json({ error: "Video bulunamadı" }, { status: 404 });
    }

    // Delete the video
    await Video.findByIdAndDelete(params.id);

    // Update channel video count
    if (video.channelId) {
      const videoCount = await Video.countDocuments({ channelId: video.channelId });
      await Channel.updateOne(
        { channelId: video.channelId },
        { 
          videoCount,
          updatedAt: new Date()
        }
      );
    }

    return NextResponse.json({
      message: "Video başarıyla silindi",
      videoTitle: video.title
    });

  } catch (error: any) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Video silinirken hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    const updateData = await req.json();
    
    const video = await Video.findByIdAndUpdate(
      params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!video) {
      return NextResponse.json({ error: "Video bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(video);

  } catch (error: any) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Video güncellenirken hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}