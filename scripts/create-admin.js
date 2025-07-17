const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB bağlantı URL'si
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-blog';

// User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Mevcut admin kullanıcısını kontrol et
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin kullanıcısı zaten mevcut:', existingAdmin.email);
      process.exit(0);
    }

    // Admin kullanıcısı bilgileri
    const adminData = {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123456', // Bu şifreyi değiştirin!
      role: 'admin'
    };

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Admin kullanıcısını oluştur
    const admin = new User({
      ...adminData,
      password: hashedPassword
    });

    await admin.save();
    
    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Şifre:', adminData.password);
    console.log('⚠️  Güvenlik için şifreyi değiştirmeyi unutmayın!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

createAdmin();