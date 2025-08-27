import { PUT } from './route';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import Video from '@/models/Video';

// Mock the dependencies
jest.mock('@/models/Video', () => ({
  default: {
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Video Status API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/admin/videos/[videoId]/status', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated user
      const nextAuth = require('next-auth');
      nextAuth.getServerSession.mockResolvedValue(null);

      // Create a mock request
      const req = {
        json: async () => ({}),
      } as unknown as NextRequest;

      // Call the PUT function
      const response = await PUT(req, { params: { videoId: 'test123' } });

      // Assertions
      expect(response.status).toBe(401);
    });

    it('should update video status when user is authenticated', async () => {
      // Mock authenticated user
      const nextAuth = require('next-auth');
      nextAuth.getServerSession.mockResolvedValue({ user: {} });

      // Mock database response
      const Video = require('@/models/Video').default;
      Video.findByIdAndUpdate.mockResolvedValue({
        _id: 'test123',
        status: 'hidden',
      });

      // Create a mock request with status update
      const req = {
        json: async () => ({
          status: 'hidden',
        }),
      } as unknown as NextRequest;

      // Call the PUT function
      const response = await PUT(req, { params: { videoId: 'test123' } });
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data._id).toBe('test123');
      expect(data.status).toBe('hidden');
    });

    it('should return 404 if video is not found', async () => {
      // Mock authenticated user
      const nextAuth = require('next-auth');
      nextAuth.getServerSession.mockResolvedValue({ user: {} });

      // Mock database response for not found
      const Video = require('@/models/Video').default;
      Video.findByIdAndUpdate.mockResolvedValue(null);

      // Create a mock request with status update
      const req = {
        json: async () => ({
          status: 'hidden',
        }),
      } as unknown as NextRequest;

      // Call the PUT function
      const response = await PUT(req, { params: { videoId: 'nonexistent' } });

      // Assertions
      expect(response.status).toBe(404);
    });
  });
});