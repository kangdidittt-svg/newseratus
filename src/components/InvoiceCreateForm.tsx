'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, ChevronRight, ChevronLeft, Download, FileText, Sparkles } from 'lucide-react';
import { formatCurrency, calculateSubtotal, calculateTotal } from '@/lib/invoiceUtils';
import InvoicePreviewCard from './InvoicePreviewCard';
import InvoiceItemRow, { InvoiceItem } from './InvoiceItemRow';

interface Project {
  _id: string;
  title: string;
  description?: string;
  client: string;
  budget?: number;
  hourlyRate?: number;
  hoursWorked?: number;
  totalEarned?: number;
  status?: string;
}

interface InvoiceCreateFormProps {
  onInvoiceCreated?: () => void;
}

export default function InvoiceCreateForm({ onInvoiceCreated }: InvoiceCreateFormProps) {
  const [wizardStep, setWizardStep] = useState<number>(1);
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
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const newSubtotal = calculateSubtotal(items);
    const newTotal = calculateTotal(newSubtotal, taxPercent);
    setSubtotal(newSubtotal);
    setTotal(newTotal);
  }, [items, taxPercent]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects', { credentials: 'include' });
      if (response.ok) {
        const responseData = await response.json();
        setProjects(responseData.projects || []);
      } else {
        setError('Failed to load projects');
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Network error loading projects');
    } finally {
      setIsLoading(false);
    }
  };

  const generateItemsForProject = (project: Project): InvoiceItem[] => {
    const subDesc = project.description || '';
    if (project.hoursWorked && project.hourlyRate) {
      return [{
        description: `Development work - ${project.hoursWorked} hours (${project.title})`,
        subDescription: subDesc,
        quantity: project.hoursWorked,
        rate: project.hourlyRate,
        amount: (project.hoursWorked || 0) * (project.hourlyRate || 0)
      }];
    }
    const val = project.totalEarned || project.budget || 0;
    return [{
      description: `Project: ${project.title}`,
      subDescription: subDesc,
      quantity: 1,
      rate: val,
      amount: val
    }];
  };

  const isBatch = useMemo(() => selectedProjects.length > 1, [selectedProjects]);

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
      const all = selectedProjects
        .map(id => projects.find(p => p._id === id))
        .filter(Boolean) as Project[];
      const combined = all.flatMap(p => generateItemsForProject(p));
      setItems(combined);
      const uniqueClients = Array.from(new Set(all.map(p => p.client).filter(Boolean)));
      setBilledToName(uniqueClients.length === 1 ? uniqueClients[0] || '' : 'Multiple Clients');
    }
  }, [selectedProjects, projects]);

  const addItem = () => {
    if (isBatch) return;
    setItems([...items, { description: '', subDescription: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      const q = field === 'quantity' ? Number(value) : newItems[index].quantity;
      const r = field === 'rate' ? Number(value) : newItems[index].rate;
      newItems[index].amount = q * r;
    }
    setItems(newItems);
  };

  const handleSaveInvoice = async () => {
    if (selectedProjects.length === 0) {
      setError('Please select at least one project');
      return;
    }
    if (!billedToName.trim()) {
      setError('Please enter client name');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const endpoint = isBatch ? '/api/invoices/combined' : '/api/invoices';
      const payload = isBatch ? {
        primaryProjectId: selectedProjects[0],
        billedToName,
        items,
        taxPercent,
        subtotal,
        total
      } : {
        projectId: selectedProjects[0],
        billedToName,
        items,
        taxPercent,
        subtotal,
        total
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const resData = await response.json();
        const createdId = resData.invoice?._id;
        setCreatedInvoiceId(createdId);
        setWizardStep(5); // Go to Export PDF step
        window.dispatchEvent(new Event('invoices:updated'));
        if (onInvoiceCreated) onInvoiceCreated();
      } else {
        const errData = await response.json();
        setError(errData.error || 'Failed to create invoice');
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError('Network error while saving invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Choose Project' },
    { num: 2, title: 'Scope & Details' },
    { num: 3, title: 'Tax & Rates' },
    { num: 4, title: 'Live Preview' },
    { num: 5, title: 'Export PDF' }
  ];

  return (
    <div className="space-y-6">
      {/* Wizard Step Progress Header */}
      <div className="p-4 rounded-2xl bg-[#171A21] border border-white/10">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                wizardStep === s.num
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(124,92,255,0.4)]'
                  : wizardStep > s.num
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-500 border border-white/10'
              }`}>
                {wizardStep > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${wizardStep === s.num ? 'text-slate-100 font-bold' : 'text-slate-500'}`}>
                {s.title}
              </span>
              {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:inline" />}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Step Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={wizardStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* STEP 1: CHOOSE PROJECT */}
          {wizardStep === 1 && (
            <div className="p-6 rounded-2xl bg-[#171A21] border border-white/10 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-100">Step 1: Select Project & Client</h3>
                <p className="text-xs text-slate-400 mt-0.5">Select one or more projects to include in this invoice.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.filter(p => (p.status || '').toLowerCase() !== 'completed').map((project) => {
                  const checked = selectedProjects.includes(project._id);
                  return (
                    <label
                      key={project._id}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                        checked
                          ? 'bg-purple-950/40 border-purple-500/50 text-slate-100 shadow-[0_0_12px_rgba(124,92,255,0.15)]'
                          : 'bg-[#1E222B] border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedProjects(prev => [...prev, project._id]);
                          else setSelectedProjects(prev => prev.filter(id => id !== project._id));
                        }}
                        className="rounded accent-purple-500"
                      />
                      <div className="overflow-hidden">
                        <div className="text-sm font-semibold truncate">{project.title}</div>
                        <div className="text-xs text-slate-400">{project.client}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Billed To Name</label>
                <input
                  type="text"
                  value={billedToName}
                  onChange={(e) => setBilledToName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#1E222B] border border-white/10 text-slate-100 outline-none focus:border-purple-500"
                  placeholder="Client or Company Name"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  disabled={selectedProjects.length === 0}
                  onClick={() => setWizardStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center space-x-2 disabled:opacity-50 transition-all"
                >
                  <span>Next: Scope & Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SCOPE & DETAILS */}
          {wizardStep === 2 && (
            <div className="p-6 rounded-2xl bg-[#171A21] border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Step 2: Define Scope & Line Items</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Customize scope sub-descriptions for project clarity.</p>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="space-y-3">
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

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center space-x-2"
                >
                  <span>Next: Tax & Rates</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TAX & RATES */}
          {wizardStep === 3 && (
            <div className="p-6 rounded-2xl bg-[#171A21] border border-white/10 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-100">Step 3: Tax & Currency Summary</h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure tax percentage and check totals.</p>
              </div>

              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tax Percentage (%)</label>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#1E222B] border border-white/10 text-slate-100 outline-none focus:border-purple-500"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#1E222B] border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-200">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax ({taxPercent}%):</span>
                    <span className="font-mono text-slate-200">${(subtotal * taxPercent / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-purple-400 pt-2 border-t border-white/5">
                    <span>Total Amount:</span>
                    <span className="font-mono">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setWizardStep(4)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center space-x-2"
                >
                  <span>Next: Live Preview</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: LIVE PREVIEW & SAVE */}
          {wizardStep === 4 && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#171A21] border border-white/10 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Step 4: Live Invoice Preview</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Review your document before saving.</p>
                </div>
                <button
                  onClick={handleSaveInvoice}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition-all flex items-center space-x-2"
                >
                  {isSubmitting ? 'Saving Invoice...' : 'Save & Proceed to Export'}
                  <Check className="w-4 h-4" />
                </button>
              </div>

              <InvoicePreviewCard
                invoice={{
                  invoiceNumber: 'INV-PREVIEW',
                  projectTitle: selectedProjects.length === 1 ? (projects.find(p => p._id === selectedProjects[0])?.title || 'Selected Project') : 'Multiple Projects',
                  billedToName,
                  items,
                  subtotal,
                  taxPercent,
                  total,
                  status: 'pending',
                  createdAt: new Date()
                }}
              />

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: EXPORT PDF */}
          {wizardStep === 5 && (
            <div className="p-8 rounded-2xl bg-[#171A21] border border-white/10 text-center space-y-6 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-100">Invoice Created Successfully!</h3>
                <p className="text-xs text-slate-400 mt-1">Your document has been generated and saved to your workstation database.</p>
              </div>

              {createdInvoiceId && (
                <div className="pt-4 flex justify-center space-x-3">
                  <a
                    href={`/api/invoices/${createdInvoiceId}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Invoice</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
