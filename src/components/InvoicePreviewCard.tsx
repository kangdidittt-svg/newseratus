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
  containerId?: string;
}

export default function InvoicePreviewCard({ invoice, className = '', containerId }: InvoicePreviewCardProps) {
  const taxAmount = invoice.subtotal * (invoice.taxPercent / 100);

  return (
    <div id={containerId || 'invoice-preview'} className={`neuro-card p-6 ${className}`} style={{ color: 'var(--neuro-text-primary)' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--neuro-orange)' }}>INVOICE</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--neuro-text-secondary)' }}>#{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>Date: {formatDate(invoice.createdAt)}</p>
          <span
            className="inline-block px-2 py-1 rounded-full text-xs font-medium mt-2"
            style={{
              backgroundColor:
                invoice.status === 'paid'
                  ? 'var(--neuro-success-light)'
                  : invoice.status === 'overdue'
                  ? 'var(--neuro-error-light)'
                  : 'var(--neuro-warning-light)',
              color:
                invoice.status === 'paid'
                  ? 'var(--neuro-success)'
                  : invoice.status === 'overdue'
                  ? 'var(--neuro-error)'
                  : 'var(--neuro-warning)'
            }}
          >
            {invoice.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Bill To and Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-secondary)' }}>BILL TO:</h3>
          <p className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>{invoice.billedToName}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-secondary)' }}>PROJECT:</h3>
          <p className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>{invoice.projectTitle}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--neuro-text-primary)' }}>ITEMS:</h3>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ color: 'var(--neuro-text-primary)' }}>
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--neuro-border)' }}>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--neuro-text-secondary)' }}>Description</th>
                <th className="text-center py-3 px-4 text-sm font-medium" style={{ color: 'var(--neuro-text-secondary)' }}>Quantity</th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: 'var(--neuro-text-secondary)' }}>Rate</th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: 'var(--neuro-text-secondary)' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b" style={{ borderColor: 'var(--neuro-border)' }}>
                  <td className="py-3 px-4 text-sm" style={{ wordBreak: 'break-word' }}>{item.description}</td>
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
              <span style={{ color: 'var(--neuro-text-secondary)' }}>Subtotal:</span>
              <span className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>
                {invoice.subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
              </span>
            </div>
            {invoice.taxPercent > 0 && (
              <div className="flex justify-between py-2">
                <span style={{ color: 'var(--neuro-text-secondary)' }}>Tax ({invoice.taxPercent}%):</span>
                <span className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>
                  {taxAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between py-3 text-lg font-bold" style={{ borderTop: '1px solid var(--neuro-border)', color: 'var(--neuro-text-primary)' }}>
              <span>Total:</span>
              <span>
                {invoice.total.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--neuro-border)' }}>
        <p className="text-sm text-center" style={{ color: 'var(--neuro-text-secondary)' }}>
          Thank you for your business! Payment due within 30 days.
        </p>
      </div>
    </div>
  );
}
