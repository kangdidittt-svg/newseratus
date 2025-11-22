import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import WorkType from '@/models/WorkType';

// UPDATE work type
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category, isActive } = body;

    const workType = await WorkType.findByIdAndUpdate(
      id,
      { name, category, isActive },
      { new: true, runValidators: true }
    );

    if (!workType) {
      return NextResponse.json({ error: 'Work type not found' }, { status: 404 });
    }

    return NextResponse.json(workType);
  } catch (error) {
    console.error('Error updating work type:', error);
    return NextResponse.json({ error: 'Failed to update work type' }, { status: 500 });
  }
});

// DELETE work type (soft delete)
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    
    const workType = await WorkType.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!workType) {
      return NextResponse.json({ error: 'Work type not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Work type deleted successfully' });
  } catch (error) {
    console.error('Error deleting work type:', error);
    return NextResponse.json({ error: 'Failed to delete work type' }, { status: 500 });
  }
});