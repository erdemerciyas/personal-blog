const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

// Import the Video model
const Video = require('../src/models/Video').default;

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
  const youtubeVideos = data.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.medium.url,
    publishedAt: item.snippet.publishedAt,
    type: "normal", // Default to normal
    status: "visible", // Default to visible
    tags: [] // Default to empty
  }));

  return youtubeVideos;
}

async function syncVideos() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB");

    // Fetch videos from YouTube
    const youtubeVideos = await fetchYouTubeVideos();

    console.log(`Fetched ${youtubeVideos.length} videos from YouTube`);

    // Get video IDs to check for existing entries in our database
    const videoIds = youtubeVideos.map((video) => video.videoId);
    
    // Find existing videos in our database
    const existingVideos = await Video.find({ videoId: { $in: videoIds } });
    
    // Create a map for quick lookup of existing videos
    const existingVideosMap = existingVideos.reduce((map, video) => {
      map[video.videoId] = video;
      return map;
    }, {});

    // Process each YouTube video
    let addedCount = 0;
    for (const youtubeVideo of youtubeVideos) {
      // If video doesn't exist in our database, create it
      if (!existingVideosMap[youtubeVideo.videoId]) {
        const newVideo = new Video(youtubeVideo);
        await newVideo.save();
        console.log(`Added new video: ${youtubeVideo.title}`);
        addedCount++;
      }
    }

    console.log(`Sync completed. Added ${addedCount} new videos.`);
    process.exit(0);
  } catch (error) {
    console.error("Error syncing YouTube videos:", error);
    process.exit(1);
  }
}

// Run the sync
console.log("Starting YouTube video sync...");
syncVideos();