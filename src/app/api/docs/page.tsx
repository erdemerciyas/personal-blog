'use client';


import dynamic from 'next/dynamic';

// Dynamically import Swagger UI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

/**
 * API Documentation Page
 * Displays interactive Swagger UI for API endpoints
 */
export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API Documentation</h1>
          <p className="text-lg text-gray-600">
            Interactive API documentation for Fixral Platform
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <SwaggerUI url="/api/swagger" />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">📚 Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Portfolio Management</li>
              <li>• Product Catalog</li>
              <li>• Service Listing</li>
              <li>• Video Management</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">🔐 Authentication</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Bearer Token (JWT)</li>
              <li>• Cookie-based Session</li>
              <li>• NextAuth Integration</li>
              <li>• Admin Role Required</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">⚡ Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Rate Limiting</li>
              <li>• Error Handling</li>
              <li>• Response Caching</li>
              <li>• Structured Logging</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Getting Started</h3>
          <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
            <li>Explore the API endpoints using the interactive documentation above</li>
            <li>Authenticate using your session token or JWT</li>
            <li>Try out requests directly from the Swagger UI</li>
            <li>Check response schemas and error codes</li>
            <li>Integrate with your application</li>
          </ol>
        </div>

        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Rate Limits</h3>
          <div className="space-y-2 text-sm text-yellow-800">
            <p><strong>Login:</strong> 3 attempts per 15 minutes</p>
            <p><strong>Register:</strong> 2 attempts per hour</p>
            <p><strong>Contact:</strong> 3 messages per hour</p>
            <p><strong>API Strict:</strong> 1000 requests per 15 minutes</p>
            <p><strong>API Moderate:</strong> 2000 requests per 15 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
