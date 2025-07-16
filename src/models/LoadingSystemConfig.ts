import mongoose from 'mongoose';

interface IPageConfig {
  enabled: boolean;
  loadingText: string;
  customClass?: string;
  installed: boolean;
}

interface ILoadingSystemConfig {
  globalEnabled: boolean;
  systemInstalled: boolean;
  pages: {
    [key: string]: IPageConfig;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PageConfigSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: true
  },
  loadingText: {
    type: String,
    required: true
  },
  customClass: {
    type: String,
    default: ''
  },
  installed: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const LoadingSystemConfigSchema = new mongoose.Schema<ILoadingSystemConfig>({
  globalEnabled: {
    type: Boolean,
    default: true,
    required: true
  },
  systemInstalled: {
    type: Boolean,
    default: true,
    required: true
  },
  pages: {
    type: Map,
    of: PageConfigSchema,
    default: new Map()
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'loading_system_configs'
});

// Ensure only one config document exists
LoadingSystemConfigSchema.index({}, { unique: true });

export default mongoose.models.LoadingSystemConfig || 
  mongoose.model<ILoadingSystemConfig>('LoadingSystemConfig', LoadingSystemConfigSchema);