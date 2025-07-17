'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AdminDebugPage() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [apiTests, setApiTests] = useState<any>({});

  useEffect(() => {
    // Collect debug information
    const info = {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      sessionStatus: status,
      sessionData: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL
      }
    };
    setDebugInfo(info);
  }, [session, status]);

  const testAPI = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint);
      const data = response.ok ? await response.json() : null;
      
      setApiTests(prev => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          ok: response.ok,
          data: data,
          error: null
        }
      }));
    } catch (error) {
      setApiTests(prev => ({
        ...prev,
        [endpoint]: {
          status: 'ERROR',
          ok: false,
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };

  const runAllTests = async () => {
    const endpoints = [
      '/api/health',
      '/api/admin/dashboard-stats',
      '/api/settings',
      '/api/portfolio',
      '/api/messages'
    ];

    for (const endpoint of endpoints) {
      await testAPI(endpoint);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Admin Debug Panel</h1>
          <p className="text-slate-600">Vercel deployment debug bilgileri</p>
        </div>

        {/* Session Info */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Session Bilgileri</h2>
          <div className="bg-slate-50 rounded p-4 overflow-auto">
            <pre className="text-sm text-slate-700">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>

        {/* API Tests */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">API Endpoint Testleri</h2>
            <button
              onClick={runAllTests}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
            >
              Tüm API'leri Test Et
            </button>
          </div>
          
          <div className="space-y-4">
            {Object.entries(apiTests).map(([endpoint, result]: [string, any]) => (
              <div key={endpoint} className="border border-slate-200 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">{endpoint}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
                {result.error && (
                  <div className="text-red-600 text-sm mb-2">
                    Error: {result.error}
                  </div>
                )}
                {result.data && (
                  <div className="bg-slate-50 rounded p-2 overflow-auto">
                    <pre className="text-xs text-slate-600">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Browser Info */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Browser Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User Agent:</strong>
              <div className="text-slate-600 break-all">
                {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}
              </div>
            </div>
            <div>
              <strong>URL:</strong>
              <div className="text-slate-600 break-all">
                {typeof window !== 'undefined' ? window.location.href : 'N/A'}
              </div>
            </div>
            <div>
              <strong>Cookies Enabled:</strong>
              <div className="text-slate-600">
                {typeof window !== 'undefined' ? (navigator.cookieEnabled ? 'Yes' : 'No') : 'N/A'}
              </div>
            </div>
            <div>
              <strong>Local Storage:</strong>
              <div className="text-slate-600">
                {typeof window !== 'undefined' ? (window.localStorage ? 'Available' : 'Not Available') : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}