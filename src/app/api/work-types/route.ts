import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import WorkType from '@/models/WorkType';

// GET all work types
export const GET = withAuth(async () => {
  try {
    const workTypes = await WorkType.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json(workTypes);
  } catch (error) {
    console.error('Error fetching work types:', error);
    return NextResponse.json({ error: 'Failed to fetch work types' }, { status: 500 });
  }
});

// CREATE new work type
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { name, category = 'Design' } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const workType = new WorkType({ name, category });
    await workType.save();

    return NextResponse.json(workType, { status: 201 });
  } catch (error) {
    console.error('Error creating work type:', error);
    return NextResponse.json({ error: 'Failed to create work type' }, { status: 500 });
  }
});