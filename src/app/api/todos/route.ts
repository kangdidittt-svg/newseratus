import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Todo, { ITodo } from '@/models/Todo';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import mongoose from 'mongoose';

function todayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysStr(base: string, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter') || 'today';
    const userId = new mongoose.Types.ObjectId(request.user?.userId);

    const query: Record<string, unknown> = { userId };
    const t = todayStr();
    const tomorrow = addDaysStr(t, 1);

    switch (filter) {
      case 'today':
        query.dueDateStr = t;
        break;
      case 'tomorrow':
        query.dueDateStr = tomorrow;
        break;
      case 'upcoming':
        query.dueDateStr = { $gt: tomorrow };
        break;
      case 'all':
      default:
        break;
    }

    const todos = await Todo.find(query).sort({ status: 1, order: 1, dueDateStr: 1, createdAt: -1 }).lean();
    return NextResponse.json({ todos }, { status: 200 });
  } catch (error) {
    console.error('GET todos error:', error);
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
});

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await request.json();
    const title: string = (body.title || '').trim();
    const notes: string = (body.notes || '').trim();
    const dueDateStr: string = (body.dueDateStr || todayStr());
    const priority: 'low' | 'medium' | 'high' = body.priority || 'medium';
    const projectIdStr: string | undefined = body.projectId;
    const userId = new mongoose.Types.ObjectId(request.user?.userId);

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const doc: Partial<ITodo> & { userId: mongoose.Types.ObjectId } = {
      title,
      notes,
      dueDateStr,
      priority,
      status: 'pending',
      userId
    };

    if (projectIdStr && mongoose.Types.ObjectId.isValid(projectIdStr)) {
      doc.projectId = new mongoose.Types.ObjectId(projectIdStr);
    }

    const todo = new Todo(doc);
    await todo.save();
    return NextResponse.json({ message: 'Todo created', todo }, { status: 201 });
  } catch (error) {
    console.error('POST todo error:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
});
