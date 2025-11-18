'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Edit, Check, X, Trash2 } from 'lucide-react';
import InvoicePreviewCard, { InvoiceItem } from './InvoicePreviewCard';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  projectTitle: string;
  billedToName: string;
  items: InvoiceItem[];
  subtotal: number;
  taxPercent: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
}

interface InvoiceHistoryTableProps {
  refreshTrigger?: number;
}

export default function InvoiceHistoryTable({ refreshTrigger }: InvoiceHistoryTableProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editName, setEditName] = useState('');
  const [showPreview, setShowPreview] = useState<Invoice | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isBulkExporting, setIsBulkExporting] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [refreshTrigger]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      } else {
        console.error('Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(invoice => invoice._id));
    }
  };

  const handleExportPDF = async (invoiceId: string) => {
    setIsExporting(invoiceId);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to export PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(null);
    }
  };

  const handleBulkExport = async () => {
    if (selectedInvoices.length === 0) return;
    
    setIsBulkExporting(true);
    try {
      const response = await fetch('/api/invoices/bulk-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ invoiceIds: selectedInvoices })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoices_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Clear selection after export
        setSelectedInvoices([]);
      } else {
        console.error('Failed to export bulk PDF');
      }
    } catch (error) {
      console.error('Error exporting bulk PDF:', error);
    } finally {
      setIsBulkExporting(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    const confirmed = window.confirm('Hapus invoice ini? Tindakan ini tidak dapat dibatalkan.');
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setInvoices(prev => prev.filter(inv => inv._id !== invoiceId));
        setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
      } else {
        console.error('Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleEditName = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setEditName(invoice.billedToName);
  };

  const saveEditName = async () => {
    if (!editingInvoice || !editName.trim()) return;

    try {
      const response = await fetch(`/api/invoices/${editingInvoice._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ billedToName: editName.trim() })
      });

      if (response.ok) {
        // Update local state
        setInvoices(invoices.map(inv => 
          inv._id === editingInvoice._id 
            ? { ...inv, billedToName: editName.trim() }
            : inv
        ));
        setEditingInvoice(null);
        setEditName('');
      } else {
        console.error('Failed to update invoice');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const cancelEdit = () => {
    setEditingInvoice(null);
    setEditName('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return { color: 'var(--neuro-success)', backgroundColor: 'var(--neuro-success-light)' };
      case 'overdue': return { color: 'var(--neuro-error)', backgroundColor: 'var(--neuro-error-light)' };
      default: return { color: 'var(--neuro-warning)', backgroundColor: 'var(--neuro-warning-light)' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoices...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>Invoice History</h1>
          <p className="mt-1 app-muted">Manage and export your invoices</p>
        </div>
        {selectedInvoices.length > 0 && (
          <motion.button
            onClick={handleBulkExport}
            disabled={isBulkExporting}
            className="app-btn-primary flex items-center space-x-2 px-6 py-3"
            whileHover={{ scale: isBulkExporting ? 1 : 1.02 }}
            whileTap={{ scale: isBulkExporting ? 1 : 0.98 }}
          >
            {isBulkExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Export Selected ({selectedInvoices.length})</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <div className="app-card p-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>No Invoices Yet</h3>
            <p className="app-muted">Create your first invoice to get started!</p>
          </div>
        </div>
      ) : (
        <div className="app-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === invoices.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium app-muted uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium app-muted uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium app-muted uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium app-muted uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium app-muted uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium app-muted uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium app-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium app-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: 'var(--neuro-bg)', color: 'var(--neuro-text-primary)', borderColor: 'var(--neuro-border)' }}>
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="transition-colors" style={{ cursor: 'default' }}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice._id)}
                        onChange={() => handleSelectInvoice(invoice._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {invoice.projectTitle}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {editingInvoice?._id === invoice._id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="app-input px-2 py-1 text-sm"
                          />
                          <button
                            onClick={saveEditName}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{invoice.billedToName}</span>
                          <button
                            onClick={() => handleEditName(invoice)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--neuro-text-primary)' }}>
                      {invoice.subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--neuro-text-primary)' }}>
                      {invoice.total.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={getStatusColor(invoice.status)}
                      >
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowPreview(invoice)}
                          className="app-btn-secondary"
                          title="View Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleExportPDF(invoice._id)}
                          disabled={isExporting === invoice._id}
                          className="app-btn-secondary disabled:opacity-50"
                          title="Export PDF"
                        >
                          {isExporting === invoice._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: 'var(--neuro-primary)' }}></div>
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice._id)}
                          className="app-btn-secondary"
                          title="Hapus Invoice"
                          style={{ color: 'var(--neuro-error)' }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--neuro-bg)', color: 'var(--neuro-text-primary)' }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Invoice Preview</h2>
                <button
                  onClick={() => setShowPreview(null)}
                  className="app-btn-secondary px-3 py-1"
                >
                  ✕
                </button>
              </div>
              <InvoicePreviewCard invoice={{
                ...showPreview,
                createdAt: new Date(showPreview.createdAt),
                items: showPreview.items || []
              }} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}