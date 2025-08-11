import mongoose from 'mongoose';
import slugify from 'slugify';

export interface IProductCategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productCategorySchema = new mongoose.Schema<IProductCategory>({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, trim: true, unique: true, index: true },
  description: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

productCategorySchema.pre('save', function preSave(next) {
  // @ts-expect-error mongoose doc typing
  if (this.isModified('name') || !this.slug) {
    // @ts-expect-error mongoose doc typing
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Indexes for faster lookups
productCategorySchema.index({ isActive: 1, order: 1, name: 1 });

const ProductCategory = mongoose.models.ProductCategory || mongoose.model<IProductCategory>('ProductCategory', productCategorySchema);
export default ProductCategory;


