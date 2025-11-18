import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { generateDetailedInvoicePDF } from '@/lib/pdfGenerator';

interface InvoiceItemData {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const billedToName: string = (body.billedToName || '').trim();
    const items: InvoiceItemData[] = Array.isArray(body.items) ? body.items : [];
    const taxPercent: number = Number(body.taxPercent) || 0;
    const subtotal: number = Number(body.subtotal) || 0;
    const total: number = Number(body.total) || 0;
    const clients: string[] = Array.isArray(body.clients) ? body.clients : [];

    if (items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    const calcSubtotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const calcTotal = calcSubtotal + (calcSubtotal * taxPercent / 100);
    const diffSubtotal = Math.abs(subtotal - calcSubtotal);
    const diffTotal = Math.abs(total - calcTotal);
    if (diffSubtotal > 0.01 || diffTotal > 0.01) {
      return NextResponse.json({ error: 'Total calculation mismatch' }, { status: 400 });
    }

    const invoiceNumber = `COMBINED-${Date.now()}`;
    const uniqueClients = Array.from(new Set(clients.filter(Boolean)));
    const displayBilledTo = billedToName || (uniqueClients.length > 1 ? 'Multiple Clients' : (uniqueClients[0] || ''));

    const pdfBuffer = await generateDetailedInvoicePDF({
      invoiceNumber,
      invoiceDate: new Date(),
      projectTitle: 'Multiple Projects',
      billedToName: displayBilledTo,
      items,
      subtotal,
      taxPercent,
      total,
      status: 'pending'
    });

    const filename = `Combined_Invoice_${new Date().toISOString().split('T')[0]}.pdf`;
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Generate combined PDF error:', error);
    return NextResponse.json({ error: 'Failed to generate combined PDF' }, { status: 500 });
  }
});
export const runtime = 'nodejs';