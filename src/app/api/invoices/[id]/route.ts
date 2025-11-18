import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import mongoose from 'mongoose';

// GET /api/invoices/:id - Get single invoice by ID
export const GET = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  const { params } = await context;
  try {
    await connectDB();
    
    const { id } = await params;
    const userObjectId = new mongoose.Types.ObjectId(request.user?.userId);
    
    // Validate invoice ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }

    const invoiceObjectId = new mongoose.Types.ObjectId(id);
    
    // Find invoice that belongs to user
    const invoice = await Invoice.findOne({
      _id: invoiceObjectId,
      userId: userObjectId
    }).lean();

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { invoice },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/invoices/:id - Update invoice (client name only)
export const PUT = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  const { params } = await context;
  try {
    await connectDB();
    
    const { id } = await params;
    const userObjectId = new mongoose.Types.ObjectId(request.user?.userId);
    
    // Validate invoice ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    // Only allow updating billedToName for snapshot integrity
    if (!updateData.billedToName || updateData.billedToName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Billed to name is required' },
        { status: 400 }
      );
    }

    const invoiceObjectId = new mongoose.Types.ObjectId(id);
    
    // Find invoice that belongs to user
    const invoice = await Invoice.findOne({
      _id: invoiceObjectId,
      userId: userObjectId
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Update only the billedToName
    invoice.billedToName = updateData.billedToName.trim();
    await invoice.save();

    return NextResponse.json(
      {
        message: 'Invoice updated successfully',
        invoice: {
          _id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          projectId: invoice.projectId,
          projectTitle: invoice.projectTitle,
          billedToName: invoice.billedToName,
          items: invoice.items,
          subtotal: invoice.subtotal,
          taxPercent: invoice.taxPercent,
          total: invoice.total,
          status: invoice.status,
          createdAt: invoice.createdAt,
          updatedAt: invoice.updatedAt
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/invoices/:id - Delete invoice
export const DELETE = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  const { params } = await context;
  try {
    await connectDB();
    const { id } = await params;
    const userObjectId = new mongoose.Types.ObjectId(request.user?.userId);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }
    const invoiceObjectId = new mongoose.Types.ObjectId(id);
    const deleted = await Invoice.findOneAndDelete({
      _id: invoiceObjectId,
      userId: userObjectId
    });
    if (!deleted) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: 'Invoice deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});