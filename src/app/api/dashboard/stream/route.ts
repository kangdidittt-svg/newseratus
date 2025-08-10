import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { extractToken, verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

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

// Helper function to get dashboard stats
async function getDashboardStats(userId: string) {
  await connectDB();
  
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  // Get all projects for the user
  const projects = await Project.find({ userId: userObjectId }).lean();
  
  // Calculate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const onHoldProjects = projects.filter(p => p.status === 'on-hold').length;
  
  const totalEarnings = projects
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.budget || 0), 0);
  
  const totalHours = projects.reduce((sum, p) => sum + (p.hoursWorked || 0), 0);
  const averageHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0;
  
  const totalPendingPayments = projects
    .filter(p => p.status === 'completed' && !p.paid)
    .reduce((sum, p) => sum + (p.budget || 0), 0);
  
  // Get recent projects (last 5)
  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(p => ({
      _id: (p._id as mongoose.Types.ObjectId).toString(),
      title: p.title,
      client: p.client,
      status: p.status,
      priority: p.priority,
      budget: p.budget,
      deadline: p.deadline,
      createdAt: p.createdAt
    }));
  
  return {
    stats: {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalEarnings,
      totalHours,
      averageHourlyRate,
      totalPendingPayments
    },
    recentProjects
  };
}

// Server-Sent Events endpoint for real-time dashboard updates
export async function GET(request: NextRequest) {
  // Authenticate user
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const user = auth.user!;

  console.log('🔌 Dashboard SSE connection established for user:', user.userId);

  const encoder = new TextEncoder();
  let isActive = true;
  
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        if (!isActive) return;
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send connection confirmation
      send({ type: 'connected', timestamp: Date.now() });

      // Send initial dashboard data
      const sendInitialData = async () => {
        try {
          const dashboardData = await getDashboardStats(user.userId);
          send({
            type: 'dashboard_update',
            data: dashboardData,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error('Error sending initial dashboard data:', error);
          // Send error notification to client
          send({
            type: 'error',
            message: 'Failed to load initial dashboard data',
            timestamp: Date.now()
          });
        }
      };
      sendInitialData();

      // Heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        if (isActive) {
          try {
            send({ type: 'heartbeat', timestamp: Date.now() });
          } catch (error) {
            console.error('Heartbeat error:', error);
            isActive = false;
          }
        }
      }, 30000);

      // Listen for project changes and send updates
      let lastUpdate = new Date();
      const pollForChanges = setInterval(async () => {
        if (!isActive) return;
        
        try {
          await connectDB();
          const userObjectId = new mongoose.Types.ObjectId(user.userId);
          
          // Check for any projects updated since last check
          const recentlyUpdated = await Project.find({
            userId: userObjectId,
            updatedAt: { $gt: lastUpdate }
          }).lean();

          if (recentlyUpdated.length > 0) {
            console.log(`📊 Dashboard: Found ${recentlyUpdated.length} updated projects, sending refresh`);
            const dashboardData = await getDashboardStats(user.userId);
            send({
              type: 'dashboard_update',
              data: dashboardData,
              timestamp: Date.now(),
              reason: 'project_updated'
            });
            lastUpdate = new Date();
          }
        } catch (error) {
          console.error('Dashboard poll error:', error);
          // Send error notification to client
          try {
            send({
              type: 'error',
              message: 'Failed to check for updates',
              timestamp: Date.now()
            });
          } catch (sendError) {
            console.error('Failed to send error message:', sendError);
            isActive = false;
          }
        }
      }, 10000); // Check every 10 seconds for changes

      // Cleanup
      const cleanup = () => {
        console.log('🔌 Dashboard SSE connection closed for user:', user.userId);
        isActive = false;
        clearInterval(heartbeat);
        clearInterval(pollForChanges);
        controller.close();
      };

      request.signal.addEventListener('abort', cleanup);
      setTimeout(cleanup, 30 * 60 * 1000); // 30 minutes timeout
    },
    
    cancel() {
      isActive = false;
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}