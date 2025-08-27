import mongoose, { Types } from 'mongoose';
import Video from './Video';

describe('Video Model', () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect('mongodb://127.0.0.1:27017/test');
  });

  afterAll(async () => {
    // Clean up and close database connection
    await Video.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create a video with required fields', async () => {
    const videoData = {
      videoId: 'test123',
      title: 'Test Video',
      description: 'Test Description',
      thumbnail: 'https://example.com/thumb.jpg',
      duration: 'PT5M30S',
      publishedAt: new Date('2023-01-01T00:00:00Z'),
      type: 'normal',
      status: 'visible',
      tags: ['test', 'video'],
    };

    const video = new Video(videoData);
    const savedVideo = await video.save();

    // Assertions
    expect(savedVideo._id).toBeDefined();
    expect(savedVideo.videoId).toBe(videoData.videoId);
    expect(savedVideo.title).toBe(videoData.title);
    expect(savedVideo.description).toBe(videoData.description);
    expect(savedVideo.thumbnail).toBe(videoData.thumbnail);
    expect(savedVideo.duration).toBe(videoData.duration);
    expect(savedVideo.publishedAt).toEqual(videoData.publishedAt);
    expect(savedVideo.type).toBe(videoData.type);
    expect(savedVideo.status).toBe(videoData.status);
    expect(savedVideo.tags).toEqual(videoData.tags);
  });

  it('should fail to create a video without required videoId', async () => {
    const videoData = {
      title: 'Test Video',
    };

    let error;
    try {
      const video = new Video(videoData);
      await video.save();
    } catch (err) {
      error = err;
    }

    // Assertions
    expect(error).toBeDefined();
    expect((error as any).name).toBe('ValidationError');
  });

  it('should use default values for type and status', async () => {
    const videoData = {
      videoId: 'test456',
      title: 'Test Video 2',
    };

    const video = new Video(videoData);
    const savedVideo = await video.save();

    // Assertions
    expect(savedVideo.type).toBe('normal');
    expect(savedVideo.status).toBe('visible');
  });

  it('should validate enum values for type and status', async () => {
    const videoData = {
      videoId: 'test789',
      title: 'Test Video 3',
      type: 'invalid-type',
      status: 'invalid-status',
    };

    let error;
    try {
      const video = new Video(videoData);
      await video.save();
    } catch (err) {
      error = err;
    }

    // Assertions
    expect(error).toBeDefined();
    expect((error as any).name).toBe('ValidationError');
  });
});