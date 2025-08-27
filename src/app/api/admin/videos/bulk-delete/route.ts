import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Video from "@/models/Video";
import Channel from "@/models/Channel";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    const { videoIds } = await req.json();
    
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json({ error: "Video ID'leri gereklidir" }, { status: 400 });
    }

    // Get videos before deletion to update channel counts
    const videosToDelete = await Video.find({ _id: { $in: videoIds } });
    const channelIds = [...new Set(videosToDelete.map(v => v.channelId).filter(Boolean))];

    // Delete videos
    const result = await Video.deleteMany({ _id: { $in: videoIds } });

    // Update channel video counts
    for (const channelId of channelIds) {
      const videoCount = await Video.countDocuments({ channelId });
      await Channel.updateOne(
        { channelId },
        { 
          videoCount,
          updatedAt: new Date()
        }
      );
    }

    return NextResponse.json({
      message: `${result.deletedCount} video başarıyla silindi`,
      deletedCount: result.deletedCount
    });

  } catch (error: any) {
    console.error("Error bulk deleting videos:", error);
    return NextResponse.json(
      { error: "Videolar silinirken hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}