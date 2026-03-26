import { NextRequest, NextResponse } from "next/server";
import Video from "@/models/Video";
import connectDB from "@/lib/mongoose";

async function fetchYouTubeVideos() {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    throw new Error("YouTube API credentials not configured");
  }

  const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&type=video&maxResults=50`;

  console.log("Fetching YouTube videos for channel:", YOUTUBE_CHANNEL_ID);

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`YouTube API error: ${data.error?.message || 'Unknown error'}`);
  }

  return data.items.map((item: { id: { videoId: string }; snippet: { title: string; description: string; thumbnails: { medium: { url: string } }; publishedAt: string } }) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.medium.url,
    publishedAt: item.snippet.publishedAt,
    type: "normal",
    status: "visible",
    tags: [],
  }));
}

export async function GET(request: NextRequest) {
  const hasVercelCronHeader = !!request.headers.get('x-vercel-cron');
  const authHeader = request.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;
  const secretParam = request.nextUrl.searchParams.get('secret') || request.headers.get('x-cron-secret') || bearer;
  const isAuthorized = hasVercelCronHeader || (secretParam && secretParam === process.env.CRON_SECRET);

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const youtubeVideos = await fetchYouTubeVideos();
    const videoIds = youtubeVideos.map((video: { videoId: string }) => video.videoId);
    const existingVideos = await Video.find({ videoId: { $in: videoIds } });
    const existingSet = new Set(existingVideos.map((v: { videoId: string }) => v.videoId));

    let addedCount = 0;
    for (const youtubeVideo of youtubeVideos) {
      if (!existingSet.has(youtubeVideo.videoId)) {
        const newVideo = new Video(youtubeVideo);
        await newVideo.save();
        addedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed. Processed ${youtubeVideos.length} videos. Added ${addedCount} new videos.`,
    });
  } catch (error: unknown) {
    console.error("Error syncing YouTube videos:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync YouTube videos" },
      { status: 500 }
    );
  }
}