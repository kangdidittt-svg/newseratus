'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Check, X, Trash2, FileText, Download } from 'lucide-react';
import InvoicePreviewCard, { InvoiceItem } from './InvoicePreviewCard';
import InvoiceCreateForm from './InvoiceCreateForm';
import InvoiceDownloadButton from './InvoiceDownloadButton';

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
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  // Export PDF disabled per request; keeping placeholder for potential future use

  // Bulk export disabled
  const markAsPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'paid' })
      });
      if (response.ok) {
        setInvoices(prev => prev.map(inv => inv._id === invoiceId ? { ...inv, status: 'paid' } : inv));
      } else {
        console.error('Failed to mark as paid');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setDeleteTargetId(invoiceId);
  };

  const confirmDeleteInvoice = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await fetch(`/api/invoices/${deleteTargetId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setInvoices(prev => prev.filter(inv => inv._id !== deleteTargetId));
        setSelectedInvoices(prev => prev.filter(id => id !== deleteTargetId));
        setDeleteTargetId(null);
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
        <div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="neuro-button-orange px-4 py-2 flex items-center gap-2"
            title="Create Invoice"
          >
            <FileText className="h-4 w-4" />
            Create Invoice
          </button>
        </div>
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
                      <div className="flex items-center space-x-2">
                        <span>{invoice.billedToName}</span>
                        <button
                          onClick={() => handleEditName(invoice)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Client Name"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
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
                        <InvoiceDownloadButton
                          fileName={`invoice-${invoice.invoiceNumber}.pdf`}
                          targetId={`invoice-preview-${invoice._id}`}
                          className="app-btn-secondary"
                        >
                          <Download className="h-4 w-4" />
                        </InvoiceDownloadButton>
                        <button
                          onClick={() => markAsPaid(invoice._id)}
                          className="app-btn-secondary"
                          title="Tandai sebagai Paid"
                          disabled={invoice.status === 'paid'}
                          style={{ color: invoice.status === 'paid' ? 'var(--neuro-text-muted)' : 'var(--neuro-success)' }}
                        >
                          <Check className="h-4 w-4" />
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
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div className="neuro-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>Invoice Preview</h2>
              <button
                onClick={() => setShowPreview(null)}
                className="neuro-button px-3 py-1"
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
      )}

      {/* Edit Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div className="neuro-card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>Edit Client Name</h2>
              <button className="neuro-button p-2" onClick={cancelEdit}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--neuro-text-secondary)' }}>Client Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="neuro-input w-full"
                  placeholder="Enter client name"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={saveEditName} className="neuro-button-orange flex-1 px-3 py-2 flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" />
                  Simpan
                </button>
                <button onClick={cancelEdit} className="neuro-button flex-1 px-3 py-2">
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div className="neuro-card p-6 w-full max-w-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>Hapus Invoice?</h3>
              <p className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={confirmDeleteInvoice} className="neuro-button-orange flex-1 px-3 py-2 flex items-center justify-center gap-2">
                <Trash2 className="h-4 w-4" />
                Hapus
              </button>
              <button onClick={() => setDeleteTargetId(null)} className="neuro-button flex-1 px-3 py-2">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div className="neuro-card p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>Create Invoice</h2>
              <button className="neuro-button p-2" onClick={() => setShowCreateModal(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <InvoiceCreateForm onInvoiceCreated={() => { setShowCreateModal(false); fetchInvoices(); }} />
          </div>
        </div>
      )}

      {/* Hidden Previews for Download */}
      <div style={{ position: 'fixed', left: -10000, top: -10000, opacity: 0, pointerEvents: 'none' }}>
        {invoices.map((inv) => (
          <div key={`hidden-${inv._id}`} className="w-[900px]">
            <InvoicePreviewCard
              invoice={{
                ...inv,
                createdAt: new Date(inv.createdAt),
                items: inv.items || []
              }}
              containerId={`invoice-preview-${inv._id}`}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
