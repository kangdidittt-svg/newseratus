'use client';

import { Trash2 } from 'lucide-react';

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceItemRowProps {
  item: InvoiceItem;
  index: number;
  onUpdate: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  onRemove: (index: number) => void;
  readOnly?: boolean;
}

export default function InvoiceItemRow({ 
  item, 
  index, 
  onUpdate, 
  onRemove, 
  readOnly = false 
}: InvoiceItemRowProps) {
  const handleUpdate = (field: keyof InvoiceItem, value: string | number) => {
    if (readOnly) return;
    onUpdate(index, field, value);
  };

  return (
    <div className="app-card p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
        <div className="md:col-span-2">
          <label className="block text-xs mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Description</label>
          {readOnly ? (
            <div className="px-3 py-2 text-sm rounded" style={{ backgroundColor: 'var(--neuro-bg-light)', color: 'var(--neuro-text-primary)' }}>
              {item.description}
            </div>
          ) : (
            <input
              type="text"
              value={item.description}
              onChange={(e) => handleUpdate('description', e.target.value)}
              className="app-input w-full px-3 py-2 text-sm"
              placeholder="Item description"
            />
          )}
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Quantity</label>
          {readOnly ? (
            <div className="px-3 py-2 text-sm rounded" style={{ backgroundColor: 'var(--neuro-bg-light)', color: 'var(--neuro-text-primary)' }}>
              {item.quantity}
            </div>
          ) : (
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleUpdate('quantity', Number(e.target.value))}
              className="app-input w-full px-3 py-2 text-sm"
              min="0"
              step="0.01"
            />
          )}
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Rate</label>
          {readOnly ? (
            <div className="px-3 py-2 text-sm rounded" style={{ backgroundColor: 'var(--neuro-bg-light)', color: 'var(--neuro-text-primary)' }}>
              {item.rate.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
            </div>
          ) : (
            <input
              type="number"
              value={item.rate}
              onChange={(e) => handleUpdate('rate', Number(e.target.value))}
              className="app-input w-full px-3 py-2 text-sm"
              min="0"
              step="0.01"
            />
          )}
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Amount</label>
          <div className="px-3 py-2 text-sm rounded font-medium" style={{ backgroundColor: 'var(--neuro-bg-light)', color: 'var(--neuro-text-primary)' }}>
            {item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
          </div>
        </div>
        {!readOnly && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="app-btn-secondary p-2"
              title="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}