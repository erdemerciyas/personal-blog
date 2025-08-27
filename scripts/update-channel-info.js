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

async function updateChannelInfo() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const channelInfo = {
      channelId: 'UCidvQBD2T3GNf2Sek8qs7iw',
      channelName: 'FIXRAL',
      channelUrl: 'https://www.youtube.com/@fixral'
    };

    console.log('Updating existing videos with channel info...');
    
    // Update all videos without channel info
    const result = await Video.updateMany(
      {
        $or: [
          { channelId: { $exists: false } },
          { channelId: null },
          { channelId: '' }
        ]
      },
      {
        $set: channelInfo
      }
    );

    console.log(`Updated ${result.modifiedCount} videos with channel info`);

    // Also make all videos visible
    const visibilityResult = await Video.updateMany(
      { status: 'hidden' },
      { $set: { status: 'visible' } }
    );

    console.log(`Made ${visibilityResult.modifiedCount} videos visible`);

    // Show updated videos
    const videos = await Video.find({}).sort({ publishedAt: -1 });
    console.log(`\nTotal videos: ${videos.length}`);
    
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   Channel: ${video.channelName} (${video.channelId})`);
      console.log(`   Status: ${video.status}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateChannelInfo();