import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import ComplexityLevel from '@/models/ComplexityLevel';

// GET all complexity levels
export const GET = withAuth(async () => {
  try {
    const complexityLevels = await ComplexityLevel.find({ isActive: true }).sort({ weight: 1 });
    return NextResponse.json(complexityLevels);
  } catch (error) {
    console.error('Error fetching complexity levels:', error);
    return NextResponse.json({ error: 'Failed to fetch complexity levels' }, { status: 500 });
  }
});

// CREATE new complexity level
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { name, weight } = body;

    if (!name || weight === undefined) {
      return NextResponse.json({ error: 'Name and weight are required' }, { status: 400 });
    }

    const complexityLevel = new ComplexityLevel({ name, weight });
    await complexityLevel.save();

    return NextResponse.json(complexityLevel, { status: 201 });
  } catch (error) {
    console.error('Error creating complexity level:', error);
    return NextResponse.json({ error: 'Failed to create complexity level' }, { status: 500 });
  }
});