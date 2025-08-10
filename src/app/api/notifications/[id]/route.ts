import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { extractToken, verifyToken } from '@/lib/auth';
import { Notification } from '@/models/Notification';

// DELETE /api/notifications/[id] - Delete a specific notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and verify token
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const notificationId = params.id;

    // Find and delete the notification (ensure it belongs to the user)
    const deletedNotification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: user.userId
    });

    if (!deletedNotification) {
      return NextResponse.json(
        { error: 'Notification not found or unauthorized' },
        { status: 404 }
      );
    }

    console.log(`🗑️ Notification deleted: ${notificationId} for user: ${user.userId}`);

    return NextResponse.json(
      { message: 'Notification deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications/[id] - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and verify token
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const notificationId = params.id;
    const { unread } = await request.json();

    // Update the notification
    const updatedNotification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId: user.userId
      },
      { unread: unread ?? false },
      { new: true }
    );

    if (!updatedNotification) {
      return NextResponse.json(
        { error: 'Notification not found or unauthorized' },
        { status: 404 }
      );
    }

    console.log(`📖 Notification updated: ${notificationId} for user: ${user.userId}`);

    return NextResponse.json(
      {
        message: 'Notification updated successfully',
        notification: {
          id: updatedNotification._id.toString(),
          title: updatedNotification.title,
          message: updatedNotification.message,
          type: updatedNotification.type,
          unread: updatedNotification.unread,
          createdAt: updatedNotification.createdAt
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}