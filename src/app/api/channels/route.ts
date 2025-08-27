import { NextResponse } from "next/server";
import Video from "@/models/Video";
import mongoose from "mongoose";

export async function GET() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);

    // Get unique channels from videos
    const channels = await Video.aggregate([
      {
        $match: {
          channelId: { $exists: true, $ne: null, $nin: ["", null] }
        }
      },
      {
        $group: {
          _id: "$channelId",
          channelName: { $first: "$channelName" },
          channelUrl: { $first: "$channelUrl" },
          videoCount: { $sum: 1 }
        }
      },
      {
        $project: {
          channelId: "$_id",
          channelName: 1,
          channelUrl: 1,
          videoCount: 1,
          _id: 0
        }
      },
      {
        $sort: { videoCount: -1 }
      }
    ]);

    return NextResponse.json(channels);
  } catch (error: any) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels", details: error.message },
      { status: 500 }
    );
  }
}