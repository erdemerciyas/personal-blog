import mongoose from 'mongoose';

export interface IPageTemplate {
  pageId: string;
  pageType: 'home' | 'page' | 'blog' | 'single' | 'portfolio' | 'services' | 'contact' | 'custom';
  templateId: string;
  customSettings: Record<string, any>;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPageTemplateModel extends mongoose.Model<IPageTemplate> {
  getTemplateForPage(pageId: string): Promise<IPageTemplate | null>;
  setTemplateForPage(pageId: string, templateId: string, customSettings?: Record<string, any>): Promise<IPageTemplate>;
  getAllPageTemplates(): Promise<IPageTemplate[]>;
}

const PageTemplateSchema = new mongoose.Schema<IPageTemplate>(
  {
    pageId: {
      type: String,
      required: true,
      trim: true,
    },
    pageType: {
      type: String,
      required: true,
      enum: ['home', 'page', 'blog', 'single', 'portfolio', 'services', 'contact', 'custom'],
      default: 'page',
    },
    templateId: {
      type: String,
      required: true,
      trim: true,
    },
    customSettings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PageTemplateSchema.index({ pageId: 1 });
PageTemplateSchema.index({ templateId: 1 });
PageTemplateSchema.index({ pageType: 1 });
PageTemplateSchema.index({ isActive: 1 });

// Static methods
PageTemplateSchema.statics.getTemplateForPage = async function (pageId: string): Promise<IPageTemplate | null> {
  return this.findOne({ pageId, isActive: true });
};

PageTemplateSchema.statics.setTemplateForPage = async function (
  pageId: string,
  templateId: string,
  customSettings: Record<string, any> = {}
): Promise<IPageTemplate> {
  const existing = await this.findOne({ pageId });
  
  if (existing) {
    existing.templateId = templateId;
    existing.customSettings = customSettings;
    await existing.save();
    return existing;
  }
  
  return this.create({
    pageId,
    templateId,
    customSettings,
  });
};

PageTemplateSchema.statics.getAllPageTemplates = async function (): Promise<IPageTemplate[]> {
  return this.find({ isActive: true }).sort({ pageType: 1, pageId: 1 });
};

const PageTemplate = (mongoose.models.PageTemplate as IPageTemplateModel) ||
  mongoose.model<IPageTemplate, IPageTemplateModel>('PageTemplate', PageTemplateSchema);

export default PageTemplate;
