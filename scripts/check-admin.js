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

async function checkAdmin() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Tüm kullanıcıları listele
    const users = await User.find({});
    console.log('👥 Toplam kullanıcı sayısı:', users.length);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Kullanıcı:`, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    });

    // Admin kullanıcısını kontrol et
    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (admin) {
      console.log('\n✅ Admin kullanıcısı bulundu:');
      console.log('📧 Email:', admin.email);
      console.log('👤 İsim:', admin.name);
      console.log('🔑 Role:', admin.role);
      console.log('🕒 Oluşturulma:', admin.createdAt);
      
      // Test şifresi - Environment variable'dan al
      const testPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'SecureAdmin2024!@#';
      const isPasswordValid = await bcrypt.compare(testPassword, admin.password);
      console.log('🔐 Şifre testi:', isPasswordValid ? '✅ Doğru' : '❌ Yanlış');
      
    } else {
      console.log('\n❌ Admin kullanıcısı bulunamadı!');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB bağlantısı kapatıldı');
  }
}

checkAdmin();