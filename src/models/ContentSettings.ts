import mongoose from 'mongoose';

interface IContentSettings {
  homePage: {
    title: string;
    subtitle: string;
    description: string;
  };
  aboutPage: {
    title: string;
    content: string;
  };
  contactPage: {
    title: string;
    description: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface IContentSettingsModel extends mongoose.Model<IContentSettings> {
  getContentSettings(): Promise<IContentSettings>;
  updateContentSettings(updateData: Partial<IContentSettings>): Promise<IContentSettings>;
}

const ContentSettingsSchema = new mongoose.Schema<IContentSettings>({
  homePage: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  },
  aboutPage: {
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    }
  },
  contactPage: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Singleton pattern - tek bir content settings kaydı
ContentSettingsSchema.statics.getContentSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    settings = await this.create({
      homePage: { title: '', subtitle: '', description: '' },
      aboutPage: { title: '', content: '' },
      contactPage: { title: '', description: '' }
    });
  }
  
  return settings;
};

ContentSettingsSchema.statics.updateContentSettings = async function(updateData: Partial<IContentSettings>) {
  let settings = await this.findOne();
  
  if (!settings) {
    settings = await this.create(updateData);
  } else {
    Object.assign(settings, updateData);
    await settings.save();
  }
  
  return settings;
};

const ContentSettings = (mongoose.models.ContentSettings as IContentSettingsModel) || 
  mongoose.model<IContentSettings, IContentSettingsModel>('ContentSettings', ContentSettingsSchema);

export default ContentSettings;
export type { IContentSettings };