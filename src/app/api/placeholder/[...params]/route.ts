import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ params: string[] }> }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resolvedParams = await params;
  
  // Create a simple base64 PNG placeholder (1x1 gray pixel)
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(base64PNG, 'base64');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}