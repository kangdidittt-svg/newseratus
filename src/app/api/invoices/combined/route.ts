import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Project from '@/models/Project';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { validateInvoiceData, CreateInvoiceData } from '@/lib/invoiceUtils';
import { generateInvoiceNumber } from '@/lib/invoiceServerUtils';
import mongoose from 'mongoose';

interface InvoiceItemData {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();

    const body = await request.json();
    const primaryProjectId: string = body.primaryProjectId;
    const items: InvoiceItemData[] = Array.isArray(body.items) ? body.items : [];
    const taxPercent: number = Number(body.taxPercent) || 0;
    const subtotal: number = Number(body.subtotal) || 0;
    const total: number = Number(body.total) || 0;
    const billedToNameInput: string = (body.billedToName || '').trim();
    const userObjectId = new mongoose.Types.ObjectId(request.user?.userId);

    if (!primaryProjectId) {
      return NextResponse.json({ error: 'primaryProjectId is required' }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    const projectObjectId = new mongoose.Types.ObjectId(primaryProjectId);
    const primaryProject = await Project.findOne({ _id: projectObjectId, userId: userObjectId });
    if (!primaryProject) {
      return NextResponse.json({ error: 'Primary project not found or not owned' }, { status: 404 });
    }

    const billedToName = billedToNameInput || 'Multiple Clients';

    const invoiceNumber = await generateInvoiceNumber();

    const createInvoiceData: CreateInvoiceData = {
      projectId: projectObjectId.toString(),
      projectTitle: 'Multiple Projects',
      billedToName,
      items: items.map((item) => ({
        description: item.description?.trim() || '',
        quantity: Number(item.quantity) || 0,
        rate: Number(item.rate) || 0,
        amount: Number(item.amount) || 0,
      })),
      taxPercent,
      subtotal,
      total,
      userId: userObjectId.toString(),
    };

    const validation = validateInvoiceData(createInvoiceData);
    if (!validation.isValid) {
      return NextResponse.json({ error: 'Validation failed', details: validation.errors }, { status: 400 });
    }

    const invoice = new Invoice({ ...createInvoiceData, invoiceNumber });
    await invoice.save();

    return NextResponse.json({ message: 'Combined invoice created', invoice }, { status: 201 });
  } catch (error) {
    console.error('Create combined invoice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});