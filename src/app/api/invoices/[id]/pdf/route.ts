import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { generateDetailedInvoicePDF } from '@/lib/pdfGenerator';
import { generatePDFFilename } from '@/lib/invoiceServerUtils';
import mongoose from 'mongoose';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  createdAt: Date;
  projectTitle: string;
  billedToName: string;
  items: InvoiceItem[];
  subtotal: number;
  taxPercent: number;
  total: number;
  status: string;
}

// POST /api/invoices/:id/pdf - Generate PDF for single invoice
export const POST = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
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

    // Prepare PDF data with proper typing
    const typedInvoice = invoice as unknown as InvoiceData;
    const pdfData = {
      invoiceNumber: typedInvoice.invoiceNumber,
      invoiceDate: typedInvoice.createdAt,
      projectTitle: typedInvoice.projectTitle,
      billedToName: typedInvoice.billedToName,
      items: typedInvoice.items,
      subtotal: typedInvoice.subtotal,
      taxPercent: typedInvoice.taxPercent,
      total: typedInvoice.total,
      status: typedInvoice.status
    };

    // Generate PDF
    const pdfBuffer = await generateDetailedInvoicePDF(pdfData);
    
    // Generate filename
    const filename = generatePDFFilename(typedInvoice.invoiceNumber, typedInvoice.billedToName);

    // Return PDF as downloadable file
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Generate PDF error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
});