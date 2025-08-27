import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock the dependencies
jest.mock('@/models/Video', () => ({
  default: {
    find: jest.fn(),
  },
}));

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('YouTube API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return videos when YouTube API is accessible', async () => {
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
    const req = {
      url: 'http://localhost:3000/api/youtube',
    } as unknown as NextRequest;

    // Call the GET function
    const response = await GET(req);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].videoId).toBe('test123');
    expect(data[0].title).toBe('Test Video');
  });

  it('should handle YouTube API errors gracefully', async () => {
    // Mock YouTube API error
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: { message: 'API Error' },
      }),
    });

    // Create a mock request
    const req = {
      url: 'http://localhost:3000/api/youtube',
    } as unknown as NextRequest;

    // Call the GET function
    const response = await GET(req);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch YouTube videos');
  });
});