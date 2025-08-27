import '@testing-library/jest-dom'
import React from 'react'

// Extend Jest with Testing Library matchers
expect.extend(require('@testing-library/jest-dom/matchers'))

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props) {
    const { src, alt, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { src, alt, ...rest });
  },
}))

// Mock Next.js link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }) {
    return React.createElement('a', { href, ...props }, children);
  }
})

// Mock MongoDB and BSON completely
jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    db: jest.fn(),
    close: jest.fn(),
  })),
  ObjectId: jest.fn().mockImplementation((id) => ({ toString: () => id || '507f1f77bcf86cd799439011' })),
}))

jest.mock('bson', () => ({
  ObjectId: jest.fn().mockImplementation((id) => ({ toString: () => id || '507f1f77bcf86cd799439011' })),
}))

// Mock connectDB function
jest.mock('@/lib/mongoose', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({}),
}))

// Mock environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'

// Mock fetch globally
global.fetch = jest.fn()

// Add Node.js polyfills for Next.js API routes
if (typeof global.Request === 'undefined') {
  try {
    const fetch = require('node-fetch')
    global.Request = fetch.Request
    global.Response = fetch.Response  
    global.Headers = fetch.Headers
  } catch (e) {
    // Fallback if node-fetch is not available
    global.Request = class Request {}
    global.Response = class Response {}
    global.Headers = class Headers {}
  }
}

// Mock NextResponse for API route tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: new Headers(),
    })),
  },
}))

// Mock mongoose for API route tests
jest.mock('mongoose', () => ({
  __esModule: true,
  default: {
    Schema: class MockSchema {
      constructor(definition, options) {
        this.definition = definition
        this.options = options
      }
    },
    model: jest.fn(() => ({
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    })),
    connect: jest.fn(),
    connection: {
      readyState: 1,
      close: jest.fn().mockResolvedValue({}),
    },
    models: {},
  },
  Schema: class MockSchema {
    constructor(definition, options) {
      this.definition = definition
      this.options = options
    }
  },
  model: jest.fn(() => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  })),
  connect: jest.fn(),
  models: {},
}))

// Mock Video model specifically
jest.mock('@/models/Video', () => {
  const mockVideo = jest.fn().mockImplementation((data) => {
    // Validation logic for testing
    const validTypes = ['normal', 'short', 'live'];
    const validStatuses = ['visible', 'hidden', 'draft'];
    
    const instance = {
      ...data,
      _id: '507f1f77bcf86cd799439011',
      type: data?.type || 'normal',
      status: data?.status || 'visible',
      save: jest.fn().mockImplementation(async () => {
        // Simulate validation errors
        if (!data?.videoId) {
          const error = new Error('Video validation failed: videoId: Path `videoId` is required.');
          error.name = 'ValidationError';
          throw error;
        }
        
        if (data?.type && !validTypes.includes(data.type)) {
          const error = new Error(`Video validation failed: type: \`${data.type}\` is not a valid enum value for path \`type\`.`);
          error.name = 'ValidationError';
          throw error;
        }
        
        if (data?.status && !validStatuses.includes(data.status)) {
          const error = new Error(`Video validation failed: status: \`${data.status}\` is not a valid enum value for path \`status\`.`);
          error.name = 'ValidationError';
          throw error;
        }
        
        return {
          ...data,
          _id: '507f1f77bcf86cd799439011',
          type: data?.type || 'normal',
          status: data?.status || 'visible',
        };
      }),
    };
    
    return instance;
  });
  
  mockVideo.find = jest.fn().mockResolvedValue([]);
  mockVideo.findOne = jest.fn().mockResolvedValue(null);
  mockVideo.findById = jest.fn().mockResolvedValue(null);
  mockVideo.findByIdAndUpdate = jest.fn().mockResolvedValue({
    _id: 'test123',
    status: 'hidden',
  });
  mockVideo.create = jest.fn().mockResolvedValue({});
  mockVideo.updateOne = jest.fn().mockResolvedValue({});
  mockVideo.deleteOne = jest.fn().mockResolvedValue({});
  mockVideo.deleteMany = jest.fn().mockResolvedValue({});
  mockVideo.mockImplementation = jest.fn();
  return {
    __esModule: true,
    default: mockVideo,
  };
})

// Mock User model
jest.mock('@/models/User', () => {
  const mockUser = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({}),
  }));
  mockUser.find = jest.fn();
  mockUser.findOne = jest.fn();
  mockUser.findById = jest.fn().mockResolvedValue({
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    isActive: true,
  });
  mockUser.create = jest.fn();
  mockUser.updateOne = jest.fn();
  mockUser.deleteOne = jest.fn();
  return {
    __esModule: true,
    default: mockUser,
  };
})

// Mock JWT utils
jest.mock('@/lib/jwt-utils', () => ({
  verifyRefreshToken: jest.fn().mockResolvedValue({
    userId: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
  }),
  generateTokens: jest.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
  }),
  generateTokenPair: jest.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
  }),
  generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
  extractRefreshTokenFromCookies: jest.fn().mockReturnValue('mock-refresh-token'),
  getRefreshTokenCookieOptions: jest.fn().mockReturnValue({
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }),
  error: jest.fn(),
}))

// Mock NextResponse and NextRequest for API route tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: new Map(),
    })),
  },
  NextRequest: jest.fn().mockImplementation((url, init) => {
    const cookies = new Map();
    
    // Parse cookies from Cookie header
    if (init?.headers?.Cookie) {
      const cookieString = init.headers.Cookie;
      const cookiePairs = cookieString.split(';');
      cookiePairs.forEach(pair => {
        const [name, value] = pair.trim().split('=');
        if (name && value) {
          cookies.set(name, value);
        }
      });
    }
    
    return {
      url,
      method: init?.method || 'GET',
      headers: new Map(Object.entries(init?.headers || {})),
      body: init?.body,
      json: async () => JSON.parse(init?.body || '{}'),
      cookies: {
        get: jest.fn((name) => cookies.get(name) ? { value: cookies.get(name) } : undefined),
        set: jest.fn((name, value) => cookies.set(name, value)),
        has: jest.fn((name) => cookies.has(name)),
        delete: jest.fn((name) => cookies.delete(name)),
        getAll: jest.fn(() => Array.from(cookies.entries()).map(([name, value]) => ({ name, value }))),
      },
    };
  }),
}))

// Add TextEncoder/TextDecoder polyfills
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia (only in jsdom environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Increase timeout for async tests
jest.setTimeout(10000)

// Suppress console errors in tests unless explicitly needed
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: An invalid form control'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})