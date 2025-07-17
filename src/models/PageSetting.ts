import mongoose from 'mongoose';

const PageSettingSchema = new mongoose.Schema({
  pageId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  showInNavigation: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.PageSetting || mongoose.model('PageSetting', PageSettingSchema);