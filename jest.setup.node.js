// Node.js environment setup for API route tests
const { TextEncoder, TextDecoder } = require('util');

// Add Node.js polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Web APIs for Node.js environment
global.Request = class Request {
  constructor(input, init) {
    this.url = input;
    this.method = init?.method || 'GET';
    this.headers = new Map(Object.entries(init?.headers || {}));
    this.body = init?.body;
  }
  
  async json() {
    return JSON.parse(this.body || '{}');
  }
};

global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.status = init?.status || 200;
    this.headers = new Map(Object.entries(init?.headers || {}));
  }
  
  async json() {
    return JSON.parse(this.body || '{}');
  }
  
  static json(data, init) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
    });
  }
};

global.Headers = class Headers extends Map {};

// Mock fetch
global.fetch = jest.fn();

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: new Map(),
    })),
  },
}));

// Mock mongoose
jest.mock('mongoose', () => ({
  __esModule: true,
  default: {
    Schema: class MockSchema {
      constructor(definition, options) {
        this.definition = definition;
        this.options = options;
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
      this.definition = definition;
      this.options = options;
    }
  },
  model: jest.fn(),
  connect: jest.fn(),
}));

// Mock environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.YOUTUBE_API_KEY = 'test-api-key';
process.env.YOUTUBE_CHANNEL_ID = 'test-channel-id';

// Increase timeout for async tests
jest.setTimeout(10000);