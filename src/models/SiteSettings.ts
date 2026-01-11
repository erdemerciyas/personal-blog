import mongoose from 'mongoose';

interface ISiteSettings {
  logo: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  siteName: string;
  slogan: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  socialMedia: {
    linkedin: string;
    twitter: string;
    github: string;
    instagram: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  siteUrl: string;
  timezone: string;
  language: string;
  favicon: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  enableComments: boolean;
  analytics: {
    googleAnalyticsId: string;
    googleTagManagerId: string;
    googleSiteVerification: string;
    enableAnalytics: boolean;
  };
  system: {
    maxUploadSize: number;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ISiteSettingsModel extends mongoose.Model<ISiteSettings> {
  getSiteSettings(): Promise<ISiteSettings>;
  updateSiteSettings(updateData: Partial<ISiteSettings>): Promise<ISiteSettings>;
}

const SiteSettingsSchema = new mongoose.Schema<ISiteSettings>({
  logo: {
    url: {
      type: String,
      required: false,
      default: ''
    },
    alt: {
      type: String,
      required: false,
      default: 'Site Logo'
    },
    width: {
      type: Number,
      required: false,
      default: 200
    },
    height: {
      type: Number,
      required: false,
      default: 60
    }
  },
  siteName: {
    type: String,
    required: true,
    default: ''
  },
  slogan: {
    type: String,
    required: false,
    default: ''
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  colors: {
    primary: {
      type: String,
      required: false,
      default: '#003450' // brand-primary-900
    },
    secondary: {
      type: String,
      required: false,
      default: '#075985' // brand-primary-800
    },
    accent: {
      type: String,
      required: false,
      default: '#0369a1' // brand-primary-700
    }
  },
  socialMedia: {
    linkedin: {
      type: String,
      required: false,
      default: ''
    },
    twitter: {
      type: String,
      required: false,
      default: ''
    },
    github: {
      type: String,
      required: false,
      default: ''
    },
    instagram: {
      type: String,
      required: false,
      default: ''
    }
  },
  seo: {
    metaTitle: {
      type: String,
      required: false,
      default: ''
    },
    metaDescription: {
      type: String,
      required: false,
      default: ''
    },
    keywords: {
      type: [String],
      required: false,
      default: []
    }
  },
  contact: {
    email: {
      type: String,
      required: false,
      default: ''
    },
    phone: {
      type: String,
      required: false,
      default: ''
    },
    address: {
      type: String,
      required: false,
      default: ''
    }
  },
  // New Fields
  siteUrl: {
    type: String,
    default: ''
  },
  timezone: {
    type: String,
    default: 'Europe/Istanbul'
  },
  language: {
    type: String,
    default: 'tr'
  },
  favicon: {
    type: String,
    default: ''
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  enableComments: {
    type: Boolean,
    default: true
  },
  analytics: {
    googleAnalyticsId: { type: String, default: '' },
    googleTagManagerId: { type: String, default: '' },
    googleSiteVerification: { type: String, default: '' },
    enableAnalytics: { type: Boolean, default: false }
  },
  system: {
    maxUploadSize: { type: Number, default: 10 }
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

// Tek bir site ayarı kaydı olacak (singleton pattern)
SiteSettingsSchema.statics.getSiteSettings = async function () {
  let settings = await this.findOne({ isActive: true });

  if (!settings) {
    // Varsayılan ayarları oluştur
    settings = await this.create({
      siteName: '',
      slogan: '',
      isActive: true
    });
  }

  return settings;
};

SiteSettingsSchema.statics.updateSiteSettings = async function (updateData: Partial<ISiteSettings>) {
  // Use findOneAndUpdate with upsert option for atomic and reliable updates
  const settings = await this.findOneAndUpdate(
    { isActive: true },
    { $set: updateData },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }
  );
  return settings;
};

// Force model rebuild in development to apply schema changes
if (process.env.NODE_ENV === 'development' && mongoose.models.SiteSettings) {
  delete mongoose.models.SiteSettings;
}

const SiteSettings = (mongoose.models.SiteSettings as ISiteSettingsModel) ||
  mongoose.model<ISiteSettings, ISiteSettingsModel>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
export type { ISiteSettings };