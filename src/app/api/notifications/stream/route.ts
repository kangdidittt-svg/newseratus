import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { extractToken, verifyToken } from '@/lib/auth';
import { Notification } from '@/models/Notification';

// Authentication helper
async function authenticate(request: NextRequest) {
  try {
    const token = extractToken(request);
    if (!token) {
      return { error: new Response('Unauthorized', { status: 401 }) };
    }

    const user = verifyToken(token);
    if (!user) {
      return { error: new Response('Invalid token', { status: 401 }) };
    }

    return { user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: new Response('Authentication failed', { status: 401 }) };
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Server-Sent Events endpoint for real-time notifications
export async function GET(request: NextRequest) {
  // Authenticate user
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const user = auth.user!;

  console.log('🔌 SSE connection established for user:', user.userId);

  const encoder = new TextEncoder();
  let isActive = true;
  
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        if (!isActive) return;
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send connection confirmation
      send({ type: 'connected', timestamp: Date.now() });

      // Heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        if (isActive) {
          send({ type: 'heartbeat', timestamp: Date.now() });
        }
      }, 30000);

      // Poll for new notifications
      let lastCheck = new Date();
      const poll = setInterval(async () => {
        if (!isActive) return;
        
        try {
          await connectDB();
          const notifications = await Notification.find({
            userId: user.userId,
            createdAt: { $gt: lastCheck }
          }).sort({ createdAt: -1 }).limit(3);

          if (notifications.length > 0) {
            const unreadCount = await Notification.countDocuments({ 
              userId: user.userId, 
              unread: true 
            });

            notifications.forEach(notification => {
              send({
                type: 'notification',
                data: {
                  id: notification._id.toString(),
                  title: notification.title,
                  message: notification.message,
                  type: notification.type,
                  projectTitle: notification.projectTitle,
                  clientName: notification.clientName,
                  amount: notification.amount,
                  unread: notification.unread,
                  time: getTimeAgo(notification.createdAt)
                },
                unreadCount
              });
            });
            lastCheck = new Date();
          }
        } catch (error) {
          console.error('Notification poll error:', error);
        }
      }, 15000);

      // Cleanup
      const cleanup = () => {
        console.log('🔌 SSE connection closed for user:', user.userId);
        isActive = false;
        clearInterval(heartbeat);
        clearInterval(poll);
        controller.close();
      };

      request.signal.addEventListener('abort', cleanup);
      setTimeout(cleanup, 15 * 60 * 1000); // 15 minutes
    },
    
    cancel() {
      isActive = false;
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}