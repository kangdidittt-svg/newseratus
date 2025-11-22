import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import Project from '@/models/Project';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const projects = await Project.find({
      userId,
      status: { $in: ['completed'] }
    })
      .populate('workTypeId', 'name')
      .populate('complexityId', 'name')
      .sort({ completedAt: -1 })
      .select('title client category workTypeId complexityId completedAt masterLink masterNotes');

    // Transform the data to match the expected format
    const transformedProjects = projects.map(project => ({
      _id: project._id,
      title: project.title,
      client: project.client,
      category: project.category,
      workType: project.workTypeId ? { name: (project.workTypeId as {name: string}).name } : undefined,
      complexity: project.complexityId ? { name: (project.complexityId as {name: string}).name } : undefined,
      completedAt: project.completedAt,
      masterLink: project.masterLink,
      masterNotes: project.masterNotes
    }));

    return NextResponse.json(transformedProjects);
  } catch (error) {
    console.error('Error fetching studio library projects:', error);
    return NextResponse.json({ error: 'Failed to fetch studio library projects' }, { status: 500 });
  }
});