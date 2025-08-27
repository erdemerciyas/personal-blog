import { PUT } from './[videoId]/status/route';

// This is a mock test to verify the API functionality
// In a real test, we would use Jest and mock the dependencies

async function testVideoToggleAPI() {
  // Mock request object
  const mockRequest = {
    json: async () => ({ status: 'hidden' })
  };

  // Mock params object with a real video ID from your database
  // You'll need to replace this with an actual video ID from your database
  const mockParams = { videoId: 'YOUR_VIDEO_ID_HERE' };

  try {
    // Call the PUT function
    const response = await PUT(mockRequest as any, { params: mockParams });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data);
    } else {
      const error = await response.json();
      console.log('Error:', error);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testVideoToggleAPI();