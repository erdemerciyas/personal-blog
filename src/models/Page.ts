import mongoose, { Schema, Document } from 'mongoose';

export interface IPage extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  publishedAt?: Date;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    title: {
      type: String,
      required: [true, 'Sayfa başlığı gereklidir'],
      trim: true,
      maxlength: [200, 'Başlık 200 karakterden uzun olamaz']
    },
    slug: {
      type: String,
      required: [true, 'Slug gereklidir'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir']
    },
    content: {
      type: String,
      required: [true, 'İçerik gereklidir']
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Özet 500 karakterden uzun olamaz']
    },
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta başlık 60 karakterden uzun olamaz']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta açıklama 160 karakterden uzun olamaz']
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
PageSchema.index({ slug: 1 });
PageSchema.index({ isPublished: 1 });
PageSchema.index({ createdAt: -1 });

// Pre-save middleware to set publishedAt
PageSchema.pre('save', function(next) {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema);
