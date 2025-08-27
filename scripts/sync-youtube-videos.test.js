// Mock the dependencies
jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

jest.mock('../src/models/Video', () => ({
  default: {
    find: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  },
}));

// Mock environment variables
process.env.YOUTUBE_API_KEY = 'test-key';
process.env.YOUTUBE_CHANNEL_ID = 'test-channel';
process.env.MONGODB_URI = 'mongodb://localhost/test';

describe('Video Synchronization Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    const Video = require('../src/models/Video').default;
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
    const mockSave = jest.fn();
    Video.mockImplementation(() => ({
      save: mockSave,
    }));

    // Import and run the script
    const syncScript = require('./sync-youtube-videos');

    // Wait for the script to complete
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    // Assertions
    expect(global.fetch).toHaveBeenCalled();
    expect(Video.find).toHaveBeenCalled();
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

    // Capture console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Import and run the script
    const syncScript = require('./sync-youtube-videos');

    // Wait for the script to complete
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    // Assertions
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error syncing YouTube videos:',
      expect.any(Error)
    );

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});