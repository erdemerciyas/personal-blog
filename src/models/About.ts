import mongoose from 'mongoose';

const ValueSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  iconName: {
    type: String,
    required: true,
    default: 'SparklesIcon'
  }
});

const ExperienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  period: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const AboutSchema = new mongoose.Schema({
  heroTitle: {
    type: String,
    required: true
  },
  heroSubtitle: {
    type: String,
    required: true
  },
  heroDescription: {
    type: String,
    required: true
  },
  storyTitle: {
    type: String,
    required: true
  },
  storyParagraphs: [{
    type: String,
    required: true
  }],
  skills: [{
    type: String,
    required: true
  }],
  experience: [ExperienceSchema],
  achievements: [{
    type: String,
    required: true
  }],
  values: [ValueSchema],
  contactTitle: {
    type: String,
    required: true
  },
  contactDescription: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  contactLocation: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.About || mongoose.model('About', AboutSchema);