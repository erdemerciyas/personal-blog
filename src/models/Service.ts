import mongoose from 'mongoose';

export interface IService {
  _id: string;
  title: string;
  description: string;
  features?: string[];
  image: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new mongoose.Schema<IService>(
  {
    title: {
      type: String,
      required: [true, 'Başlık gerekli'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Açıklama gerekli'],
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      required: [true, 'Görsel URL gerekli'],
    },
    icon: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.models.Service || mongoose.model<IService>('Service', serviceSchema);

export default Service; 