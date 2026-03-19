import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

/**
 * News Translation Interface
 */
export interface INewsTranslation {
  title?: string;
  content?: string;
  excerpt?: string;
  metaDescription?: string;
  keywords?: string[];
}

/**
 * News Article Document Interface
 */
export interface INews extends Document {
  slug: string;
  status: 'draft' | 'published';
  translations: Map<string, INewsTranslation>;
  featuredImage: {
    url: string;
    altText: string;
    cloudinaryPublicId: string;
  };
  relatedPortfolioIds: mongoose.Types.ObjectId[];
  relatedNewsIds: mongoose.Types.ObjectId[];
  tags: string[];
  author: {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

/**
 * News Schema Definition
 */
const newsSchema = new Schema<INews>(
  {
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    translations: {
      type: Map,
      of: new Schema(
        {
          title:           { type: String },
          content:         { type: String },
          excerpt:         { type: String },
          metaDescription: { type: String },
          keywords:        [{ type: String }],
        },
        { _id: false }
      ),
      default: {},
    },
    featuredImage: {
      url: {
        type: String,
        default: '',
      },
      altText: {
        type: String,
        default: '',
      },
      cloudinaryPublicId: {
        type: String,
        default: '',
      },
    },
    relatedPortfolioIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Portfolio',
      },
    ],
    relatedNewsIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'News',
      },
    ],
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    author: {
      type: {
        id: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: [true, 'Author ID is required'],
        },
        name: {
          type: String,
          required: [true, 'Author name is required'],
        },
        email: {
          type: String,
          required: [true, 'Author email is required'],
        },
      },
      required: [true, 'Author information is required'],
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware to generate slug from any available translation title
 */
newsSchema.pre('save', async function () {
  if (!this.slug) {
    let titleForSlug = '';

    if (this.translations) {
      // Try to find a title from any language
      for (const [, trans] of this.translations) {
        if (trans?.title) {
          titleForSlug = trans.title;
          break;
        }
      }
    }

    if (titleForSlug) {
      const baseSlug = slugify(titleForSlug, {
        lower: true,
        strict: true,
        replacement: '-',
      });
      this.slug = `${baseSlug}-${Date.now()}`;
    } else {
      this.slug = `news-${Date.now()}`;
    }
  }

  // Update publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

/**
 * Index definitions for performance
 */
newsSchema.index({ slug: 1 });
newsSchema.index({ status: 1, publishedAt: -1 });
newsSchema.index({ createdAt: -1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ 'author.id': 1 });

/**
 * Instance method to get translated content
 */
newsSchema.methods.getTranslation = function (language: string) {
  return this.translations?.get(language);
};

/**
 * Instance method to check if article is published
 */
newsSchema.methods.isPublished = function () {
  return this.status === 'published';
};

/**
 * Static method to find published articles
 */
newsSchema.statics.findPublished = function () {
  return this.find({ status: 'published' });
};

/**
 * Static method to find by slug
 */
newsSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug });
};

/**
 * Export News model
 */
export default mongoose.models.News || mongoose.model<INews>('News', newsSchema);
