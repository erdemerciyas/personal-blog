# 🧩 Admin Panel Tasarımı: Sneat MUI Next.js Admin Template

Bu dokümantasyon, **Sneat - MUI Next.js Admin Template** teması baz alınarak hazırlanmıştır. Geliştirici AI sistemlerinde, modern ve kullanıcı dostu bir yönetim paneli oluşturmak isteyenler için referans niteliğindedir.

---

## 📌 Genel Özellikler

| Özellik             | Açıklama                                                  |
| ------------------- | --------------------------------------------------------- |
| **Teknoloji Stack** | Next.js 14, TypeScript, Material UI, Chart.js, ApexCharts |
| **Tema Stili**      | Dark Mode, Light Mode, Soft Gradientler, Modern UI        |
| **Sayfa Düzeni**    | Responsive, Grid Bazlı, Modüler Kartlar                   |
| **Performans**      | SSR (Server-Side Rendering) & Lazy Load bileşen desteği   |

---

## 🔐 Admin Login Sayfası Tasarımı

### 🎨 Modern Login UI/UX Özellikleri

- **Glassmorphism Efekti**: Şeffaf arka plan ve blur efektleri
- **Gradient Arka Planlar**: Yumuşak geçişli renk tonları
- **Responsive Tasarım**: Mobil ve desktop uyumlu
- **Animasyonlu Geçişler**: Smooth hover ve focus efektleri
- **Dark/Light Mode Desteği**: Tema değiştirme özelliği
- **Form Validasyonu**: Real-time hata mesajları
- **Loading States**: Kullanıcı deneyimi için yükleme durumları

### 🎯 Login Sayfası Bileşenleri

#### 1. Ana Container
```tsx
// Gradient arka plan ve merkezi hizalama
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
```

#### 2. Logo ve Başlık Alanı
```tsx
<div className="text-center mb-8">
  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl mb-6">
    <CubeTransparentIcon className="w-8 h-8 text-white" />
  </div>
  <h1 className="text-3xl font-bold text-white mb-2">Admin Girişi</h1>
  <p className="text-slate-400">Yönetim paneline erişim için giriş yapın</p>
</div>
```

#### 3. Glassmorphism Login Kartı
```tsx
<div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
```

#### 4. Form Input Alanları
```tsx
// Email Input
<div className="relative">
  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
    <UserIcon className="h-5 w-5 text-slate-400" />
  </div>
  <input
    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
    placeholder="admin@example.com"
  />
</div>
```

#### 5. Animasyonlu Submit Button
```tsx
<button className="w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl transform transition-all duration-200">
  <span>Giriş Yap</span>
  <ArrowRightIcon className="w-5 h-5" />
</button>
```

### 🎨 Yeni Modern Login Sayfası Tasarımı

#### 🌟 Sneat MUI Inspired Login Component

```tsx
'use client';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login,
  AdminPanelSettings,
  Brightness4,
  Brightness7
} from '@mui/icons-material';

export default function ModernLoginPage() {
  const theme = useTheme();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Geçersiz email veya şifre');
      } else if (result?.ok) {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      setError('Giriş yaparken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: darkMode 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative'
      }}
    >
      {/* Theme Toggle */}
      <IconButton
        onClick={() => setDarkMode(!darkMode)}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          backgroundColor: alpha('#fff', 0.1),
          backdropFilter: 'blur(10px)',
          '&:hover': {
            backgroundColor: alpha('#fff', 0.2),
          }
        }}
      >
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>

      {/* Login Card */}
      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          backgroundColor: alpha('#fff', darkMode ? 0.05 : 0.1),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha('#fff', 0.2)}`,
          borderRadius: 4,
          boxShadow: darkMode 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <CardContent sx={{ p: 5 }}>
          {/* Logo & Title */}
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color={darkMode ? 'white' : 'white'}
              mb={1}
            >
              Admin Panel
            </Typography>
            
            <Typography 
              variant="body2" 
              color={alpha('#fff', 0.7)}
            >
              Yönetim paneline hoş geldiniz
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                backgroundColor: alpha('#f44336', 0.1),
                color: '#f44336',
                border: `1px solid ${alpha('#f44336', 0.3)}`,
                '& .MuiAlert-icon': {
                  color: '#f44336'
                }
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Adresi"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: alpha('#fff', 0.05),
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: alpha('#fff', 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#fff', 0.3),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: alpha('#fff', 0.7),
                },
                '& .MuiOutlinedInput-input': {
                  color: 'white',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: alpha('#fff', 0.5) }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Şifre"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: alpha('#fff', 0.05),
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: alpha('#fff', 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#fff', 0.3),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: alpha('#fff', 0.7),
                },
                '& .MuiOutlinedInput-input': {
                  color: 'white',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: alpha('#fff', 0.5) }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: alpha('#fff', 0.5) }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)',
                },
                '&:disabled': {
                  background: alpha('#667eea', 0.5),
                },
                transition: 'all 0.3s ease',
              }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Login />}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </Box>

          <Divider sx={{ my: 3, borderColor: alpha('#fff', 0.1) }} />

          {/* Footer */}
          <Typography 
            variant="caption" 
            color={alpha('#fff', 0.5)} 
            textAlign="center" 
            display="block"
          >
            © 2025 Admin Panel. Tüm hakları saklıdır.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
