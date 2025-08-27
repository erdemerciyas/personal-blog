# Testing Documentation

This document explains how to run tests for the YouTube video integration.

## Overview

The YouTube video integration includes several test files to ensure the functionality works correctly:

1. **Video Model Tests** - Tests for the MongoDB Video schema
2. **YouTube API Route Tests** - Tests for the public YouTube API route
3. **Admin API Route Tests** - Tests for the admin API routes
4. **Cron Job Tests** - Tests for the YouTube video synchronization cron job
5. **Script Tests** - Tests for the manual video synchronization script

## Running Tests

### Prerequisites

Before running tests, make sure you have installed all dependencies:

```bash
npm install
```

### Running All Tests

To run all tests:

```bash
npm test
```

### Running Specific Test Files

To run tests for a specific file:

```bash
npm test src/models/Video.test.ts
npm test src/app/api/youtube/route.test.ts
npm test src/app/api/admin/videos/route.test.ts
npm test src/app/api/admin/videos/[id]/route.test.ts
npm test src/app/api/admin/videos/[id]/status/route.test.ts
npm test src/app/api/cron/sync-youtube-videos/route.test.ts
npm test scripts/sync-youtube-videos.test.js
```

### Running Tests with Coverage

To run tests with coverage reporting:

```bash
npm test -- --coverage
```

## Test Structure

### Video Model Tests

Located at `src/models/Video.test.ts`, these tests verify:

1. Video creation with required fields
2. Validation of required fields
3. Default values for optional fields
4. Enum validation for type and status

### YouTube API Route Tests

Located at `src/app/api/youtube/route.test.ts`, these tests verify:

1. Successful video fetching from YouTube
2. Proper merging of YouTube data with database overrides
3. Error handling for YouTube API failures
4. Filtering by type and status

### Admin API Route Tests

Located at `src/app/api/admin/videos/route.test.ts`, these tests verify:

1. Authentication protection
2. Video listing functionality
3. Manual video creation
4. Validation of required fields
5. Handling of duplicate videos

### Individual Video API Route Tests

Located at `src/app/api/admin/videos/[id]/route.test.ts`, these tests verify:

1. Authentication protection
2. Video update functionality
3. Handling of non-existent videos

### Video Status API Route Tests

Located at `src/app/api/admin/videos/[id]/status/route.test.ts`, these tests verify:

1. Authentication protection
2. Video status update functionality
3. Handling of non-existent videos

### Cron Job Tests

Located at `src/app/api/cron/sync-youtube-videos/route.test.ts`, these tests verify:

1. Successful video synchronization from YouTube
2. Proper addition of new videos to the database
3. Error handling for YouTube API failures

### Script Tests

Located at `scripts/sync-youtube-videos.test.js`, these tests verify:

1. Successful video synchronization from YouTube
2. Proper addition of new videos to the database
3. Error handling for YouTube API failures

## Writing New Tests

### Test File Structure

Test files should follow this structure:

```typescript
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/models/Video', () => ({
  default: {
    find: jest.fn(),
  },
}));

describe('Test Suite Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    // Test implementation
  });
});
```

### Mocking Dependencies

Use `jest.mock()` to mock dependencies:

```typescript
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
```

### Testing API Routes

For API routes, create mock requests and verify responses:

```typescript
it('should return videos when user is authenticated', async () => {
  // Mock authenticated user
  const nextAuth = require('next-auth');
  nextAuth.getServerSession.mockResolvedValue({ user: {} });

  // Create a mock request
  const req = {} as unknown as NextRequest;

  // Call the API function
  const response = await GET(req);
  const data = await response.json();

  // Assertions
  expect(response.status).toBe(200);
  expect(Array.isArray(data)).toBe(true);
});
```

## Continuous Integration

Tests are automatically run in the CI pipeline on every push to the repository. The pipeline includes:

1. Building the application
2. Running all tests
3. Checking code coverage
4. Reporting results

## Troubleshooting

### Tests Failing Due to Missing Environment Variables

Make sure all required environment variables are set:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_youtube_channel_id_here
MONGODB_URI=mongodb://localhost/test
```

### Tests Failing Due to Network Issues

If tests fail due to network issues when calling the YouTube API, make sure you have internet connectivity or mock the API responses properly.

### Tests Failing Due to Database Issues

If tests fail due to database issues, make sure MongoDB is running and accessible, or mock the database operations properly.