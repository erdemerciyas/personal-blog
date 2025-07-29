'use client';
import { useState, useEffect, Suspense } from 'react';
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
  MoonIcon
} from '@heroicons/react/24/outline';

function LoginForm() {
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

      // İlk önce redirect: false ile dene
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: '/admin/dashboard'
      });

      console.log('🔐 Login result:', result);

      if (result?.error) {
        console.error('❌ Login error:', result.error);
        setError('Geçersiz email veya şifre.');
      } else if (result?.ok) {
        console.log('✅ Login successful, redirecting...');
        // Başarılı login sonrası window.location ile redirect
        window.location.href = '/admin/dashboard';
        return; // Function'dan çık
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
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300 ${
      darkMode ? 'dark bg-slate-900' : 'bg-slate-50'
    }`}>
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-6 right-6 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 z-10"
        title={darkMode ? 'Light moda geç' : 'Dark moda geç'}
      >
        {darkMode ? (
          <SunIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        ) : (
          <MoonIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        )}
      </button>

      <div className="max-w-md w-full">

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
            <CubeTransparentIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Admin Panel</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Yönetim paneline hoş geldiniz
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl pl-12 pr-12 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
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
              className={`w-full flex items-center justify-center space-x-3 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${loading
                ? 'cursor-not-allowed bg-teal-400 text-white opacity-50'
                : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md'
                }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
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
              className="text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-sm font-medium"
            >
              Şifremi unuttum
            </button>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl max-w-md w-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl mb-4">
                  <EnvelopeIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Şifremi Unuttum</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Email adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz</p>
              </div>

              {/* Success Message */}
              {forgotPasswordMessage && (
                <div className="mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-xl flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{forgotPasswordMessage}</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-center space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="forgotEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
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
                    className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${forgotPasswordLoading
                      ? 'bg-teal-400 cursor-not-allowed text-white opacity-50'
                      : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md'
                      }`}
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
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
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} Erciyas Engineering. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Giriş sayfası yükleniyor...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 