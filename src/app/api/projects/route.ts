import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

interface ProjectFilter {
  userId: string;
  status?: string;
  category?: string;
  priority?: string;
}

// GET /api/projects - Get all projects for the authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter
    const filter: ProjectFilter = { userId: request.user?.userId || '' };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Get projects with pagination
    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Project.countDocuments(filter);

    return NextResponse.json(
      {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/projects - Create a new project
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    const projectData = await request.json();
    
    // Validate required fields
    if (!projectData.title || !projectData.client || !projectData.category) {
      return NextResponse.json(
        { error: 'Title, client, and category are required' },
        { status: 400 }
      );
    }

    // Create project
    const project = new Project({
      ...projectData,
      userId: request.user?.userId
    });

    await project.save();

    return NextResponse.json(
      {
        message: 'Project created successfully',
        project
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});