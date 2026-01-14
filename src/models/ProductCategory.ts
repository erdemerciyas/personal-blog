import mongoose, { type Document } from 'mongoose';
import slugify from 'slugify';

export interface IProductCategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  parent?: mongoose.Types.ObjectId | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productCategorySchema = new mongoose.Schema<IProductCategory>({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, trim: true, unique: true, index: true },
  description: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', default: null },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

productCategorySchema.pre('save', async function (this: Document & Partial<IProductCategory>) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(String(this.name), { lower: true, strict: true });
  }
});

// Indexes for faster lookups
productCategorySchema.index({ isActive: 1, order: 1, name: 1 });

const ProductCategory = mongoose.models.ProductCategory || mongoose.model<IProductCategory>('ProductCategory', productCategorySchema);
export default ProductCategory;


