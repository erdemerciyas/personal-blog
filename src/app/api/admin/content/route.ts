import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Video from "@/models/Video";
import mongoose from "mongoose";

// Function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Function to get video info from oEmbed API (no API key needed)
async function getVideoInfo(videoId: string) {
  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oEmbedUrl);
    
    if (!response.ok) {
      console.warn(`oEmbed failed for video ${videoId}`);
      return null;
    }
    
    const data = await response.json();
    return {
      title: data.title || `Video ${videoId}`,
      channelName: data.author_name || 'Unknown Channel',
      thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      duration: null // oEmbed doesn't provide duration
    };
  } catch (error) {
    console.warn(`Error fetching video info for ${videoId}:`, error);
    return null;
  }
}



// Function to detect content type and process accordingly
function analyzeContent(content: string) {
  const trimmed = content.trim();
  const lines = trimmed.split('\n').filter(line => line.trim());
  
  console.log('Analyzing content:', { trimmed, lines });
  
  // Check if it's a single video URL
  if (lines.length === 1 && extractVideoId(lines[0])) {
    console.log('Detected: single video');
    return {
      type: 'single_video',
      videoId: extractVideoId(lines[0]),
      url: lines[0]
    };
  }
  
  // Check if it's multiple video URLs
  const videoIds = lines.map(line => extractVideoId(line.trim())).filter(Boolean);
  if (videoIds.length > 0) {
    console.log('Detected: multiple videos');
    return {
      type: 'multiple_videos',
      videos: lines.map(line => {
        const videoId = extractVideoId(line.trim());
        return videoId ? {
          videoId,
          url: line.trim()
        } : null;
      }).filter(Boolean)
    };
  }
  
  // If no video URLs found, return error
  console.log('No video URLs detected');
  return {
    type: 'invalid',
    error: 'Sadece YouTube video linkleri kabul edilir'
  };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    const { content } = await req.json();
    
    if (!content?.trim()) {
      return NextResponse.json({ error: "İçerik gereklidir" }, { status: 400 });
    }

    const analysis = analyzeContent(content);
    console.log('Content analysis:', analysis);

    // Handle invalid content
    if (analysis.type === 'invalid') {
      return NextResponse.json({ error: analysis.error }, { status: 400 });
    }

    // Use default channel info for videos
    const generalChannel = {
      channelId: "GENERAL_VIDEOS",
      channelName: "Genel Videolar",
      channelUrl: "#GENERAL_VIDEOS"
    };

    let addedCount = 0;
    let skippedCount = 0;
    const addedVideos = [];

    // Process videos (single or multiple)
    const videosToProcess = analysis.type === 'single_video' 
      ? [{ videoId: analysis.videoId, url: analysis.url }]
      : analysis.videos || [];

    for (const videoData of videosToProcess) {
      if (!videoData || !videoData.videoId) continue;

      // Check if video already exists
      const existingVideo = await Video.findOne({ videoId: videoData.videoId });
      if (existingVideo) {
        skippedCount++;
        continue;
      }

      // Get video info from oEmbed
      const videoInfo = await getVideoInfo(videoData.videoId);

      const video = new Video({
        videoId: videoData.videoId,
        title: videoInfo?.title || `Video ${videoData.videoId}`,
        description: `Video from ${videoInfo?.channelName || 'YouTube'}`,
        thumbnail: videoInfo?.thumbnail || `https://img.youtube.com/vi/${videoData.videoId}/mqdefault.jpg`,
        publishedAt: new Date(),
        type: 'normal',
        status: 'visible',
        tags: [],
        channelId: generalChannel.channelId,
        channelName: generalChannel.channelName,
        channelUrl: generalChannel.channelUrl
      });

      await video.save();
      addedCount++;
      addedVideos.push(videoInfo?.title || `Video ${videoData.videoId}`);
    }

    // No need to update channel count since we don't have Channel model anymore

    return NextResponse.json({
      type: 'videos',
      videosAdded: addedCount,
      videosSkipped: skippedCount,
      channelName: generalChannel.channelName,
      addedVideos: addedVideos.slice(0, 3) // Show first 3 video titles
    });

  } catch (error: any) {
    console.error("Error processing content:", error);
    return NextResponse.json(
      { error: "İçerik işlenirken hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}