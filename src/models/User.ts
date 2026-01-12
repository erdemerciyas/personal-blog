import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'user';
  isActive: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  twoFactorSecret?: string;
  isTwoFactorEnabled?: boolean;
  twoFactorBackupCodes?: string[];
  avatar?: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'İsim gerekli'],
    },
    email: {
      type: String,
      required: [true, 'Email gerekli'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Şifre gerekli'],
      minlength: [6, 'Şifre en az 6 karakter olmalı'],
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'user'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationCode: {
      type: String,
      required: false,
    },
    verificationCodeExpiry: {
      type: Date,
      required: false,
    },
    resetToken: {
      type: String,
      required: false,
    },
    resetTokenExpiry: {
      type: Date,
      required: false,
    },
    twoFactorSecret: {
      type: String,
      required: false,
      select: false, // Include only when explicitly selected
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorBackupCodes: {
      type: [String],
      required: false,
      select: false,
    },
    avatar: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Şifreyi hashle
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    next(error instanceof Error ? error : new Error('Unknown error'));
  }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Güvenlik için şifreyi JSON'da gösterme
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetToken;
  delete userObject.resetTokenExpiry;
  delete userObject.verificationCode;
  delete userObject.verificationCodeExpiry;
  return userObject;
};

// Şifre geçmişi kontrolü için (opsiyonel)
userSchema.methods.isPasswordReused = async function (newPassword: string): Promise<boolean> {
  // Bu örnekte sadece mevcut şifre ile karşılaştırıyoruz
  // Gerçek uygulamada son 5-10 şifreyi saklayabilirsiniz
  return bcrypt.compare(newPassword, this.password);
};

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; 