import mongoose, { type Document } from 'mongoose';
import slugify from 'slugify';

type AllowedAttachmentType = 'image' | 'pdf' | 'docx' | 'xlsx' | 'csv' | 'raw';

interface Attachment {
  url: string;
  type: AllowedAttachmentType;
  name?: string;
  size?: number;
}

interface AttributeKV {
  key: string;
  value: string;
}

export interface IProduct {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  condition: 'new' | 'used';
  price?: number;
  currency?: string;
  coverImage: string;
  images: string[];
  attachments: Attachment[];
  categoryIds: mongoose.Types.ObjectId[]; // ProductCategory refs
  stock: number;
  colors: string[];
  sizes: string[];
  attributes: AttributeKV[];
  ratingAverage: number;
  ratingCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new mongoose.Schema<Attachment>({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'pdf', 'docx', 'xlsx', 'csv', 'raw'], required: true },
  name: { type: String },
  size: { type: Number }
}, { _id: false });

const attributeSchema = new mongoose.Schema<AttributeKV>({
  key: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true }
}, { _id: false });

const productSchema = new mongoose.Schema<IProduct>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  condition: { type: String, enum: ['new', 'used'], required: true, default: 'new' },
  price: { type: Number },
  currency: { type: String, default: 'TRY' },

  coverImage: { type: String, required: true },
  images: [{ type: String }],
  attachments: [attachmentSchema],

  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' }],

  stock: { type: Number, default: 0 },
  colors: [{ type: String }],
  sizes: [{ type: String }],
  attributes: [attributeSchema],

  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.pre('validate', async function (this: Document & Partial<IProduct>) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(String(this.title), { lower: true, strict: true });
  }
});

productSchema.index({ title: 'text', description: 'text' });
// Query performance indexes
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, categoryIds: 1, price: 1 });
productSchema.index({ isActive: 1, ratingAverage: -1 });

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
export default Product;


