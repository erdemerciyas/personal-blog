import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'E-posta adresi gereklidir'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Geçerli bir e-posta adresi giriniz'
    }
  },
  phone: {
    type: String,
    required: [true, 'Telefon numarası gereklidir'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Adres gereklidir'],
    trim: true,
  },
  workingHours: {
    type: String,
    default: 'Pazartesi - Cuma: 09:00 - 18:00',
    trim: true,
  },
  socialLinks: {
    linkedin: { 
      type: String, 
      default: '',
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'LinkedIn URL geçerli bir URL olmalıdır'
      }
    },
    twitter: { 
      type: String, 
      default: '',
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Twitter URL geçerli bir URL olmalıdır'
      }
    },
    instagram: { 
      type: String, 
      default: '',
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Instagram URL geçerli bir URL olmalıdır'
      }
    },
    facebook: { 
      type: String, 
      default: '',
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Facebook URL geçerli bir URL olmalıdır'
      }
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for better performance
ContactSchema.index({ isActive: 1 });

// Pre-save middleware to update updatedAt
ContactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

ContactSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema); 