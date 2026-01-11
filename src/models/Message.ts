import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  projectType: {
    type: String,
    enum: ['3d-design', 'reverse-engineering', '3d-printing', 'cad-design', 'consulting', 'other'],
    default: 'other',
  },
  budget: {
    type: String,
    enum: ['under-5k', '5k-15k', '15k-50k', '50k-100k', 'above-100k', 'not-specified'],
    default: 'not-specified',
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  type: {
    type: String,
    enum: ['contact', 'product_question', 'service_request'],
    default: 'contact',
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  productName: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  adminNotes: {
    type: String,
    default: '',
  },
  readAt: {
    type: Date,
  },
  repliedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema); 