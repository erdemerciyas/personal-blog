import { NextResponse } from 'next/server';
import { POST } from '../seed-plugins-themes/route';

export async function GET(request: Request) {
    // Calling the POST handler of seed route
    // We mock the request as NextRequest might be needed if POST uses it, but it seems unused in seed logic
    // Actually POST signature is POST(_request: NextRequest)

    // We can just invoke the logic if we could import the function, but seedPlugins is not exported.
    // So we will just invoke the POST handler.
    const mockRequest = new Request('http://localhost', { method: 'POST' });
    const response = await POST(mockRequest as any);
    return response;
}
