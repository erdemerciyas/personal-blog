import mongoose, { Model } from 'mongoose';

interface IFooterSettings {
  mainDescription: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  quickLinks: {
    title: string;
    url: string;
    isExternal: boolean;
  }[];
  socialLinks: {
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
    github: string;
    youtube: string;
  };
  copyrightInfo: {
    companyName: string;
    year: number;
    additionalText: string;
  };
  developerInfo: {
    name: string;
    website: string;
    companyName: string;
  };
  visibility: {
    showQuickLinks: boolean;
    showSocialLinks: boolean;
    showContactInfo: boolean;
    showDeveloperInfo: boolean;
  };
  theme: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
}

interface IFooterSettingsModel extends Model<IFooterSettings> {
  getSingleton(): Promise<IFooterSettings>;
}

const FooterSettingsSchema = new mongoose.Schema({
  // Ana Açıklama
  mainDescription: {
    type: String,
    default: 'Mühendislik ve teknoloji alanında yenilikçi çözümler sunarak projelerinizi hayata geçiriyoruz.'
  },
  
  // İletişim Bilgileri
  contactInfo: {
    email: {
      type: String,
      default: 'erdem.erciyas@gmail.com'
    },
    phone: {
      type: String,
      default: '+90 (500) 123 45 67'
    },
    address: {
      type: String,
      default: 'Teknoloji Vadisi, Ankara, Türkiye'
    }
  },
  
  // Hızlı Bağlantılar
  quickLinks: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    isExternal: {
      type: Boolean,
      default: false
    }
  }],
  
  // Sosyal Medya Linkleri
  socialLinks: {
    linkedin: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    facebook: {
      type: String,
      default: ''
    },
    github: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    }
  },
  
  // Copyright Bilgileri
  copyrightInfo: {
    companyName: {
      type: String,
      default: 'Erdem Erciyas'
    },
    year: {
      type: Number,
      default: new Date().getFullYear()
    },
    additionalText: {
      type: String,
      default: 'Tüm Hakları Saklıdır.'
    }
  },
  
  // Geliştirici Bilgileri
  developerInfo: {
    name: {
      type: String,
      default: 'Erdem Erciyas'
    },
    website: {
      type: String,
      default: 'https://www.erdemerciyas.com.tr'
    },
    companyName: {
      type: String,
      default: 'Erciyas Engineering'
    }
  },
  
  // Görünürlük Ayarları
  visibility: {
    showQuickLinks: {
      type: Boolean,
      default: true
    },
    showSocialLinks: {
      type: Boolean,
      default: true
    },
    showContactInfo: {
      type: Boolean,
      default: true
    },
    showDeveloperInfo: {
      type: Boolean,
      default: true
    }
  },
  
  // Tema Ayarları
  theme: {
    backgroundColor: {
      type: String,
      default: 'bg-slate-800'
    },
    textColor: {
      type: String,
      default: 'text-slate-300'
    },
    accentColor: {
      type: String,
      default: 'text-teal-400'
    }
  }
}, {
  timestamps: true
});

// Tek bir footer ayarı olacağı için singleton pattern
FooterSettingsSchema.statics.getSingleton = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const FooterSettings = (mongoose.models.FooterSettings as IFooterSettingsModel) || mongoose.model<IFooterSettings, IFooterSettingsModel>('FooterSettings', FooterSettingsSchema);

export default FooterSettings; 