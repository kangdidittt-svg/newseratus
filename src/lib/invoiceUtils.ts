// Client-side utility functions - tidak import model Mongoose di sini

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CreateInvoiceData {
  projectId: string;
  projectTitle: string;
  billedToName: string;
  items: InvoiceItem[];
  taxPercent: number;
  subtotal: number;
  total: number;
  userId: string;
}



/**
 * Hitung subtotal dari items
 */
export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

/**
 * Hitung total dengan tax
 */
export function calculateTotal(subtotal: number, taxPercent: number): number {
  return subtotal + (subtotal * taxPercent / 100);
}

/**
 * Validasi invoice data sebelum create
 */
export function validateInvoiceData(data: CreateInvoiceData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.projectId || data.projectId.trim().length === 0) {
    errors.push('Project ID is required');
  }

  if (!data.projectTitle || data.projectTitle.trim().length === 0) {
    errors.push('Project title is required');
  }

  if (!data.billedToName || data.billedToName.trim().length === 0) {
    errors.push('Billed to name is required');
  }

  if (!data.items || data.items.length === 0) {
    errors.push('At least one item is required');
  } else {
    data.items.forEach((item, index) => {
      if (!item.description || item.description.trim().length === 0) {
        errors.push(`Item ${index + 1}: Description is required`);
      }
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be positive`);
      }
      if (item.rate < 0) {
        errors.push(`Item ${index + 1}: Rate cannot be negative`);
      }
      if (item.amount < 0) {
        errors.push(`Item ${index + 1}: Amount cannot be negative`);
      }
    });
  }

  if (data.taxPercent < 0 || data.taxPercent > 100) {
    errors.push('Tax percentage must be between 0 and 100');
  }

  if (data.subtotal < 0) {
    errors.push('Subtotal cannot be negative');
  }

  if (data.total < 0) {
    errors.push('Total cannot be negative');
  }

  // Validasi kalkulasi
  const calculatedSubtotal = calculateSubtotal(data.items);
  if (Math.abs(data.subtotal - calculatedSubtotal) > 0.01) {
    errors.push('Subtotal does not match items total');
  }

  const calculatedTotal = calculateTotal(data.subtotal, data.taxPercent);
  if (Math.abs(data.total - calculatedTotal) > 0.01) {
    errors.push('Total calculation is incorrect');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format currency ke format USD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format tanggal ke format Indonesia
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

/**
 * Generate PDF filename untuk invoice
 */
export function generatePDFFilename(invoiceNumber: string, billedToName: string): string {
  const sanitizedClient = billedToName.replace(/[^a-zA-Z0-9]/g, '_');
  return `Invoice_${invoiceNumber}_${sanitizedClient}.pdf`;
}