```

### 🎨 Yeni Login Sayfası Özellikleri

#### ✨ Görsel Özellikler
- **Dinamik Arka Plan**: Dark/Light mode'a göre değişen gradient arka planlar
- **Animasyonlu Elementler**: Pulse ve spin animasyonları ile canlı görünüm
- **Glassmorphism Efekti**: Şeffaf kartlar ve blur efektleri
- **Hover Animasyonları**: Butonlarda scale ve shadow efektleri
- **Responsive Tasarım**: Mobil ve desktop uyumlu

#### 🎯 Kullanıcı Deneyimi
- **Dark/Light Mode Toggle**: Sağ üst köşede tema değiştirme butonu
- **Real-time Validasyon**: Form alanlarında anlık hata temizleme
- **Loading States**: Giriş sırasında yükleme durumu gösterimi
- **Şifre Görünürlük**: Şifre alanında göster/gizle özelliği
- **Şifremi Unuttum**: Modal ile şifre sıfırlama özelliği

#### 🎨 Renk Paleti

| Mod | Ana Renk | İkincil Renk | Arka Plan |
|-----|----------|--------------|-----------|
| **Dark** | Teal (#14b8a6) | Blue (#3b82f6) | Slate Gradient |
| **Light** | Indigo (#6366f1) | Purple (#8b5cf6) | Colorful Gradient |

#### 🔧 Teknik Özellikler
- **TypeScript**: Tam tip güvenliği
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Modern SVG ikonlar
- **Next.js 14**: Server-side rendering
- **NextAuth.js**: Güvenli authentication

### 🎨 UI/UX Stil Rehberi

#### 🎭 Tema Sistemi
```tsx
// Dark Mode State Management
const [darkMode, setDarkMode] = useState(false);

// Theme Toggle Function
const toggleDarkMode = () => {
  const newDarkMode = !darkMode;
  setDarkMode(newDarkMode);
  localStorage.setItem('admin-login-theme', newDarkMode ? 'dark' : 'light');
};
```

#### 🌈 Gradient Arka Planlar
```tsx
// Dark Mode Gradient
className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"

// Light Mode Gradient  
className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500"
```

#### ✨ Animasyonlu Elementler
```tsx
// Pulse Animation
<div className="w-80 h-80 rounded-full opacity-20 animate-pulse bg-teal-500"></div>

// Spin Animation (20s duration)
<div className="w-96 h-96 rounded-full opacity-10 animate-spin bg-gradient-to-r from-teal-500 to-blue-500" 
     style={{ animationDuration: '20s' }}></div>
```

#### 🎯 Interactive Buttons
```tsx
// Theme Toggle Button
<button className="p-3 rounded-full backdrop-blur-xl border transition-all duration-300 hover:scale-110 bg-white/10 border-white/20 text-white hover:bg-white/20">

// Submit Button with Hover Effects
<button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl transform transition-all duration-200">
```

### 🎨 Gelişmiş UI Bileşenleri

#### 🎯 Form Input Alanları
```tsx
// Modern Input Field with Icon
<div className="relative">
  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
    <UserIcon className="h-5 w-5 text-slate-400" />
  </div>
  <input
    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
    placeholder="admin@example.com"
  />
</div>
```

#### 🔘 Modern Button Tasarımları
```tsx
// Primary Gradient Button
<button className="w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl transform transition-all duration-200">
  <span>Giriş Yap</span>
  <ArrowRightIcon className="w-5 h-5" />
</button>

// Secondary Glass Button
<button className="flex-1 py-3 px-4 bg-white/5 border border-white/20 rounded-xl text-slate-300 hover:bg-white/10 transition-colors">
  İptal
</button>
```

#### 🎨 Glassmorphism Kartlar
```tsx
// Main Login Card
<div className="backdrop-blur-2xl rounded-3xl p-8 border shadow-2xl transform hover:scale-[1.02] transition-all duration-500 bg-white/5 border-white/10">

// Modal Card
<div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 max-w-md w-full">
```

#### ⚠️ Alert ve Mesaj Bileşenleri
```tsx
// Error Alert
<div className="bg-red-500/10 border-red-500/30 text-red-300 p-4 rounded-2xl flex items-center space-x-3">
  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
  <span className="text-sm font-medium">{error}</span>
</div>

// Success Alert
<div className="bg-green-500/10 border border-green-500/30 text-green-300 p-4 rounded-2xl flex items-center space-x-3">
  <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
  <span className="text-sm">{message}</span>
