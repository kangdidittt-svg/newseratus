// Server-side invoice utilities
import Invoice from '@/models/Invoice';

/**
 * Generate invoice number dengan format INV-YYYYMM-XXX
 * Contoh: INV-202412-001
 */
export async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `INV-${year}${month}`;
  
  try {
    // Cari invoice terakhir dengan prefix yang sama
    const lastInvoice = await Invoice.findOne({
      invoiceNumber: { $regex: `^${prefix}` }
    }).sort({ invoiceNumber: -1 });
    
    let sequence = 1;
    
    if (lastInvoice) {
      // Ekstrak nomor urut dari invoice terakhir
      const lastNumber = parseInt(lastInvoice.invoiceNumber.slice(-3));
      sequence = lastNumber + 1;
    }
    
    // Format nomor urut dengan 3 digit
    const sequenceStr = String(sequence).padStart(3, '0');
    
    return `${prefix}-${sequenceStr}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback ke nomor default
    return `${prefix}-001`;
  }
}

/**
 * Generate filename untuk PDF invoice
 */
export function generatePDFFilename(invoiceNumber: string, billedToName: string): string {
  const sanitizedClient = billedToName.replace(/[^a-zA-Z0-9]/g, '_');
  return `Invoice_${invoiceNumber}_${sanitizedClient}.pdf`;
}

/**
 * Generate filename untuk bulk ZIP
 */
export function generateBulkZIPFilename(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return `Invoices_${dateStr}.zip`;
}