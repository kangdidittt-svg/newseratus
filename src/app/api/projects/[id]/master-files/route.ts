import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

// Update project master files
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id } = await params;
    const userId = request.user?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    const body = await request.json();
    let { masterLink, masterNotes } = body as { masterLink?: string; masterNotes?: string };

    if (typeof masterLink === 'string') {
      masterLink = masterLink.trim();
    }
    if (typeof masterNotes === 'string') {
      masterNotes = masterNotes.trim();
    }

    const project = await Project.findOne({ _id: id, userId });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (masterLink !== undefined) project.masterLink = masterLink;
    if (masterNotes !== undefined) project.masterNotes = masterNotes;

    await project.save();

    return NextResponse.json({ 
      message: 'Master files updated successfully',
      project 
    });
  } catch (error) {
    console.error('Error updating project master files:', error);
    return NextResponse.json({ error: 'Failed to update master files' }, { status: 500 });
  }
});