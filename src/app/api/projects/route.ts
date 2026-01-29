import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import mongoose from 'mongoose';

interface ProjectFilter {
  userId: mongoose.Types.ObjectId;
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
    const month = searchParams.get('month');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const rawLimit = searchParams.get('limit') || '10';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = rawLimit === 'all' ? 0 : parseInt(rawLimit);
    const skip = limit === 0 ? 0 : (page - 1) * limit;

    // Build filter
    const userObjectId = new mongoose.Types.ObjectId(request.user?.userId);
    const filter: ProjectFilter = { userId: userObjectId };
    if (status) {
      const s = status.toLowerCase();
      if (['active', 'in progress', 'pending', 'on-hold', 'ongoing'].includes(s)) {
        filter.status = 'ongoing';
      } else {
        filter.status = status;
      }
    }
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const dateFilter: { createdAt?: { $gte?: Date; $lte?: Date } } = {};
    if (month) {
      const [y, m] = month.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        const startMonth = new Date(y, m - 1, 1);
        const endMonth = new Date(y, m, 0, 23, 59, 59, 999);
        dateFilter.createdAt = { $gte: startMonth, $lte: endMonth };
      }
    } else if (start || end) {
      const startDate = start ? new Date(start) : undefined;
      const endDate = end ? new Date(new Date(end).setHours(23, 59, 59, 999)) : undefined;
      if (startDate && endDate) {
        dateFilter.createdAt = { $gte: startDate, $lte: endDate };
      } else if (startDate) {
        dateFilter.createdAt = { $gte: startDate };
      } else if (endDate) {
        dateFilter.createdAt = { $lte: endDate };
      }
    }

    const query: ProjectFilter & { createdAt?: { $gte?: Date; $lte?: Date } } = { ...filter, ...(Object.keys(dateFilter).length ? dateFilter : {}) };

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Project.countDocuments(query);

    return NextResponse.json(
      {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: limit === 0 ? 1 : Math.ceil(total / limit)
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

    // Normalize legacy status values
    if (projectData.status === 'active' || projectData.status === 'on-hold') {
      projectData.status = 'ongoing';
    }
    
    // Validate required fields
    if (!projectData.title || !projectData.client || !projectData.category) {
      return NextResponse.json(
        { error: 'Title, client, and category are required' },
        { status: 400 }
      );
    }

    // Create project
    const userObjectId = new mongoose.Types.ObjectId(request.user?.userId);
    const project = new Project({
      ...projectData,
      userId: userObjectId
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
