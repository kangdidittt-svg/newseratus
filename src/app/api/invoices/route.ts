import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Project from '@/models/Project';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { validateInvoiceData } from '@/lib/invoiceUtils';
import { generateInvoiceNumber } from '@/lib/invoiceServerUtils';
import mongoose from 'mongoose';

interface InvoiceFilter {
  userId: mongoose.Types.ObjectId;
  status?: string;
}

// GET /api/invoices - Get all invoices for the authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter
    const userObjectId = new mongoose.Types.ObjectId(request.user?.userId);
    const filter: InvoiceFilter = { userId: userObjectId };
    if (status) filter.status = status;

    // Get invoices with pagination
    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Invoice.countDocuments(filter);

    return NextResponse.json(
      {
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/invoices - Create a new invoice
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    const invoiceData = await request.json();
    
    // Validate required fields
    if (!invoiceData.projectId || !invoiceData.billedToName || !invoiceData.items) {
      return NextResponse.json(
        { error: 'Project ID, billed to name, and items are required' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
    const projectObjectId = new mongoose.Types.ObjectId(invoiceData.projectId);
    const userObjectId = new mongoose.Types.ObjectId(request.user?.userId);
    
    const project = await Project.findOne({
      _id: projectObjectId,
      userId: userObjectId
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or does not belong to user' },
        { status: 404 }
      );
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Prepare invoice data with snapshot behavior
    interface InvoiceItemData {
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }
    
    const createInvoiceData = {
      projectId: projectObjectId.toString(),
      projectTitle: project.title,
      billedToName: invoiceData.billedToName.trim(),
      items: invoiceData.items.map((item: InvoiceItemData) => ({
        description: item.description?.trim() || '',
        quantity: Number(item.quantity) || 0,
        rate: Number(item.rate) || 0,
        amount: Number(item.amount) || 0
      })),
      taxPercent: Number(invoiceData.taxPercent) || 0,
      subtotal: Number(invoiceData.subtotal) || 0,
      total: Number(invoiceData.total) || 0,
      userId: userObjectId.toString()
    };

    // Validate invoice data
    const validation = validateInvoiceData(createInvoiceData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Create invoice
    const invoice = new Invoice({
      ...createInvoiceData,
      invoiceNumber
    });

    await invoice.save();

    return NextResponse.json(
      {
        message: 'Invoice created successfully',
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
          createdAt: invoice.createdAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create invoice error:', error);
    
    // Handle duplicate invoice number
    if (error instanceof Error && error.message.includes('duplicate key error')) {
      return NextResponse.json(
        { error: 'Invoice number already exists. Please try again.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});