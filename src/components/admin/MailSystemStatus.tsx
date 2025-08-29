'use client';

import { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

interface MailStatus {
  configured: boolean;
  gmailUser: string | null;
  hasAppPassword: boolean;
  smtpTest: boolean;
  error: string | null;
}

export default function MailSystemStatus() {
  const [status, setStatus] = useState<MailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkMailStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/mail-status');
      const result = await response.json();
      
      if (result.success) {
        setStatus(result.data);
        setLastCheck(new Date());
      }
    } catch (error) {
      console.error('Mail status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMailStatus();
    // Her 5 dakikada bir otomatik kontrol
    const interval = setInterval(checkMailStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (!status?.configured) {
      return <XCircleIcon className="w-6 h-6 text-red-500" />;
    }
    if (status.smtpTest) {
      return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
    }
    return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
  };

  const getStatusMessage = () => {
    if (!status?.configured) {
      return 'Mail sistemi konfigüre edilmemiş';
    }
    if (status.smtpTest) {
      return 'Mail sistemi aktif ve çalışıyor';
    }
    if (status.error) {
      return `SMTP Hatası: ${status.error}`;
    }
    return 'Mail konfigürasyonu eksik';
  };

  const getStatusColor = () => {
    if (!status?.configured) return 'text-red-600';
    if (status.smtpTest) return 'text-green-600';
    return 'text-yellow-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <EnvelopeIcon className="w-8 h-8 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Mail Sistem Durumu</h3>
        </div>
        <button
          onClick={checkMailStatus}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          title="Durumu yenile"
        >
          <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !status ? (
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Durum kontrol ediliyor...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Ana Durum */}
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusMessage()}
            </span>
          </div>

          {/* Detaylar */}
          {status && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Gmail Hesabı:</span>
                <span className="text-sm font-mono">
                  {status.gmailUser || 'Tanımlı değil'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">App Password:</span>
                <span className={`text-sm ${status.hasAppPassword ? 'text-green-600' : 'text-red-600'}`}>
                  {status.hasAppPassword ? '✓ Tanımlı' : '✗ Eksik'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">SMTP Test:</span>
                <span className={`text-sm ${status.smtpTest ? 'text-green-600' : 'text-red-600'}`}>
                  {status.smtpTest ? '✓ Başarılı' : '✗ Başarısız'}
                </span>
              </div>
              
              {lastCheck && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Son Kontrol:</span>
                  <span className="text-sm text-gray-600">
                    {lastCheck.toLocaleTimeString('tr-TR')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Hata Detayı */}
          {status?.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                <strong>Hata Detayı:</strong> {status.error}
              </p>
            </div>
          )}

          {/* Konfigürasyon Önerileri */}
          {!status?.configured && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Mail Sistemini Aktif Etmek İçin:
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Gmail hesabınızda 2-Factor Authentication'ı aktif edin</li>
                <li>Gmail App Password oluşturun</li>
                <li>Environment variables'lara GMAIL_USER ve GMAIL_APP_PASSWORD ekleyin</li>
                <li>Uygulamayı yeniden başlatın</li>
              </ol>
              <div className="mt-3">
                <a 
                  href="https://support.google.com/accounts/answer/185833" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  📚 Gmail App Password Rehberi
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
