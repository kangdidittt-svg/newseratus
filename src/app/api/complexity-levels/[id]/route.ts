import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import ComplexityLevel from '@/models/ComplexityLevel';

// UPDATE complexity level
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, weight, isActive } = body;

    const complexityLevel = await ComplexityLevel.findByIdAndUpdate(
      id,
      { name, weight, isActive },
      { new: true, runValidators: true }
    );

    if (!complexityLevel) {
      return NextResponse.json({ error: 'Complexity level not found' }, { status: 404 });
    }

    return NextResponse.json(complexityLevel);
  } catch (error) {
    console.error('Error updating complexity level:', error);
    return NextResponse.json({ error: 'Failed to update complexity level' }, { status: 500 });
  }
});

// DELETE complexity level (soft delete)
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    void request;
    const { id } = await params;
    
    const complexityLevel = await ComplexityLevel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!complexityLevel) {
      return NextResponse.json({ error: 'Complexity level not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Complexity level deleted successfully' });
  } catch (error) {
    console.error('Error deleting complexity level:', error);
    return NextResponse.json({ error: 'Failed to delete complexity level' }, { status: 500 });
  }
});
