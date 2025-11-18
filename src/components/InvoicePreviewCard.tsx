'use client';

import { formatDate } from '@/lib/invoiceUtils';

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoicePreviewData {
  invoiceNumber: string;
  projectTitle: string;
  billedToName: string;
  items: InvoiceItem[];
  subtotal: number;
  taxPercent: number;
  total: number;
  status: string;
  createdAt: Date;
}

interface InvoicePreviewCardProps {
  invoice: InvoicePreviewData;
  className?: string;
}

export default function InvoicePreviewCard({ invoice, className = '' }: InvoicePreviewCardProps) {
  const taxAmount = invoice.subtotal * (invoice.taxPercent / 100);

  return (
    <div className={`app-card p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-600">INVOICE</h2>
          <p className="text-sm app-muted mt-1">#{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm app-muted">Date: {formatDate(invoice.createdAt)}</p>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {invoice.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Bill To and Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-sm font-semibold app-muted mb-2">BILL TO:</h3>
          <p className="font-medium">{invoice.billedToName}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold app-muted mb-2">PROJECT:</h3>
          <p className="font-medium">{invoice.projectTitle}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--neuro-text-primary)' }}>ITEMS:</h3>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ color: 'var(--neuro-text-primary)' }}>
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--neuro-border)' }}>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--neuro-muted)' }}>Description</th>
                <th className="text-center py-3 px-4 text-sm font-medium" style={{ color: 'var(--neuro-muted)' }}>Quantity</th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: 'var(--neuro-muted)' }}>Rate</th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: 'var(--neuro-muted)' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b" style={{ borderColor: 'var(--neuro-border)' }}>
                  <td className="py-3 px-4 text-sm">{item.description}</td>
                  <td className="py-3 px-4 text-sm text-center">{item.quantity}</td>
                  <td className="py-3 px-4 text-sm text-right">
                    {item.rate.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium">
                    {item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full md:w-1/3">
          <div className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="app-muted">Subtotal:</span>
              <span className="font-medium">
                {invoice.subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
              </span>
            </div>
            {invoice.taxPercent > 0 && (
              <div className="flex justify-between py-2">
                <span className="app-muted">Tax ({invoice.taxPercent}%):</span>
                <span className="font-medium">
                  {taxAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t border-gray-200 text-lg font-bold">
              <span>Total:</span>
              <span>
                {invoice.total.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm app-muted text-center">
          Thank you for your business! Payment due within 30 days.
        </p>
      </div>
    </div>
  );
}