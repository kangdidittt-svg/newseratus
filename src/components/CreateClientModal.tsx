'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { normalizeClientName } from '@/lib/clientUtils';

interface ClientData {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  projectCount?: number;
  invoiceCount?: number;
}

interface CreateClientModalProps {
  isOpen: boolean;
  initialName?: string;
  onClose: () => void;
  onClientCreated: (client: ClientData) => void;
  existingClients?: ClientData[];
}

export default function CreateClientModal({
  isOpen,
  initialName = '',
  onClose,
  onClientCreated,
  existingClients = []
}: CreateClientModalProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [duplicateClient, setDuplicateClient] = useState<ClientData | null>(null);

  // Update initial name when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setEmail('');
      setPhone('');
      setCompany('');
      setNotes('');
      setError('');
      setDuplicateClient(null);
    }
  }, [isOpen, initialName]);

  // Real-time duplicate check from existingClients
  const existingDuplicate = useMemo(() => {
    if (!name.trim()) return null;
    const norm = normalizeClientName(name);
    if (!norm) return null;
    return existingClients.find(c => normalizeClientName(c.name) === norm) || null;
  }, [name, existingClients]);

  useEffect(() => {
    if (existingDuplicate) {
      setDuplicateClient(existingDuplicate);
    } else {
      setDuplicateClient(null);
    }
  }, [existingDuplicate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Client name is required');
      return;
    }

    if (duplicateClient) {
      setError(`A client with the name "${duplicateClient.name}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          company: company.trim() || undefined,
          notes: notes.trim() || undefined
        })
      });

      const data = await res.json();

      if (res.ok) {
        onClientCreated(data.client);
        onClose();
      } else if (res.status === 409) {
        setError(data.error || 'A client with this name already exists.');
        if (data.client) {
          setDuplicateClient(data.client);
        }
      } else {
        setError(data.error || 'Failed to create client');
      }
    } catch (err) {
      console.error('Error creating client:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseExisting = () => {
    if (duplicateClient) {
      onClientCreated(duplicateClient);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[350] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.16 }}
          className="w-full max-w-md bg-[#14161A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#171A21]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#FAFAFA]">Create New Client</h3>
                <p className="text-[11px] text-slate-400">Add client record to your database</p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {/* Duplicate Found Warning Card */}
            {duplicateClient && (
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-purple-200">
                      Existing client matches this name
                    </p>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      <strong>{duplicateClient.name}</strong> is already in your database
                      {duplicateClient.projectCount !== undefined && (
                        <span> ({duplicateClient.projectCount} projects · {duplicateClient.invoiceCount} invoices)</span>
                      )}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUseExisting}
                  className="w-full py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                >
                  <span>Select &quot;{duplicateClient.name}&quot; instead</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Client Name */}
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Client Name <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Mr Sohail, Acme Studio"
                autoFocus
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#1A1D22] border border-white/10 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Email <span className="text-slate-500 text-[10px]">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#1A1D22] border border-white/10 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Phone <span className="text-slate-500 text-[10px]">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#1A1D22] border border-white/10 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Company / Organization */}
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Company / Organization <span className="text-slate-500 text-[10px]">(optional)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Company or Brand name"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#1A1D22] border border-white/10 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Notes <span className="text-slate-500 text-[10px]">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Any client notes, preferences, or details..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#1A1D22] border border-white/10 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || Boolean(duplicateClient)}
                className="px-4 py-2 text-xs rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Client</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
