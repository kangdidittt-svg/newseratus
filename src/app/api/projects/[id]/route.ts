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