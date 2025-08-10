import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { extractToken, verifyToken } from '@/lib/auth';

// Authentication helper
async function authenticate(request: NextRequest) {
  try {
    const token = extractToken(request);
    if (!token) {
      return { error: new Response('Unauthorized', { status: 401 }) };
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return { error: new Response('Invalid token', { status: 401 }) };
    }

    return { user: decoded };
  } catch {
    return { error: new Response('Authentication failed', { status: 401 }) };
  }
}

// Create a test notification
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return auth.error;
    const user = auth.user!;

    await connectDB();

    // Create a test notification
    const testNotification = new Notification({
      userId: user.userId,
      title: '🧪 Test Notification',
      message: 'This is a test notification to verify real-time functionality!',
      type: 'info',
      unread: true,
      createdAt: new Date()
    });

    await testNotification.save();
    console.log('📬 Test notification created for user:', user.userId);

    return NextResponse.json({ 
      success: true, 
      message: 'Test notification created successfully',
      notification: {
        id: testNotification._id,
        title: testNotification.title,
        message: testNotification.message,
        type: testNotification.type,
        createdAt: testNotification.createdAt
      }
    });
  } catch (err) {
      console.error('Error creating test notification:', err);
      return NextResponse.json(
        { error: 'Failed to create test notification' },
        { status: 500 }
      );
    }
}