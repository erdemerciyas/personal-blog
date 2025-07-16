'use client';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  LockClosedIcon,
  CubeTransparentIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);

  // Dark mode initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-login-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('admin-login-theme', newDarkMode ? 'dark' : 'light');
  };

  useEffect(() => {
    if (!searchParams) return;
    
    const errorMessage = searchParams.get('error');
    if (errorMessage) {
      switch (errorMessage) {
        case 'CredentialsSignin':
          setError('Geçersiz email veya şifre.');
          break;
        default:
          setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      console.log('🔐 Login attempt:', { 
        email: formData.email, 
        passwordLength: formData.password.length,
        currentUrl: window.location.href,
        nextAuthUrl: window.location.origin 
      });
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: '/admin/dashboard'
      });

      console.log('🔐 Login result:', result);

      if (result?.error) {
        console.error('❌ Login error:', result.error);
        setError(`Giriş hatası: ${result.error}`);
      } else if (result?.ok) {
        console.log('✅ Login successful, redirecting...');
        // Next.js router ile yönlendirme
        router.push('/admin/dashboard');
      } else {
        console.error('❌ Unexpected login result:', result);
        setError('Beklenmeyen bir hata oluştu.');
      }
    } catch (error) {
      console.error('❌ Login exception:', error);
      setError('Giriş yaparken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!forgotPasswordEmail) {
      setError('Lütfen email adresinizi girin');
      return;
    }

    setError(null);
    setForgotPasswordMessage(null);
    setForgotPasswordLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordMessage(data.message);
        setForgotPasswordEmail('');
      } else {
        setError(data.error || 'Şifre sıfırlama talebinde bir hata oluştu');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500'
    } flex items-center justify-center px-4 relative overflow-hidden`}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse ${
          darkMode ? 'bg-teal-500' : 'bg-white'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 animate-pulse delay-1000 ${
          darkMode ? 'bg-blue-500' : 'bg-white'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 animate-spin ${
          darkMode ? 'bg-gradient-to-r from-teal-500 to-blue-500' : 'bg-white'
        }`} style={{ animationDuration: '20s' }}></div>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-xl border transition-all duration-300 hover:scale-110 ${
          darkMode 
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
            : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
        }`}
      >
        {darkMode ? (
          <SunIcon className="w-6 h-6" />
        ) : (
          <MoonIcon className="w-6 h-6" />
        )}
      </button>

      <div className="max-w-md w-full relative z-10">
        
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-teal-500 to-blue-600' 
              : 'bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl border border-white/30'
          }`}>
            {darkMode ? (
              <CubeTransparentIcon className="w-10 h-10 text-white" />
            ) : (
              <SparklesIcon className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Admin Panel</h1>
          <p className={`${darkMode ? 'text-slate-400' : 'text-white/80'} text-lg`}>
            Yönetim paneline hoş geldiniz
          </p>
        </div>

        {/* Login Card */}
        <div className={`backdrop-blur-2xl rounded-3xl p-8 border shadow-2xl transform hover:scale-[1.02] transition-all duration-500 ${
          darkMode 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white/10 border-white/20'
        }`}>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 animate-shake">
              <div className={`border p-4 rounded-2xl flex items-center space-x-3 ${
                darkMode 
                  ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                  : 'bg-red-500/20 border-red-500/40 text-red-100'
              }`}>
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-200">
                Email Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-200">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-12 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                loading
                  ? `cursor-not-allowed ${
                      darkMode 
                        ? 'bg-teal-600/30 text-teal-300' 
                        : 'bg-white/20 text-white/60'
                    }`
                  : `transform hover:scale-105 hover:shadow-2xl ${
                      darkMode 
                        ? 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white' 
                        : 'bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl border border-white/30 hover:bg-white/30 text-white'
                    }`
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Şifremi unuttum
            </button>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl mb-4">
                  <EnvelopeIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Şifremi Unuttum</h2>
                <p className="text-slate-400 text-sm">Email adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz</p>
              </div>

              {/* Success Message */}
              {forgotPasswordMessage && (
                <div className="mb-6">
                  <div className="bg-green-500/10 border border-green-500/30 text-green-300 p-4 rounded-2xl flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{forgotPasswordMessage}</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6">
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl flex items-center space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="forgotEmail" className="block text-sm font-semibold text-slate-200">
                    Email Adresi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="forgotEmail"
                      name="forgotEmail"
                      type="email"
                      autoComplete="email"
                      required
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError(null);
                      setForgotPasswordMessage(null);
                      setForgotPasswordEmail('');
                    }}
                    className="flex-1 py-3 px-4 bg-white/5 border border-white/20 rounded-xl text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      forgotPasswordLoading
                        ? 'bg-teal-600/50 cursor-not-allowed text-teal-200'
                        : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white'
                    }`}
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <span>Gönderiliyor...</span>
                      </>
                    ) : (
                      <span>Gönder</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            © 2025 Erciyas Engineering. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
} 