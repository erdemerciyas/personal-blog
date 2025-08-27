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

async function clearDemoVideos() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing demo videos...');
    
    // Demo video IDs to remove
    const demoVideoIds = [
      "dQw4w9WgXcQ",
      "9bZkp7q19f0", 
      "kJQP7kiw5Fk",
      "fJ9rUzIMcZQ",
      "YQHsXMglC9A",
      "JGwWNGJdvx8"
    ];

    const result = await Video.deleteMany({ 
      videoId: { $in: demoVideoIds } 
    });

    console.log(`Deleted ${result.deletedCount} demo videos`);
    
    // Show remaining video count
    const count = await Video.countDocuments();
    console.log(`Remaining videos in database: ${count}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

clearDemoVideos();