</div>
```

### 🎭 Animasyon ve Efektler

#### ✨ CSS Animasyonları
```css
/* Shake Animation for Errors */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* Pulse Animation */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Custom Spin Duration */
.animate-spin-slow {
  animation: spin 20s linear infinite;
}
```

#### 🎯 Hover Efektleri
```tsx
// Scale on Hover
className="transform hover:scale-105 transition-all duration-300"

// Shadow on Hover
className="hover:shadow-xl transition-all duration-200"

// Color Change on Hover
className="text-slate-400 hover:text-white transition-colors"
```

### 🎨 Responsive Tasarım

#### 📱 Mobil Uyumluluk
```tsx
// Responsive Container
<div className="max-w-md w-full relative z-10">

// Responsive Padding
<div className="px-4 sm:px-6 lg:px-8">

// Responsive Text Sizes
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
```

#### 🖥️ Desktop Optimizasyonu
```tsx
// Large Screen Adjustments
<div className="hidden lg:block">
  {/* Desktop only content */}
</div>

// Responsive Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### 🔧 Kullanım Kılavuzu

#### 1. Tema Kurulumu
```bash
# Gerekli bağımlılıkları yükleyin
npm install @heroicons/react tailwindcss

# Tailwind CSS konfigürasyonunu güncelleyin
# tailwind.config.js dosyasına dark mode desteği ekleyin
```

#### 2. Login Sayfası Entegrasyonu
```tsx
// pages/admin/login.tsx veya app/admin/login/page.tsx
import LoginPage from './LoginPage';

export default function AdminLogin() {
  return <LoginPage />;
}
```

#### 3. Tema Yönetimi
```tsx
// Theme Context Provider
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  
  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 🎯 En İyi Uygulamalar

#### ✅ Yapılması Gerekenler
- **Responsive tasarım** kullanın
- **Accessibility** standartlarına uyun
- **Loading states** ekleyin
- **Error handling** yapın
- **Form validation** uygulayın

#### ❌ Yapılmaması Gerekenler
- Çok fazla animasyon kullanmayın
- Kontrast oranlarını ihmal etmeyin
- Mobile deneyimi göz ardı etmeyin
- Performansı düşürecek efektler eklemeyin

### 🚀 Gelecek Geliştirmeler

#### 🔮 Planlanan Özellikler
- **Biometric Authentication** (Touch ID, Face ID)
- **Multi-factor Authentication** (2FA)
- **Social Login** (Google, GitHub)
- **Progressive Web App** desteği
- **Offline Mode** özelliği

#### 🎨 UI/UX İyileştirmeleri
- **Micro-interactions** ekleme
- **Advanced animations** geliştirme
- **Custom themes** oluşturma
- **Accessibility** iyileştirmeleri

---

## 📚 Sonuç

Bu modern admin login sayfası tasarımı, **Sneat MUI Next.js Admin Template** temasından ilham alınarak oluşturulmuştur. Glassmorphism efektleri, gradient arka planlar, smooth animasyonlar ve responsive tasarım ile modern bir kullanıcı deneyimi sunar.

### 🎯 Temel Özellikler
- ✅ Dark/Light mode desteği
- ✅ Glassmorphism tasarım
- ✅ Responsive layout
- ✅ Smooth animations
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Accessibility uyumlu

Bu tasarım, modern web standartlarına uygun olarak geliştirilmiş ve kullanıcı deneyimini ön planda tutarak tasarlanmıştır.

### 🧪 Örnek ThemeProvider ve useTheme Hook

``

```tsx
'use client';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useEffect, useState, ReactNode } from 'react';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('theme')) as 'light' | 'dark' || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#7367f0' },
      secondary: { main: '#82868b' },
    },
    typography: {
      fontFamily: 'Inter, Roboto, sans-serif',
    },
  });

  return <MuiThemeProvider theme={theme}><CssBaseline />{children}</MuiThemeProvider>;
};
```

``

```tsx
'use client';
import { useState, useEffect } from 'react';

export function useThemeMode() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark';
    if (stored) setMode(stored);
  }, []);

  const toggle = () => {
    setMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newMode);
      return newMode;
    });
  };

  return { mode, toggle };
}
```

### 🌘 Dark/Light Toggle Bileşeni

``

```tsx
'use client';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '@/hooks/useThemeMode';

export const ThemeToggle = () => {
  const { mode, toggle } = useThemeMode();
  return (
    <IconButton onClick={toggle} aria-label='Tema Değiştir'>
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};
```

---

## 🧪 Storybook Entegrasyonu

### 🔧 Kurulum

```bash
npx storybook@latest init --builder webpack5 --type react
```

### 📁 Önerilen Yapı

```
src/components/
  ThemeToggle/
    ThemeToggle.tsx
    ThemeToggle.stories.tsx
```

### 📝 Örnek Storybook Dosyası

``

```tsx
import { ThemeToggle } from './ThemeToggle';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ThemeToggle> = {
  component: ThemeToggle,
  title: 'Components/ThemeToggle',
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {
  render: () => <ThemeToggle />,
};
```

### 🔄 Storybook Başlatma

```bash
npm run storybook
```

