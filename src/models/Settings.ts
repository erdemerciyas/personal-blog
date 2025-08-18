import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: '',
  },
  siteTitle: {
    type: String,
    required: true,
    default: '',
  },
  siteDescription: {
    type: String,
    required: true,
    default: '',
  },
  siteKeywords: {
    type: String,
    default: '',
  },
  siteUrl: {
    type: String,
    default: '',
  },
  logo: {
    type: String,
    default: '',
  },
  favicon: {
    type: String,
    default: '/favicon.ico',
  },
  // Social Media & SEO
  ogImage: {
    type: String,
    default: '/images/og-image.jpg',
  },
  twitterHandle: {
    type: String,
    default: '@erciyaseng',
  },
  // Analytics
  googleAnalyticsId: {
    type: String,
    default: '',
  },
  googleTagManagerId: {
    type: String,
    default: '',
  },
  googleSiteVerification: {
    type: String,
    default: '',
  },
  facebookPixelId: {
    type: String,
    default: '',
  },
  hotjarId: {
    type: String,
    default: '',
  },
  customHeadScripts: {
    type: String,
    default: '',
  },
  customBodyStartScripts: {
    type: String,
    default: '',
  },
  customBodyEndScripts: {
    type: String,
    default: '',
  },
  // Admin User Settings
  adminSettings: {
    defaultLanguage: {
      type: String,
      default: 'tr',
      enum: ['tr', 'en'],
    },
    timezone: {
      type: String,
      default: 'Europe/Istanbul',
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY',
    },
    enableNotifications: {
      type: Boolean,
      default: true,
    },
  },
  // System Settings
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  allowRegistration: {
    type: Boolean,
    default: false,
  },
  maxUploadSize: {
    type: Number,
    default: 10, // MB
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema); 