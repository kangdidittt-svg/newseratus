import PDFDocument from 'pdfkit';
import { formatCurrency, formatDate } from './invoiceUtils';

export interface IInvoiceItem {
  description: string;
  subDescription?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoicePDFData {
  invoiceNumber: string;
  invoiceDate: Date;
  projectTitle: string;
  billedToName: string;
  items: IInvoiceItem[];
  subtotal: number;
  taxPercent: number;
  total: number;
  status: string;
}

/**
 * Generate invoice PDF menggunakan PDFKit
 */
export function generateInvoicePDF(invoice: InvoicePDFData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 });
  const buffers: Buffer[] = [];

  // Collect buffers
  doc.on('data', buffers.push.bind(buffers));
  
  // Header
  doc.fontSize(24).text('INVOICE', 50, 50);
  doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 90);
  doc.text(`Invoice Date: ${formatDate(invoice.invoiceDate)}`, 50, 110);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 50, 130);

  // From/To section
  doc.fontSize(14).text('BILL TO:', 50, 170);
  doc.fontSize(12).text(invoice.billedToName, 50, 190);
  
  doc.fontSize(14).text('PROJECT:', 300, 170);
  doc.fontSize(12).text(invoice.projectTitle, 300, 190);

  // Items table header
  let y = 250;
  doc.fontSize(12).text('DESCRIPTION', 50, y);
  doc.text('QUANTITY', 300, y);
  doc.text('RATE', 380, y);
  doc.text('AMOUNT', 460, y);
  
  // Line separator
  y += 20;
  doc.moveTo(50, y).lineTo(550, y).stroke();
  y += 20;

  // Items
  invoice.items.forEach((item) => {
    const startY = y;
    doc.fontSize(11).fillColor('#1e293b').text(item.description, 50, y, { width: 230 });
    if (item.subDescription) {
      y += 14;
      doc.fontSize(9).fillColor('#64748b').text(item.subDescription, 50, y, { width: 230 });
    }
    doc.fontSize(11).fillColor('#1e293b');
    doc.text(item.quantity.toString(), 300, startY);
    doc.text(formatCurrency(item.rate), 380, startY);
    doc.text(formatCurrency(item.amount), 460, startY);
    y += 24;
  });

  // Line separator
  y += 10;
  doc.moveTo(300, y).lineTo(550, y).stroke();
  y += 20;

  // Totals
  doc.fontSize(12).text('Subtotal:', 380, y);
  doc.text(formatCurrency(invoice.subtotal), 460, y);
  
  if (invoice.taxPercent > 0) {
    y += 20;
    doc.text(`Tax (${invoice.taxPercent}%):`, 380, y);
    doc.text(formatCurrency(invoice.subtotal * invoice.taxPercent / 100), 460, y);
  }
  
  y += 20;
  doc.fontSize(14).text('TOTAL:', 380, y);
  doc.text(formatCurrency(invoice.total), 460, y);

  // Footer
  doc.fontSize(10).text('Thank you for your business!', 50, 700);
  doc.text('Payment due within 30 days', 50, 720);

  // Finalize PDF
  doc.end();

  // Wait for the stream to finish
  return new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);
  });
}

/**
 * Generate invoice PDF dengan template yang lebih detail
 */
export function generateDetailedInvoicePDF(invoice: InvoicePDFData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const buffers: Buffer[] = [];

  doc.on('data', buffers.push.bind(buffers));

  // Colors
  const primaryColor = '#3b82f6';
  const textColor = '#374151';
  const lightGray = '#f3f4f6';

  // Header with background
  doc.rect(0, 0, 612, 110).fill('#0f172a');
  doc.fillColor('white').fontSize(24).text('INVOICE', 50, 35);
  doc.fontSize(11).fillColor('#94a3b8').text('Overthinklabs.id', 50, 65);
  
  // Invoice info
  doc.fontSize(11).fillColor('white');
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 400, 35);
  doc.text(`Date: ${formatDate(invoice.invoiceDate)}`, 400, 55);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 400, 75);

  // PAID Stamp Overlay if status is paid
  if (invoice.status.toLowerCase() === 'paid') {
    doc.save();
    doc.rotate(-12, { origin: [480, 75] });
    doc.rect(435, 55, 100, 36).lineWidth(2).dash(4, { space: 2 }).strokeColor('#059669').stroke();
    doc.undash();
    doc.fontSize(18).fillColor('#059669').text('PAID', 435, 61, { width: 100, align: 'center' });
    doc.fontSize(7).fillColor('#047857').text('PAYMENT RECEIVED', 435, 80, { width: 100, align: 'center' });
    doc.restore();
  }

  // Reset color
  doc.fillColor(textColor);

  // From / Bill To / Project section
  let y = 135;
  doc.fontSize(10).fillColor('#64748b').text('FROM:', 50, y);
  doc.fontSize(12).fillColor('#0f172a').text('Overthinklabs.id', 50, y + 15);

  doc.fontSize(10).fillColor('#64748b').text('BILL TO:', 220, y);
  doc.fontSize(12).fillColor('#0f172a').text(invoice.billedToName, 220, y + 15);

  doc.fontSize(10).fillColor('#64748b').text('PROJECT:', 390, y);
  doc.fontSize(12).fillColor('#0f172a').text(invoice.projectTitle, 390, y + 15);

  // Items table with headers
  y = 210;
  
  // Table header background
  doc.rect(50, y - 10, 500, 30).fill(lightGray);
  
  doc.fontSize(12).fillColor(textColor);
  doc.text('Description', 60, y);
  doc.text('Quantity', 300, y);
  doc.text('Rate', 350, y);
  doc.text('Amount', 450, y);
  
  y += 30;

  // Items
  invoice.items.forEach((item, index) => {
    const rowHeight = item.subDescription ? 40 : 25;
    // Alternate row background
    if (index % 2 === 0) {
      doc.rect(50, y - 5, 500, rowHeight).fill('#f9fafb');
    }
    
    doc.fillColor(textColor);
    doc.fontSize(11).text(item.description, 60, y, { width: 230 });
    if (item.subDescription) {
      doc.fontSize(9).fillColor('#6b7280').text(item.subDescription, 60, y + 14, { width: 230 });
    }
    doc.fontSize(11).fillColor(textColor);
    doc.text(item.quantity.toString(), 300, y);
    doc.text(formatCurrency(item.rate), 350, y);
    doc.text(formatCurrency(item.amount), 450, y);
    y += rowHeight;
  });

  // Totals section
  y += 20;
  doc.rect(350, y, 200, 100).stroke();
  
  let totalY = y + 10;
  doc.fontSize(12).text('Subtotal:', 360, totalY);
  doc.text(formatCurrency(invoice.subtotal), 480, totalY);
  
  if (invoice.taxPercent > 0) {
    totalY += 20;
    doc.text(`Tax (${invoice.taxPercent}%):`, 360, totalY);
    doc.text(formatCurrency(invoice.subtotal * invoice.taxPercent / 100), 480, totalY);
  }
  
  totalY += 20;
  doc.fontSize(14).text('TOTAL:', 360, totalY);
  doc.text(formatCurrency(invoice.total), 480, totalY);

  // Footer
  doc.fontSize(10).text('Thank you for your business!', 50, 700);
  doc.text('Payment due within 30 days', 50, 720);

  // Finalize PDF
  doc.end();

  return new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);
  });
}