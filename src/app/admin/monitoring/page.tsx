'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

interface PerformanceMetrics {
  serverMetrics: {
    uptime: number;
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    cpuUsage: number;
    activeConnections: number;
  };
  databaseMetrics: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime: number;
    activeQueries: number;
  };
  errorMetrics: {
    totalErrors: number;
    errorRate: number;
    criticalErrors: number;
  };
  clientMetrics: {
    averageLoadTime: number;
    averageRenderTime: number;
    slowPages: Array<{
      route: string;
      loadTime: number;
      count: number;
    }>;
  };
}

export default function MonitoringDashboard() {
  const { user, loading } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      redirect('/admin/login');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchMetrics();
      // Refresh metrics every 30 seconds
      const interval = setInterval(fetchMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring/performance');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Hata</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Metrikler yükleniyor...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}g ${hours}s ${minutes}d`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Monitoring Dashboard</h1>
          <p className="mt-2 text-gray-600">Sistem performansı ve sağlık durumu</p>
        </div>

        {/* Server Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Uptime</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatUptime(metrics.serverMetrics.uptime)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Memory Usage</h3>
            <p className="text-2xl font-bold text-blue-600">
              {metrics.serverMetrics.memoryUsage.percentage.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">
              {(metrics.serverMetrics.memoryUsage.used / 1024 / 1024).toFixed(0)}MB / 
              {(metrics.serverMetrics.memoryUsage.total / 1024 / 1024).toFixed(0)}MB
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">CPU Usage</h3>
            <p className="text-2xl font-bold text-orange-600">
              {metrics.serverMetrics.cpuUsage.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Active Connections</h3>
            <p className="text-2xl font-bold text-purple-600">
              {metrics.serverMetrics.activeConnections}
            </p>
          </div>
        </div>

        {/* Database & Error Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Database Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(metrics.databaseMetrics.status)}`}>
                  {metrics.databaseMetrics.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Response Time:</span>
                <span className="font-medium">{metrics.databaseMetrics.responseTime}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Queries:</span>
                <span className="font-medium">{metrics.databaseMetrics.activeQueries}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Error Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Errors:</span>
                <span className="font-medium text-red-600">{metrics.errorMetrics.totalErrors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Error Rate:</span>
                <span className="font-medium">{metrics.errorMetrics.errorRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Critical Errors:</span>
                <span className="font-medium text-red-600">{metrics.errorMetrics.criticalErrors}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Client Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600">Average Load Time</p>
              <p className="text-2xl font-bold text-blue-600">
                {metrics.clientMetrics.averageLoadTime}ms
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Render Time</p>
              <p className="text-2xl font-bold text-green-600">
                {metrics.clientMetrics.averageRenderTime}ms
              </p>
            </div>
          </div>

          {metrics.clientMetrics.slowPages.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Slow Pages</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Load Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {metrics.clientMetrics.slowPages.map((page, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {page.route}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {page.loadTime}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {page.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}