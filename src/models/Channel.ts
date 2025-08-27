import mongoose, { Schema, models } from "mongoose";

const ChannelSchema = new Schema({
  channelId: { type: String, required: true, unique: true },
  channelName: { type: String, required: true },
  channelUrl: { type: String, required: true },
  customUrl: String, // @fixral gibi custom URL'ler için
  description: String,
  isActive: { type: Boolean, default: true },
  lastSyncAt: Date,
  videoCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default models.Channel || mongoose.model("Channel", ChannelSchema);