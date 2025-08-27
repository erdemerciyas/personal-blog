import { GET } from './route';

// Mock the dependencies
jest.mock('@/models/Video', () => {
  const mockVideo = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({ _id: 'test123', videoId: 'new123' }),
  }));
  (mockVideo as any).find = jest.fn();
  return {
    __esModule: true,
    default: mockVideo,
  };
});

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('Sync YouTube Videos Cron Job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variables
    process.env.YOUTUBE_API_KEY = 'test_api_key';
    process.env.YOUTUBE_CHANNEL_ID = 'test_channel_id';
  });

  it('should sync videos from YouTube and add new ones to database', async () => {
    // Mock YouTube API response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: { videoId: 'new123' },
            snippet: {
              title: 'New Video',
              description: 'New Description',
              thumbnails: { medium: { url: 'https://example.com/thumb.jpg' } },
              publishedAt: '2023-01-01T00:00:00Z',
            },
          },
          {
            id: { videoId: 'existing456' },
            snippet: {
              title: 'Existing Video',
              description: 'Existing Description',
              thumbnails: { medium: { url: 'https://example.com/thumb2.jpg' } },
              publishedAt: '2023-01-02T00:00:00Z',
            },
          },
        ],
      }),
    });

    // Mock database response - one existing video
    const Video = require('@/models/Video').default;
    Video.find.mockResolvedValue([
      {
        videoId: 'existing456',
        title: 'Existing Video',
        description: 'Existing Description',
        thumbnail: 'https://example.com/thumb2.jpg',
        publishedAt: new Date('2023-01-02T00:00:00Z'),
        type: 'normal',
        status: 'visible',
        tags: [],
      },
    ]);

    // Mock save function
    const mockSave = jest.fn().mockResolvedValue({ _id: 'test123', videoId: 'new123' });
    Video.mockImplementation(() => ({
      save: mockSave,
    }));

    // Call the GET function (cron job)
    const response = await GET();
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('Added 1 new videos');
    expect(mockSave).toHaveBeenCalledTimes(1); // Only one new video should be saved
  });

  it('should handle YouTube API errors gracefully', async () => {
    // Mock YouTube API error
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: { message: 'API Error' },
      }),
    });

    // Call the GET function (cron job)
    const response = await GET();
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to sync YouTube videos');
  });
});