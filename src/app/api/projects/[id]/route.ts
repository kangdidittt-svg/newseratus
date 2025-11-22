import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
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

// GET /api/projects/[id] - Get a specific project
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const user = auth.user!;
  const params = await context.params;

  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const project = await Project.findOne({
      _id: params.id,
      userId: user.userId
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { project },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a specific project
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const user = auth.user!;
  const params = await context.params;

  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Get the original project to check status change
    const originalProject = await Project.findOne({
      _id: params.id,
      userId: user.userId
    });

    if (!originalProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Normalize legacy status values if present
    if (updateData.status === 'active' || updateData.status === 'on-hold') {
      updateData.status = 'ongoing';
    }

    const project = await Project.findOneAndUpdate(
      {
        _id: params.id,
        userId: user.userId
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if project status changed to completed
    if (originalProject.status !== 'completed' && updateData.status === 'completed') {
      console.log('🎉 Project completed! Creating notification...');
      console.log('Original status:', originalProject.status);
      console.log('New status:', updateData.status);
      console.log('Project:', project.title, 'Client:', project.client);
      
      // Create completion notification
      const formattedBudget = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(project.budget || 0);

      const notification = new Notification({
        userId: user.userId,
        title: 'Project Completed! 🎉',
        message: `Kamu hebat banget! Selesaikan ${project.title} dari ${project.client} sudah beres, uang senilai ${formattedBudget} masuk ke total pendapatan ya`,
        type: 'project_completed',
        projectId: project._id,
        projectTitle: project.title,
        clientName: project.client,
        amount: project.budget
      });

      try {
        await notification.save();
        console.log('✅ Notification created successfully!');
      } catch (notifError) {
        console.error('❌ Error creating notification:', notifError);
      }
    } else {
      console.log('No status change to completed. Original:', originalProject.status, 'New:', updateData.status);
    }

    return NextResponse.json(
      { message: 'Project updated successfully', project },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a specific project
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const user = auth.user!;
  const params = await context.params;

  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const project = await Project.findOneAndDelete({
      _id: params.id,
      userId: user.userId
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Project deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}