import mongoose, { Schema, models } from "mongoose";

const VideoSchema = new Schema({
  videoId: { type: String, required: true, unique: true },
  title: String,
  description: String,
  thumbnail: String,
  duration: String,
  publishedAt: Date,
  type: { type: String, enum: ["short", "normal"], default: "normal" },
  status: { type: String, enum: ["visible", "hidden"], default: "visible" },
  tags: [String],
  // Kanal bilgileri
  channelId: String,
  channelName: String,
  channelUrl: String,
});

export default models.Video || mongoose.model("Video", VideoSchema);