'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, FileText } from 'lucide-react';
import { formatCurrency, calculateSubtotal, calculateTotal } from '@/lib/invoiceUtils';
import InvoicePreviewCard from './InvoicePreviewCard';
import InvoiceItemRow, { InvoiceItem } from './InvoiceItemRow';

interface Project {
  _id: string;
  title: string;
  client: string;
  budget?: number;
  hourlyRate?: number;
  hoursWorked?: number;
  totalEarned?: number;
  status?: 'active' | 'completed' | 'pending' | 'on-hold' | string;
}

interface InvoiceCreateFormProps {
  onInvoiceCreated?: () => void;
}

export default function InvoiceCreateForm({ onInvoiceCreated }: InvoiceCreateFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [billedToName, setBilledToName] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [taxPercent, setTaxPercent] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Auto-calculate totals when items or tax changes
  useEffect(() => {
    const newSubtotal = calculateSubtotal(items);
    const newTotal = calculateTotal(newSubtotal, taxPercent);
    setSubtotal(newSubtotal);
    setTotal(newTotal);
  }, [items, taxPercent]);

  const generateItemsForProject = (project: Project): InvoiceItem[] => {
    const projectItems: InvoiceItem[] = [];
    if (project.hoursWorked && project.hourlyRate) {
      projectItems.push({
        description: `Development work - ${project.hoursWorked} hours (${project.title})`,
        quantity: project.hoursWorked,
        rate: project.hourlyRate,
        amount: (project.hoursWorked || 0) * (project.hourlyRate || 0)
      });
    } else if (project.totalEarned) {
      projectItems.push({
        description: `Project: ${project.title}`,
        quantity: 1,
        rate: project.totalEarned,
        amount: project.totalEarned
      });
    } else if (project.budget) {
      projectItems.push({
        description: `Project: ${project.title}`,
        quantity: 1,
        rate: project.budget,
        amount: project.budget
      });
    } else {
      projectItems.push({
        description: `Project: ${project.title}`,
        quantity: 1,
        rate: 0,
        amount: 0
      });
    }
    return projectItems;
  };

  const isBatch = useMemo(() => selectedProjects.length > 1, [selectedProjects]);

  // Auto-fill data when project(s) are selected
  useEffect(() => {
    if (selectedProjects.length === 0) {
      setItems([]);
      return;
    }
    if (selectedProjects.length === 1) {
      const project = projects.find(p => p._id === selectedProjects[0]);
      if (project) {
        setBilledToName(project.client);
        setItems(generateItemsForProject(project));
      }
    } else {
      // Batch mode: auto-generate items dari semua project terpilih
      const all = selectedProjects
        .map(id => projects.find(p => p._id === id))
        .filter(Boolean) as Project[];
      const combined = all.flatMap(p => generateItemsForProject(p));
      setItems(combined);
      const uniqueClients = Array.from(new Set(all.map(p => p.client).filter(Boolean)));
      if (uniqueClients.length === 1) {
        setBilledToName(uniqueClients[0] || '');
      } else if (!billedToName) {
        setBilledToName(all[0]?.client || '');
      }
    }
  }, [selectedProjects, projects, billedToName]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const responseData = await response.json();
        setProjects(responseData.projects || []);
      } else {
        setError('Failed to load projects');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Network error while loading projects');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    if (isBatch) return; // Disable manual add in batch mode to avoid ambiguity
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    if (isBatch) return; // Disable manual edit in batch mode
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;
      const rate = field === 'rate' ? Number(value) : newItems[index].rate;
      newItems[index].amount = quantity * rate;
    }
    
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProjects.length === 0) {
      setError('Please select at least one project');
      return;
    }
    
    if (!isBatch && !billedToName.trim()) {
      setError('Please enter billed to name');
      return;
    }
    
    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }
    
    // Validate items
    for (const item of items) {
      if (!item.description.trim()) {
        setError('All items must have a description');
        return;
      }
      if (item.quantity <= 0) {
        setError('All items must have positive quantity');
        return;
      }
      if (item.rate < 0) {
        setError('All items must have non-negative rate');
        return;
      }
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (!isBatch) {
        // Single project
        const projectId = selectedProjects[0];
        const response = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            projectId,
            billedToName: billedToName.trim(),
            items,
            taxPercent,
            subtotal,
            total
          })
        });

        if (response.ok) {
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            if (onInvoiceCreated) onInvoiceCreated();
          }, 2500);
          // Reset form
          setSelectedProjects([]);
          setBilledToName('');
          setItems([]);
          setTaxPercent(0);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to create invoice');
        }
      } else {
        // Batch mode: generate satu file invoice gabungan dari semua project terpilih (tersimpan + unduh PDF)
        const all = selectedProjects
          .map(id => projects.find(p => p._id === id))
          .filter(Boolean) as Project[];
        const clients = all.map(p => p.client);
        const createRes = await fetch('/api/invoices/combined', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            primaryProjectId: selectedProjects[0],
            billedToName: billedToName.trim(),
            items,
            taxPercent,
            subtotal,
            total,
            clients
          })
        });
        
        if (createRes.ok) {
          const { invoice } = await createRes.json();
          const pdfRes = await fetch(`/api/invoices/${invoice._id}/pdf`, {
            method: 'POST',
            credentials: 'include'
          });
          if (pdfRes.ok) {
            const blob = await pdfRes.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice_${invoice._id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } else {
            setError('Failed to export PDF');
          }
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            if (onInvoiceCreated) onInvoiceCreated();
          }, 2500);
        } else {
          const errorData = await createRes.json().catch(() => ({}));
          setError(errorData.error || 'Failed to create combined invoice');
        }
        // Reset form
        setSelectedProjects([]);
        setBilledToName('');
        setItems([]);
        setTaxPercent(0);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-card p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading projects...</span>
        </div>
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
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>Create Invoice</h1>
        <p className="mt-1 app-muted">Generate professional invoices from your projects</p>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 rounded-xl flex items-center space-x-2"
          style={{ 
            backgroundColor: 'var(--neuro-success-light)', 
            border: '1px solid var(--neuro-success)', 
            color: 'var(--neuro-success)' 
          }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--neuro-success)' }}></div>
          <span>Invoice created successfully!</span>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 rounded-xl flex items-center space-x-2"
          style={{ 
            backgroundColor: 'var(--neuro-error-light)', 
            border: '1px solid var(--neuro-error)', 
            color: 'var(--neuro-error)' 
          }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--neuro-error)' }}></div>
          <span>{error}</span>
        </motion.div>
      )}

      {/* Form */}
      <div className="app-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
              Pilih Project (bisa lebih dari satu) *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.filter(p => (p.status || '').toLowerCase() !== 'completed').map((project) => {
                const checked = selectedProjects.includes(project._id);
                return (
                  <label key={project._id} className="app-card p-3 flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedProjects((prev) => {
                          if (e.target.checked) return [...prev, project._id];
                          return prev.filter(id => id !== project._id);
                        });
                      }}
                      className="rounded"
                    />
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--neuro-text-primary)' }}>{project.title}</div>
                      <div className="text-xs app-muted">{project.client}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedProjects.length > 1 && (
              <p className="mt-2 text-xs app-muted">Mode batch aktif: project terpilih akan digabung menjadi 1 file PDF.</p>
            )}
          </div>

          {/* Billed To */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
              Billed To *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={billedToName}
                onChange={(e) => setBilledToName(e.target.value)}
                className="app-input flex-1 px-4 py-3"
                placeholder="Client name"
                required={!isBatch}
              />
              <button
                type="button"
                onClick={() => {
                  const project = projects.find(p => p._id === selectedProjects[0]);
                  if (project) {
                    setBilledToName(project.client);
                  }
                }}
                className="app-btn-secondary px-4 py-3"
                disabled={selectedProjects.length !== 1}
              >
                Reset to Project
              </button>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>
                Invoice Items *
              </label>
              <button
                type="button"
                onClick={addItem}
                className={`app-btn-primary flex items-center space-x-2 px-3 py-2 text-sm ${isBatch ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isBatch}
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <InvoiceItemRow
                  key={index}
                  item={item}
                  index={index}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  readOnly={isBatch}
                />
              ))}
            </div>
          </div>

          {/* Tax */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
                Tax Percentage (%)
              </label>
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="app-input w-full px-4 py-3"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          {/* Totals */}
          <div className="app-card p-6" style={{ backgroundColor: 'var(--neuro-bg-light)' }}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="app-muted">Subtotal:</span>
                <span className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>{formatCurrency(subtotal)}</span>
              </div>
              {taxPercent > 0 && (
                <div className="flex justify-between">
                  <span className="app-muted">Tax ({taxPercent}%):</span>
                  <span className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>{formatCurrency(subtotal * taxPercent / 100)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span style={{ color: 'var(--neuro-text-primary)' }}>Total:</span>
                <span style={{ color: 'var(--neuro-text-primary)' }}>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="app-btn-secondary flex items-center space-x-2 px-6 py-3"
              disabled={items.length === 0}
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
            <button
              type="submit"
              className="app-btn-primary flex items-center justify-center space-x-2 px-6 py-4 text-base font-semibold flex-1"
              disabled={isSubmitting || selectedProjects.length === 0 || items.length === 0}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Membuat...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
              <span>{isBatch ? 'Create Combined PDF' : 'Create Invoice'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--neuro-bg)', color: 'var(--neuro-text-primary)' }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Invoice Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="app-btn-secondary px-3 py-1"
                >
                  ✕
                </button>
              </div>
              <InvoicePreviewCard
                invoice={{
                  invoiceNumber: 'PREVIEW',
                  projectTitle: isBatch ? 'Multiple Projects' : (projects.find(p => p._id === selectedProjects[0])?.title || ''),
                  billedToName: (() => {
                    if (!isBatch) return billedToName;
                    const all = selectedProjects
                      .map(id => projects.find(p => p._id === id))
                      .filter(Boolean) as Project[];
                    const uniqueClients = Array.from(new Set(all.map(p => p.client).filter(Boolean)));
                    if (billedToName.trim()) return billedToName.trim();
                    if (uniqueClients.length > 1) return 'Multiple Clients';
                    return uniqueClients[0] || '';
                  })(),
                  items,
                  subtotal,
                  taxPercent,
                  total,
                  status: 'pending',
                  createdAt: new Date()
                }}
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}