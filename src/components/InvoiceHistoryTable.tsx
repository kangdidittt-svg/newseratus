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

  // Listen for Studio Robot "Generate Invoice" quick action
  useEffect(() => {
    const handler = () => setShowCreateModal(true);
    window.addEventListener('invoice:openCreateModal', handler);
    return () => window.removeEventListener('invoice:openCreateModal', handler);
  }, []);

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
        <>
        {/* Mobile list */}
        <div className="md:hidden space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice._id} className="bg-[#121418] border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] text-[#6B7280] font-mono">#{invoice.invoiceNumber}</div>
                  <div className="text-sm font-bold text-[#F5F5F5]">{invoice.projectTitle}</div>
                </div>
                <span className="inline-flex items-center space-x-1.5 text-xs font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    invoice.status === 'paid' ? 'bg-[#22C55E]' :
                    invoice.status === 'overdue' ? 'bg-[#EF4444]' :
                    'bg-[#F59E0B]'
                  }`} />
                  <span className="text-[#FAFAFA] capitalize">{invoice.status}</span>
                </span>
              </div>

              <div className="text-xs text-[#9CA3AF] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Client:</span>
                  <span className="font-semibold text-[#F5F5F5]">{invoice.billedToName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Total:</span>
                  <span className="font-mono font-bold text-cyan-400">${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPreview(invoice)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-[#A78BFA] border border-purple-500/30 text-xs font-semibold"
                  >
                    Preview
                  </button>
                  <a
                    href={`/api/invoices/${invoice._id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#F5F5F5] text-xs font-semibold flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => markAsPaid(invoice._id)}
                    disabled={invoice.status === 'paid'}
                    className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 disabled:opacity-30"
                    title="Mark Paid"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteInvoice(invoice._id)}
                    className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-[#121418] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-[#181A20] text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  <th className="px-5 py-3">Invoice #</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-[#F5F5F5] font-medium">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-purple-400 font-bold">#{invoice.invoiceNumber}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#FAFAFA]">{invoice.projectTitle}</td>
                    <td className="px-5 py-3.5 text-[#A1A1AA]">{invoice.billedToName}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-[#FAFAFA]">${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3.5 text-[#71717A]">{formatDate(invoice.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center space-x-1.5 text-xs font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          invoice.status === 'paid' ? 'bg-[#22C55E]' :
                          invoice.status === 'overdue' ? 'bg-[#EF4444]' :
                          'bg-[#F59E0B]'
                        }`} />
                        <span className="text-[#FAFAFA] capitalize">{invoice.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setShowPreview(invoice)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          title="Preview Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`/api/invoices/${invoice._id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => markAsPaid(invoice._id)}
                          disabled={invoice.status === 'paid'}
                          className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 disabled:opacity-30"
                          title="Mark Paid"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice._id)}
                          className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14161A] border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-[#FAFAFA]">Invoice Preview</h2>
                <p className="text-xs text-[#A1A1AA]">Clean minimalist print & PDF preview</p>
              </div>
              <div className="flex items-center space-x-3">
                <InvoiceDownloadButton
                  invoiceId={showPreview._id}
                  fileName={`Invoice-${showPreview.invoiceNumber}.pdf`}
                  targetId="modal-invoice-preview"
                  className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </InvoiceDownloadButton>
                <button
                  onClick={() => setShowPreview(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <InvoicePreviewCard
              containerId="modal-invoice-preview"
              invoice={{
                ...showPreview,
                createdAt: new Date(showPreview.createdAt),
                items: showPreview.items || []
              }}
            />
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
