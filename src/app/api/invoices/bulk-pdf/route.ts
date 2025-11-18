import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { generateBulkInvoicePDFs } from '@/lib/bulkPDFGenerator';
import { generateBulkZIPFilename } from '@/lib/invoiceServerUtils';

// POST /api/invoices/bulk-pdf - Generate ZIP with multiple invoice PDFs
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    const { invoiceIds } = await request.json();
    
    // Validate input
    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json(
        { error: 'Invoice IDs array is required' },
        { status: 400 }
      );
    }

    // Limit maximum number of invoices for performance
    if (invoiceIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 invoices allowed per bulk export' },
        { status: 400 }
      );
    }

    // Generate ZIP with PDFs
    const userId = request.user?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }
    const zipBuffer = await generateBulkInvoicePDFs(invoiceIds, userId);
    
    // Generate filename
    const filename = generateBulkZIPFilename();

    // Return ZIP as downloadable file
    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Bulk PDF export error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'No valid invoices found') {
        return NextResponse.json(
          { error: 'No valid invoices found for the provided IDs' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate bulk PDF export' },
      { status: 500 }
    );
  }
});