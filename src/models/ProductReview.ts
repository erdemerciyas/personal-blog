import mongoose from 'mongoose';

export interface IProductReview {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const productReviewSchema = new mongoose.Schema<IProductReview>({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
}, { timestamps: true });

productReviewSchema.index({ productId: 1, createdAt: -1 });

const ProductReview = mongoose.models.ProductReview || mongoose.model<IProductReview>('ProductReview', productReviewSchema);
export default ProductReview;


