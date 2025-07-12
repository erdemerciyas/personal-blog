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
      default: '#0f766e' // teal-700
    },
    secondary: {
      type: String,
      required: false,
      default: '#1e40af' // blue-700
    },
    accent: {
      type: String,
      required: false,
      default: '#db2777' // pink-600
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
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

// Tek bir site ayarı kaydı olacak (singleton pattern)
SiteSettingsSchema.statics.getSiteSettings = async function() {
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

SiteSettingsSchema.statics.updateSiteSettings = async function(updateData: Partial<ISiteSettings>) {
  let settings = await this.findOne({ isActive: true });
  
  if (!settings) {
    settings = await this.create({ ...updateData, isActive: true });
  } else {
    Object.assign(settings, updateData);
    await settings.save();
  }
  
  return settings;
};

const SiteSettings = (mongoose.models.SiteSettings as ISiteSettingsModel) || 
  mongoose.model<ISiteSettings, ISiteSettingsModel>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
export type { ISiteSettings };