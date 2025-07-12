import mongoose from 'mongoose';

const SliderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subtitle: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    required: true,
    default: 'Daha Fazla',
  },
  buttonLink: {
    type: String,
    required: true,
    default: '/contact',
  },
  badge: {
    type: String,
    required: true,
    default: 'Yenilik',
  },
  // Image configuration
  imageType: {
    type: String,
    enum: ['upload', 'url', 'ai-generated'],
    required: true,
    default: 'upload',
  },
  imageUrl: {
    type: String,
    required: true,
  },
  // AI generation settings
  aiPrompt: {
    type: String,
    default: '',
  },
  aiProvider: {
    type: String,
    enum: ['openai', 'unsplash', 'custom'],
    default: 'unsplash',
  },
  // Display settings
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  // Animation settings
  duration: {
    type: Number,
    default: 5000, // milliseconds
  },
  // Metadata
  createdBy: {
    type: String,
    default: 'admin',
  },
  updatedBy: {
    type: String,
    default: 'admin',
  },
}, {
  timestamps: true,
});

// Index for ordering
SliderSchema.index({ order: 1, isActive: 1 });

export default mongoose.models.Slider || mongoose.model('Slider', SliderSchema);