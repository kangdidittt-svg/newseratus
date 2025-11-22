import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import Project from '@/models/Project';

// Move project to studio library (mark as completed)
export const POST = withAuth(async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const userId = request.user?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    const body = await request.json();
    const { confirm } = body;

    const project = await Project.findOne({ _id: id, userId });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.status === 'completed') {
      return NextResponse.json({ error: 'Project is already in studio library' }, { status: 400 });
    }

    // Check if master link is empty and confirmation not provided
    if (!project.masterLink && !confirm) {
      return NextResponse.json({ 
        warning: 'Master link belum diisi. Tetap pindahkan ke Studio Library?',
        confirmRequired: true 
      }, { status: 200 });
    }

    project.status = 'completed';
    project.completedAt = new Date();
    await project.save();

    return NextResponse.json({ 
      message: 'Project moved to studio library successfully',
      project 
    });
  } catch (error) {
    console.error('Error moving project to studio library:', error);
    return NextResponse.json({ error: 'Failed to move project to studio library' }, { status: 500 });
  }
});

// Return project to active (mark as ongoing)
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const userId = request.user?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const project = await Project.findOne({ _id: id, userId });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.status === 'ongoing') {
      return NextResponse.json({ error: 'Project is already active' }, { status: 400 });
    }

    project.status = 'ongoing';
    project.completedAt = null;
    await project.save();

    return NextResponse.json({ 
      message: 'Project returned to active status successfully',
      project 
    });
  } catch (error) {
    console.error('Error returning project to active:', error);
    return NextResponse.json({ error: 'Failed to return project to active' }, { status: 500 });
  }
});