'use client';

// Removed unused Link import

/**
 * API Documentation Page
 * Displays comprehensive API documentation for all endpoints
 */
export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API Documentation</h1>
          <p className="text-lg text-gray-600">
            Comprehensive API documentation for Fixral Platform
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Available API Endpoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-blue-600 mb-2">Portfolio API</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>GET /api/portfolio - List portfolios</li>
                <li>GET /api/portfolio/[id] - Get portfolio</li>
                <li>POST /api/portfolio - Create portfolio</li>
                <li>PUT /api/portfolio/[id] - Update portfolio</li>
                <li>DELETE /api/portfolio/[id] - Delete portfolio</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-green-600 mb-2">Products API</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>GET /api/products - List products</li>
                <li>GET /api/products/[id] - Get product</li>
                <li>POST /api/products - Create product</li>
                <li>PUT /api/products/[id] - Update product</li>
                <li>DELETE /api/products/[id] - Delete product</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-purple-600 mb-2">Admin API</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>GET /api/admin/dashboard-stats - Dashboard stats</li>
                <li>POST /api/admin/upload - Upload files</li>
                <li>GET /api/admin/media - List media</li>
                <li>PUT /api/admin/settings - Update settings</li>
                <li>GET /api/admin/users - List users</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-red-600 mb-2">Auth API</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>POST /api/auth/register - Register</li>
                <li>POST /api/auth/login - Login</li>
                <li>POST /api/auth/logout - Logout</li>
                <li>POST /api/auth/reset-password - Reset password</li>
                <li>GET /api/auth/session - Get session</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-yellow-600 mb-2">Contact API</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>POST /api/contact - Send message</li>
                <li>GET /api/messages - List messages</li>
                <li>GET /api/messages/[id] - Get message</li>
                <li>DELETE /api/messages/[id] - Delete message</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-indigo-600 mb-2">Utility API</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>GET /api/health - Health check</li>
                <li>GET /api/sitemap - Sitemap</li>
                <li>GET /api/robots - Robots.txt</li>
                <li>POST /api/upload - Generic upload</li>
                <li>GET /api/settings - Get settings</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <li>Test API endpoints using tools like Postman or curl</li>
            <li>Authenticate using your session token or JWT</li>
            <li>Check response schemas in the endpoint documentation</li>
            <li>Handle error codes properly in your application</li>
            <li>Rate limits apply - see limits below</li>
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

        <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-6 rounded">
          <h3 className="text-lg font-semibold text-green-900 mb-2">📖 Example Usage</h3>
          <pre className="text-sm text-green-800 bg-white p-4 rounded overflow-x-auto">
{`// Get all portfolios
fetch('/api/portfolio')
  .then(res => res.json())
  .then(data => console.log(data));

// Create new portfolio (requires auth)
fetch('/api/portfolio', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({ title: 'New Project' })
});`}
          </pre>
        </div>
      </div>
    </div>
  );
}
