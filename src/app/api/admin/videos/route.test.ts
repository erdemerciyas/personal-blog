import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// Mock the dependencies
jest.mock('@/models/Video', () => ({
  default: {
    find: jest.fn(),
    findOne: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  },
}));

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Admin Videos API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/videos', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated user
      const nextAuth = require('next-auth');
      nextAuth.getServerSession.mockResolvedValue(null);

      // Create a mock request
      const req = {} as unknown as NextRequest;

      // Call the GET function
      const response = await GET(req);

      // Assertions
      expect(response.status).toBe(401);
    });

    it('should return videos when user is authenticated', async () => {
      // Mock authenticated user
      const nextAuth = require('next-auth');
      nextAuth.getServerSession.mockResolvedValue({ user: {} });

      // Mock YouTube API response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              id: { videoId: 'test123' },
              snippet: {
                title: 'Test Video',
                description: 'Test Description',
                thumbnails: { medium: { url: 'https://example.com/thumb.jpg' } },
                publishedAt: '2023-01-01T00:00:00Z',
              },
            },
          ],
        }),
      });

      // Mock database response
      const Video = require('@/models/Video').default;
      Video.find.mockResolvedValue([]);

      // Create a mock request
      const req = {} as unknown as NextRequest;

      // Call the GET function
      const response = await GET(req);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /api/admin/videos', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated user
      const nextAuth = require('next-auth');
      nextAuth.getServerSession.mockResolvedValue(null);

      // Create a mock request
      const req = {
        json: async () => ({}),
      } as unknown as NextRequest;

      // Call the POST function
      const response = await POST(req);

      // Assertions
      expect(response.status).toBe(401);
    });

    it('should return 400 if videoId or title is missing', async () => {
      // Mock authenticated user
      const nextAuth = require('next-auth');
      nextAuth.getServerSession.mockResolvedValue({ user: {} });

      // Create a mock request with missing required fields
      const req = {
        json: async () => ({ description: 'Test Description' }),
      } as unknown as NextRequest;

      // Call the POST function
      const response = await POST(req);

      // Assertions
      expect(response.status).toBe(400);
    });

    it('should return 400 if video already exists', async () => {
      // Mock authenticated user
      const nextAuth = require('next-auth');
      nextAuth.getServerSession.mockResolvedValue({ user: {} });

      // Mock database response for existing video
      const Video = require('@/models/Video').default;
      Video.findOne.mockResolvedValue({ _id: 'existing' });

      // Create a mock request with valid data
      const req = {
        json: async () => ({
          videoId: 'test123',
          title: 'Test Video',
        }),
      } as unknown as NextRequest;

      // Call the POST function
      const response = await POST(req);

      // Assertions
      expect(response.status).toBe(400);
    });

    it('should create a new video when data is valid', async () => {
      // Mock authenticated user
      const nextAuth = require('next-auth');
      nextAuth.getServerSession.mockResolvedValue({ user: {} });

      // Mock database responses
      const Video = require('@/models/Video').default;
      Video.findOne.mockResolvedValue(null); // No existing video
      const mockSave = jest.fn();
      Video.mockImplementation(() => ({
        save: mockSave,
      }));

      // Create a mock request with valid data
      const req = {
        json: async () => ({
          videoId: 'test123',
          title: 'Test Video',
          description: 'Test Description',
        }),
      } as unknown as NextRequest;

      // Call the POST function
      const response = await POST(req);

      // Assertions
      expect(response.status).toBe(200);
      expect(mockSave).toHaveBeenCalled();
    });
  });
});