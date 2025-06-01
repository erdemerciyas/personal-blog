'use client';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  LockClosedIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ShieldExclamationIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface SecurityQuestion {
  question: string;
  type: 'math' | 'trivia';
  hash: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState<SecurityQuestion | null>(null);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    const errorMessage = searchParams.get('error');
    if (errorMessage) {
      switch (errorMessage) {
        case 'CredentialsSignin':
          setError('Geçersiz email veya şifre.');
          handleFailedAttempt();
          break;
        case 'SecurityVerificationFailed':
          setError('Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.');
          break;
        default:
          setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }

    // Check if user is blocked
    const blockedUntil = localStorage.getItem('loginBlockedUntil');
    if (blockedUntil) {
      const blockTime = parseInt(blockedUntil);
      const now = Date.now();
      if (now < blockTime) {
        setIsBlocked(true);
        setBlockTimeLeft(Math.ceil((blockTime - now) / 1000));
        startBlockTimer(blockTime);
      } else {
        localStorage.removeItem('loginBlockedUntil');
        localStorage.removeItem('loginAttempts');
      }
    }

    // Restore attempt count
    const attempts = localStorage.getItem('loginAttempts');
    if (attempts) {
      setAttemptCount(parseInt(attempts));
    }

    // Load initial security question
    if (!isBlocked) {
      loadSecurityQuestion();
    }
  }, [searchParams]);

  const startBlockTimer = (blockUntil: number) => {
    const timer = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.ceil((blockUntil - now) / 1000);
      
      if (timeLeft <= 0) {
        setIsBlocked(false);
        setBlockTimeLeft(0);
        localStorage.removeItem('loginBlockedUntil');
        localStorage.removeItem('loginAttempts');
        setAttemptCount(0);
        loadSecurityQuestion(); // Load new question when unblocked
        clearInterval(timer);
      } else {
        setBlockTimeLeft(timeLeft);
      }
    }, 1000);
  };

  const handleFailedAttempt = () => {
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);
    localStorage.setItem('loginAttempts', newAttemptCount.toString());

    // Block after 3 failed attempts
    if (newAttemptCount >= 3) {
      const blockDuration = 5 * 60 * 1000; // 5 minutes
      const blockUntil = Date.now() + blockDuration;
      
      localStorage.setItem('loginBlockedUntil', blockUntil.toString());
      setIsBlocked(true);
      setBlockTimeLeft(300); // 5 minutes in seconds
      startBlockTimer(blockUntil);
      
      setError(`Çok fazla başarısız giriş denemesi. 5 dakika boyunca engellendiniz.`);
    } else {
      // Load new question after failed attempt
      loadSecurityQuestion();
    }
  };

  const loadSecurityQuestion = async () => {
    setLoadingQuestion(true);
    try {
      const response = await fetch('/api/auth/verify-captcha', {
        method: 'GET',
      });

      if (response.ok) {
        const questionData = await response.json();
        setSecurityQuestion(questionData);
        setSecurityAnswer('');
      } else {
        setError('Güvenlik sorusu yüklenemedi. Lütfen sayfayı yenileyin.');
      }
    } catch (error) {
      setError('Güvenlik sorusu yüklenirken hata oluştu.');
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSecurityAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurityAnswer(e.target.value);
    if (error?.includes('Güvenlik') || error?.includes('cevap')) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError(`Giriş yapmak için ${Math.floor(blockTimeLeft / 60)}:${(blockTimeLeft % 60).toString().padStart(2, '0')} beklemeniz gerekiyor.`);
      return;
    }

    if (!securityQuestion) {
      setError('Güvenlik sorusu yüklenmedi. Lütfen sayfayı yenileyin.');
      return;
    }

    if (!securityAnswer.trim()) {
      setError('Lütfen güvenlik sorusunu cevaplayın.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // First verify security question
      const securityResponse = await fetch('/api/auth/verify-captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          answer: securityAnswer, 
          hash: securityQuestion.hash 
        }),
      });

      if (!securityResponse.ok) {
        const errorData = await securityResponse.json();
        setError(errorData.error || 'Güvenlik doğrulaması başarısız.');
        loadSecurityQuestion(); // Load new question
        setSecurityAnswer('');
        return;
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        securityHash: securityQuestion.hash,
        securityAnswer: securityAnswer,
        redirect: false,
      });

      if (result?.error) {
        setError('Geçersiz email veya şifre.');
        handleFailedAttempt();
        setSecurityAnswer('');
      } else {
        // Success - clear attempt count
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginBlockedUntil');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      loadSecurityQuestion();
      setSecurityAnswer('');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-500/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"></div>
        
        {/* Animated Particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/20 border border-white/20 p-8 sm:p-10">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={`w-16 h-16 bg-gradient-to-br ${isBlocked ? 'from-red-500 via-red-600 to-red-700' : 'from-teal-500 via-teal-600 to-blue-600'} rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300`}>
                  {isBlocked ? (
                    <ShieldExclamationIcon className="w-8 h-8 text-white" />
                  ) : (
                    <CubeTransparentIcon className="w-8 h-8 text-white" />
                  )}
                </div>
                <div className={`absolute inset-0 rounded-2xl border-2 ${isBlocked ? 'border-red-400/30' : 'border-teal-400/30'} scale-110 animate-pulse`}></div>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
              {isBlocked ? 'Erişim Engellendi' : 'Yönetici Paneli'}
            </h1>
            <p className="text-slate-300 text-lg">
              {isBlocked ? `${formatTime(blockTimeLeft)} sonra tekrar deneyin` : 'Güvenli giriş yapın'}
            </p>
            
            {/* Security Badge */}
            <div className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-white/10 rounded-full border border-white/20">
              <ShieldCheckIcon className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-200 font-medium">Güvenlik Sorusu Korumalı</span>
            </div>

            {/* Attempt Counter */}
            {attemptCount > 0 && !isBlocked && (
              <div className="mt-3 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                <span className="text-xs text-yellow-300">
                  Başarısız deneme: {attemptCount}/3
                </span>
              </div>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-3">
                E-posta Adresi
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
                  disabled={isBlocked}
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 backdrop-blur-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-200 mb-3">
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
                  disabled={isBlocked}
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 backdrop-blur-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  disabled={isBlocked}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Security Question */}
            {!isBlocked && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor="securityAnswer" className="block text-sm font-semibold text-slate-200">
                    Güvenlik Sorusu
                  </label>
                  <button
                    type="button"
                    onClick={loadSecurityQuestion}
                    disabled={loadingQuestion}
                    className="text-slate-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
                    title="Yeni soru yükle"
                  >
                    <ArrowPathIcon className={`w-4 h-4 ${loadingQuestion ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-3">
                  <div className="flex items-start space-x-3">
                    <QuestionMarkCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      {loadingQuestion ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                          <span className="text-slate-300 text-sm">Yeni soru yükleniyor...</span>
                        </div>
                      ) : securityQuestion ? (
                        <div>
                          <p className="text-white font-medium text-sm mb-1">
                            {securityQuestion.question}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            securityQuestion.type === 'math' 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {securityQuestion.type === 'math' ? 'Matematik' : 'Genel Bilgi'}
                          </span>
                        </div>
                      ) : (
                        <p className="text-slate-400 text-sm">Güvenlik sorusu yükleniyor...</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <input
                    id="securityAnswer"
                    type="text"
                    required
                    disabled={isBlocked || loadingQuestion || !securityQuestion}
                    value={securityAnswer}
                    onChange={handleSecurityAnswerChange}
                    className="block w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Cevabınızı buraya yazın..."
                  />
                </div>
                
                <p className="text-xs text-slate-500 mt-2">
                  💡 İpucu: Büyük/küçük harf farkı yoktur. Türkçe karakterler kullanabilirsiniz.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className={`${isBlocked ? 'bg-red-500/10 border-red-500/20' : 'bg-red-500/10 border-red-500/20'} rounded-2xl p-4 backdrop-blur-xl`}>
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password || !securityAnswer.trim() || isBlocked || !securityQuestion}
              className="group relative w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <div className="flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Doğrulanıyor...</span>
                  </>
                ) : isBlocked ? (
                  <>
                    <ShieldExclamationIcon className="h-5 w-5" />
                    <span>Erişim Engellendi</span>
                  </>
                ) : (
                  <>
                    <span>Güvenli Giriş</span>
                    <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </div>
              
              {/* Shimmer Effect */}
              {!loading && !isBlocked && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl"></div>
              )}
            </button>
          </form>

          {/* Security Info */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Admin Portal
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <div className={`w-2 h-2 ${isBlocked ? 'bg-red-400' : 'bg-green-400'} rounded-full animate-pulse`}></div>
              <span className="text-xs text-slate-500">
                {isBlocked ? 'Güvenlik: Aktif' : 'Sistem aktif'}
              </span>
            </div>
            
            {/* Security Features */}
            <div className="mt-4 text-xs text-slate-500 space-y-1">
              <div className="flex items-center justify-center space-x-1">
                <QuestionMarkCircleIcon className="w-3 h-3" />
                <span>Akıllı Güvenlik Soruları</span>
              </div>
              <div className="flex items-center justify-center space-x-1">
                <ShieldExclamationIcon className="w-3 h-3" />
                <span>Otomatik Blokaj Sistemi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 