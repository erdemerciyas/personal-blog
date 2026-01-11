import mongoose from 'mongoose';

export interface IPluginHook {
  name: string;
  callback: string;
  priority: number;
}

export interface IPluginComponent {
  id: string;
  type: 'widget' | 'shortcode' | 'block';
  component: string;
  name: string;
  description?: string;
}

export interface IPlugin {
  name: string;
  slug: string;
  version: string;
  author: string;
  description: string;
  isActive: boolean;
  type: 'built-in' | 'custom';
  config: Record<string, any>;
  hooks: IPluginHook[];
  components: IPluginComponent[];
  dependencies: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPluginModel extends mongoose.Model<IPlugin> {
  getActivePlugins(): Promise<IPlugin[]>;
  getPluginBySlug(slug: string): Promise<IPlugin | null>;
  getAllPlugins(): Promise<IPlugin[]>;
  togglePlugin(slug: string): Promise<IPlugin>;
}

const PluginSchema = new mongoose.Schema<IPlugin>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    version: {
      type: String,
      required: true,
      default: '1.0.0',
    },
    author: {
      type: String,
      required: true,
      default: 'Fixral',
    },
    description: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    type: {
      type: String,
      required: true,
      enum: ['built-in', 'custom'],
      default: 'built-in',
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    hooks: [
      {
        name: {
          type: String,
          required: true,
        },
        callback: {
          type: String,
          required: true,
        },
        priority: {
          type: Number,
          required: true,
          default: 10,
        },
      },
    ],
    components: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: ['widget', 'shortcode', 'block'],
        },
        component: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: false,
        },
      },
    ],
    dependencies: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PluginSchema.index({ slug: 1 });
PluginSchema.index({ isActive: 1 });
PluginSchema.index({ type: 1 });

// Static methods
PluginSchema.statics.getActivePlugins = async function (): Promise<IPlugin[]> {
  return this.find({ isActive: true }).sort({ name: 1 });
};

PluginSchema.statics.getPluginBySlug = async function (slug: string): Promise<IPlugin | null> {
  return this.findOne({ slug });
};

PluginSchema.statics.getAllPlugins = async function (): Promise<IPlugin[]> {
  return this.find({}).sort({ type: 1, name: 1 });
};

PluginSchema.statics.togglePlugin = async function (slug: string): Promise<IPlugin> {
  const plugin = await this.findOne({ slug });
  if (!plugin) {
    throw new Error('Plugin not found');
  }
  plugin.isActive = !plugin.isActive;
  await plugin.save();
  return plugin;
};

const Plugin = (mongoose.models.Plugin as IPluginModel) || mongoose.model<IPlugin, IPluginModel>('Plugin', PluginSchema);

export default Plugin;
