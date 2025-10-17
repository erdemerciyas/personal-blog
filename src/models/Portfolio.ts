import mongoose from 'mongoose';
import slugify from 'slugify';

const portfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // Geriye uyumluluk için eski categoryId alanını koruyoruz
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false, // Artık zorunlu değil
  },
  // Yeni çoklu kategori desteği
  categoryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
  }],
  client: {
    type: String,
    required: true,
  },
  completionDate: {
    type: Date,
    required: true,
  },
  technologies: [{
    type: String,
  }],
  coverImage: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
  // 3D Model desteği
  models3D: [{
    url: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      enum: ['stl', 'obj', 'gltf', 'glb'],
      required: true,
    },
    size: {
      type: Number, // bytes
      required: true,
    },
    downloadable: {
      type: Boolean,
      default: false,
    },
    publicId: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  featured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

portfolioSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  
  // updatedAt'i her kaydetmede güncelle
  this.updatedAt = new Date();
  
  next();
});

export default mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema);