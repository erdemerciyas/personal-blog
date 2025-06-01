import mongoose from 'mongoose';

interface IAbout extends mongoose.Document {
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  
  // Personal Story
  storyTitle: string;
  storyParagraphs: string[];
  
  // Skills
  skills: string[];
  
  // Experience
  experience: {
    title: string;
    company: string;
    period: string;
    description: string;
  }[];
  
  // Achievements
  achievements: string[];
  
  // Values
  values: {
    text: string;
    iconName: string;
  }[];
  
  // Contact Information
  contactTitle: string;
  contactDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  
  // Meta
  isActive: boolean;
  updatedAt: Date;
  createdAt: Date;
}

const AboutSchema = new mongoose.Schema({
  // Hero Section
  heroTitle: {
    type: String,
    required: true,
    default: 'Merhaba, Ben Erdem Erciyas'
  },
  heroSubtitle: {
    type: String,
    required: true,
    default: 'Developer & Mühendis'
  },
  heroDescription: {
    type: String,
    required: true,
    default: 'Full-Stack Developer ve Mühendis olarak modern teknolojiler ve yaratıcı çözümlerle projelerinizi hayata geçiriyorum.'
  },
  
  // Personal Story
  storyTitle: {
    type: String,
    required: true,
    default: 'Hikayem'
  },
  storyParagraphs: [{
    type: String,
    required: true
  }],
  
  // Skills
  skills: [{
    type: String,
    required: true
  }],
  
  // Experience
  experience: [{
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
  }],
  
  // Achievements
  achievements: [{
    type: String,
    required: true
  }],
  
  // Values
  values: [{
    text: {
      type: String,
      required: true
    },
    iconName: {
      type: String,
      required: true,
      enum: ['SparklesIcon', 'HeartIcon', 'TrophyIcon', 'AcademicCapIcon', 'UserGroupIcon', 'CogIcon']
    }
  }],
  
  // Contact Information
  contactTitle: {
    type: String,
    required: true,
    default: 'Birlikte Çalışalım'
  },
  contactDescription: {
    type: String,
    required: true,
    default: 'Yeni bir proje mi planlıyorsunuz? Teknoloji ve mühendislik çözümleri için benimle iletişime geçin.'
  },
  contactEmail: {
    type: String,
    required: true,
    default: 'erdem@erciyasengineering.com'
  },
  contactPhone: {
    type: String,
    required: true,
    default: '+90 (555) 123 45 67'
  },
  contactLocation: {
    type: String,
    required: true,
    default: 'Ankara, Türkiye'
  },
  
  // Meta
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one active about record
AboutSchema.pre('save', async function(next) {
  if (this.isActive) {
    await mongoose.model('About').updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

const About = mongoose.models.About || mongoose.model<IAbout>('About', AboutSchema);

export default About; 