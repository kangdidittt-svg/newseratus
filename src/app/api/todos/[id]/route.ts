import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Todo, { ITodo } from '@/models/Todo';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import mongoose from 'mongoose';

export const PUT = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid todo ID' }, { status: 400 });
    }

    const body = await request.json();
    const update: Partial<ITodo> = {};
    if (typeof body.title === 'string') update.title = body.title.trim();
    if (typeof body.notes === 'string') update.notes = body.notes.trim();
    if (typeof body.dueDateStr === 'string') update.dueDateStr = body.dueDateStr;
    if (typeof body.priority === 'string') update.priority = body.priority;
    if (typeof body.status === 'string') {
      update.status = body.status;
      if (body.status === 'done') {
        update.completedAt = new Date();
      } else {
        update.completedAt = undefined;
      }
    }

    if (typeof body.order === 'number') update.order = body.order;
    if (typeof body.projectId === 'string' && mongoose.Types.ObjectId.isValid(body.projectId)) {
      update.projectId = new mongoose.Types.ObjectId(body.projectId);
    }

    const updated = await Todo.findOneAndUpdate(
      { _id: id, userId: request.user?.userId },
      update,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Todo updated', todo: updated }, { status: 200 });
  } catch (error) {
    console.error('PUT todo error:', error);
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid todo ID' }, { status: 400 });
    }

    const deleted = await Todo.findOneAndDelete({ _id: id, userId: request.user?.userId });
    if (!deleted) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Todo deleted' }, { status: 200 });
  } catch (error) {
    console.error('DELETE todo error:', error);
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
});
