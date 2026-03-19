import mongoose from 'mongoose';

export interface ILanguage {
  _id: string;
  code: string;          // 'tr', 'es', 'en' ...
  label: string;         // 'Türkçe', 'Español', 'English'
  nativeLabel: string;   // 'Türkçe', 'Español', 'English' (native name)
  flag: string;          // emoji: '🇹🇷'
  isDefault: boolean;
  isActive: boolean;
  direction: 'ltr' | 'rtl';
  createdAt: Date;
  updatedAt: Date;
}

const languageSchema = new mongoose.Schema<ILanguage>(
  {
    code: {
      type: String,
      required: [true, 'Dil kodu zorunludur.'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 10,
    },
    label: {
      type: String,
      required: [true, 'Dil adı zorunludur.'],
      trim: true,
    },
    nativeLabel: {
      type: String,
      required: [true, 'Yerel dil adı zorunludur.'],
      trim: true,
    },
    flag: {
      type: String,
      default: '🌐',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    direction: {
      type: String,
      enum: ['ltr', 'rtl'],
      default: 'ltr',
    },
  },
  { timestamps: true }
);

// Sadece bir dil varsayılan olabilir
languageSchema.pre('save', async function () {
  if (this.isModified('isDefault') && this.isDefault) {
    await mongoose.models.Language?.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
});

export default mongoose.models.Language ||
  mongoose.model<ILanguage>('Language', languageSchema);
