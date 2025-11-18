import JSZip from 'jszip';
import { generateDetailedInvoicePDF } from './pdfGenerator';
import Invoice from '@/models/Invoice';
import { generatePDFFilename } from './invoiceUtils';
import { Types } from 'mongoose';

export interface InvoicePDFData {
  invoiceNumber: string;
  invoiceDate: Date;
  projectTitle: string;
  billedToName: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  taxPercent: number;
  total: number;
  status: string;
}

/**
 * Generate multiple invoice PDFs and create ZIP archive
 */
export async function generateBulkInvoicePDFs(invoiceIds: string[], userId: string): Promise<Buffer> {
  try {
    const zip = new JSZip();
    const userObjectId = new Types.ObjectId(userId);

    // Find all invoices that belong to the user
    const invoices = await Invoice.find({
      _id: { $in: invoiceIds.map(id => new Types.ObjectId(id)) },
      userId: userObjectId
    }).lean();

    if (invoices.length === 0) {
      throw new Error('No valid invoices found');
    }

    // Generate PDF for each invoice
    for (const invoice of invoices) {
      const pdfData = {
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.createdAt,
        projectTitle: invoice.projectTitle,
        billedToName: invoice.billedToName,
        items: invoice.items,
        subtotal: invoice.subtotal,
        taxPercent: invoice.taxPercent,
        total: invoice.total,
        status: invoice.status
      };

      // Generate PDF
      const pdfBuffer = await generateDetailedInvoicePDF(pdfData);
      
      // Generate filename
      const filename = generatePDFFilename(invoice.invoiceNumber, invoice.billedToName);
      
      // Add to ZIP
      zip.file(filename, pdfBuffer);
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });

    return zipBuffer;
  } catch (error) {
    console.error('Bulk PDF generation error:', error);
    throw new Error('Failed to generate bulk invoice PDFs');
  }
}

/**
 * Generate ZIP filename with timestamp
 */
export function generateBulkZIPFilename(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `invoices_${dateStr}_${timeStr}.zip`;
}