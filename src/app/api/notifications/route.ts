import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { extractToken, verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

// Notification schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['project_completed', 'payment_received', 'deadline_reminder', 'general'], default: 'general' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  projectTitle: { type: String },
  clientName: { type: String },
  amount: { type: Number },
  unread: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// Helper function to authenticate requests
async function authenticate(request: NextRequest) {
  const token = extractToken(request);
  if (!token) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }

  const user = verifyToken(token);
  if (!user) {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }

  return { user };
}

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const user = auth.user!;

  try {
    await connectDB();
    
    const notifications = await Notification.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({ 
      userId: user.userId, 
      unread: true 
    });

    return NextResponse.json({
      notifications: notifications.map(notification => ({
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        projectTitle: notification.projectTitle,
        clientName: notification.clientName,
        amount: notification.amount,
        unread: notification.unread,
        time: getTimeAgo(notification.createdAt)
      })),
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const user = auth.user!;

  try {
    await connectDB();
    
    const { title, message, type, projectId, projectTitle, clientName, amount } = await request.json();

    const notification = new Notification({
      userId: user.userId,
      title,
      message,
      type,
      projectId,
      projectTitle,
      clientName,
      amount
    });

    await notification.save();

    return NextResponse.json(
      { message: 'Notification created successfully', notification },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const user = auth.user!;

  try {
    await connectDB();
    
    const { notificationIds } = await request.json();

    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      await Notification.updateMany(
        { 
          _id: { $in: notificationIds },
          userId: user.userId 
        },
        { unread: false }
      );
    } else {
      // Mark all notifications as read
      await Notification.updateMany(
        { userId: user.userId },
        { unread: false }
      );
    }

    return NextResponse.json(
      { message: 'Notifications marked as read' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Export the Notification model for use in other files