'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TestLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: any, success: boolean) => {
    setTestResults(prev => [...prev, {
      test,
      result,
      success,
      timestamp: new Date().toISOString()
    }]);
  };

  const testCredentialsLogin = async () => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: 'admin@example.com', // Test email
        password: 'admin123', // Test password
        redirect: false,
        callbackUrl: '/admin/dashboard'
      });

      addResult('Credentials Login Test', result, result?.ok || false);
    } catch (error) {
      addResult('Credentials Login Test', error, false);
    } finally {
      setLoading(false);
    }
  };

  const testSessionStatus = () => {
    addResult('Session Status', { status, session }, status === 'authenticated');
  };

  const testAPIEndpoints = async () => {
    const endpoints = [
      '/api/auth/session',
      '/api/auth/csrf',
      '/api/admin/dashboard-stats'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        const data = response.ok ? await response.json() : null;
        
        addResult(`API Test: ${endpoint}`, {
          status: response.status,
          ok: response.ok,
          data
        }, response.ok);
      } catch (error) {
        addResult(`API Test: ${endpoint}`, error, false);
      }
    }
  };

  const testEnvironmentVariables = () => {
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      // Don't expose secret
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'
    };

    addResult('Environment Variables', envVars, true);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const manualRedirect = () => {
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Login Test Panel</h1>
          <p className="text-slate-600">Vercel login sorunlarını debug etmek için test araçları</p>
        </div>

        {/* Current Session Info */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Mevcut Session Durumu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Status:</strong>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                status === 'authenticated' ? 'bg-brand-primary-100 text-brand-primary-900' :
                status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {status}
              </span>
            </div>
            <div>
              <strong>User:</strong>
              <span className="ml-2 text-slate-600">
                {session?.user?.email || 'Not logged in'}
              </span>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Test İşlemleri</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={testCredentialsLogin}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Login Test
            </button>
            
            <button
              onClick={testSessionStatus}
              className="px-4 py-2 bg-brand-primary-700 text-white rounded hover:bg-brand-primary-800"
            >
              Session Test
            </button>
            
            <button
              onClick={testAPIEndpoints}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              API Test
            </button>
            
            <button
              onClick={testEnvironmentVariables}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Env Test
            </button>
            
            <button
              onClick={manualRedirect}
              className="px-4 py-2 bg-brand-primary-700 text-white rounded hover:bg-brand-primary-800"
            >
              Dashboard'a Git
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
            >
              Temizle
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Test Sonuçları</h2>
            <span className="text-sm text-slate-500">
              {testResults.length} test sonucu
            </span>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Henüz test yapılmadı. Yukarıdaki butonları kullanarak test başlatın.
              </p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="border border-slate-200 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{result.test}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.success ? 'bg-brand-primary-100 text-brand-primary-900' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded p-2 overflow-auto">
                    <pre className="text-xs text-slate-600">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Test Talimatları</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>1. <strong>Login Test:</strong> Test kullanıcısı ile giriş yapmayı dener</li>
            <li>2. <strong>Session Test:</strong> Mevcut session durumunu kontrol eder</li>
            <li>3. <strong>API Test:</strong> Kritik API endpoint'lerini test eder</li>
            <li>4. <strong>Env Test:</strong> Environment variable'ları kontrol eder</li>
            <li>5. <strong>Dashboard'a Git:</strong> Manuel olarak dashboard'a yönlendirir</li>
          </ul>
        </div>
      </div>
    </div>
  );
}