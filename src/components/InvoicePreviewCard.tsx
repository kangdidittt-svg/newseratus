'use client';

import { formatDate } from '@/lib/invoiceUtils';

export interface InvoiceItem {
  description: string;
  subDescription?: string;
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'overdue':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const isPaid = invoice.status.toLowerCase() === 'paid';

  return (
    <div
      id={containerId || 'invoice-preview'}
      className={`relative bg-white text-slate-900 rounded-2xl p-8 border border-slate-200 shadow-lg font-sans overflow-hidden ${className}`}
    >
      {/* PAID Watermark Overlay Stamp */}
      {isPaid && (
        <div className="absolute top-6 right-8 pointer-events-none select-none z-20 transform -rotate-12">
          <div className="border-4 border-dashed border-emerald-600/80 rounded-xl px-4 py-1.5 text-center text-emerald-600 shadow-sm bg-emerald-50/40 backdrop-blur-[1px]">
            <span className="text-2xl sm:text-3xl font-black tracking-widest uppercase block leading-none">PAID</span>
            <span className="text-[9px] font-bold tracking-wider uppercase block mt-0.5 text-emerald-700">Payment Received</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold uppercase tracking-wider mb-2">
            Official Invoice
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            INVOICE
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1">
            #{invoice.invoiceNumber}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs font-medium text-slate-400">
            Issued Date
          </p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">
            {formatDate(invoice.createdAt)}
          </p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-2 ${getStatusBadge(invoice.status)}`}>
            {invoice.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* From, Bill To & Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            From
          </h3>
          <p className="text-base font-bold text-slate-900">
            Overthinklabs.id
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Billed To
          </h3>
          <p className="text-base font-semibold text-slate-900">
            {invoice.billedToName}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Project Reference
          </h3>
          <p className="text-base font-semibold text-slate-900">
            {invoice.projectTitle}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Line Items
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Description & Scope</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Rate</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {invoice.items.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 text-sm" style={{ wordBreak: 'break-word' }}>
                    <div className="font-semibold text-slate-900">{item.description}</div>
                    {item.subDescription && (
                      <div className="mt-1.5 p-2 rounded-lg text-xs leading-relaxed whitespace-pre-line bg-slate-100 border-l-2 border-slate-300 text-slate-600">
                        {item.subDescription}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-sm text-center font-medium text-slate-600">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-4 text-sm text-right font-mono text-slate-600">
                    {item.rate.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-sm text-right font-mono font-bold text-slate-900">
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
        <div className="w-full md:w-5/12 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-slate-800">
                {invoice.subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
              </span>
            </div>
            {invoice.taxPercent > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Tax ({invoice.taxPercent}%)</span>
                <span className="font-mono font-semibold text-slate-800">
                  {taxAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-base font-bold text-slate-900">
                Total Due
              </span>
              <span className="text-xl font-mono font-black text-slate-900">
                {invoice.total.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-400">
          Thank you for your business! Payment is due within 30 days of issue.
        </p>
      </div>
    </div>
  );
}
