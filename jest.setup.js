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
    model: jest.fn(),
    connect: jest.fn(),
    connection: {
      readyState: 1,
    },
  },
  Schema: class MockSchema {
    constructor(definition, options) {
      this.definition = definition
      this.options = options
    }
  },
  model: jest.fn(),
  connect: jest.fn(),
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
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    url,
    method: init?.method || 'GET',
    headers: new Map(Object.entries(init?.headers || {})),
    body: init?.body,
    json: async () => JSON.parse(init?.body || '{}'),
    cookies: {
      get: jest.fn(),
      set: jest.fn(),
    },
  })),
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