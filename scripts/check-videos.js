const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Video schema
const VideoSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  title: String,
  description: String,
  thumbnail: String,
  duration: String,
  publishedAt: Date,
  type: { type: String, enum: ["short", "normal"], default: "normal" },
  status: { type: String, enum: ["visible", "hidden"], default: "visible" },
  tags: [String],
  channelId: String,
  channelName: String,
  channelUrl: String,
});

const Video = mongoose.models.Video || mongoose.model("Video", VideoSchema);

async function checkVideos() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Checking current videos...');
    
    const videos = await Video.find({}).sort({ publishedAt: -1 });
    
    console.log(`\nTotal videos in database: ${videos.length}\n`);
    
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   Video ID: ${video.videoId}`);
      console.log(`   Channel: ${video.channelName || 'N/A'} (${video.channelId || 'N/A'})`);
      console.log(`   Status: ${video.status}`);
      console.log(`   Type: ${video.type}`);
      console.log(`   Published: ${video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : 'N/A'}`);
      console.log('');
    });
    
    // Group by channel
    const channelGroups = videos.reduce((groups, video) => {
      const channelKey = video.channelId || video.channelName || 'Unknown';
      if (!groups[channelKey]) {
        groups[channelKey] = [];
      }
      groups[channelKey].push(video);
      return groups;
    }, {});
    
    console.log('\n=== Videos by Channel ===');
    Object.keys(channelGroups).forEach(channelKey => {
      const channelVideos = channelGroups[channelKey];
      console.log(`\n${channelKey}: ${channelVideos.length} videos`);
      channelVideos.forEach(video => {
        console.log(`  - ${video.title} (${video.videoId})`);
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkVideos();