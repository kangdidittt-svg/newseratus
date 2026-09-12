'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { triggerDashboardRefresh } from '../hooks/useRealtimeDashboard';
import { triggerNotificationRefresh } from '../hooks/useNotificationRefresh';
import SuccessPopup from './SuccessPopup';
import SmartSelect, { SmartSelectItem } from './ui/SmartSelect';
import CreateClientModal from './CreateClientModal';
import { usdToIdr } from '@/lib/utils';
import { normalizeClientName } from '@/lib/clientUtils';

interface AddProjectCompactProps {
  onProjectAdded?: () => void;
  onFormDataChange?: (isDirty: boolean) => void;
}

interface ClientItem {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  projectCount?: number;
  invoiceCount?: number;
}

const DEFAULT_CATEGORIES: SmartSelectItem[] = [
  { id: 'web-development', label: 'Web Dev', icon: '🌐' },
  { id: 'mobile-app', label: 'Mobile App', icon: '📱' },
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'branding', label: 'Branding', icon: '✨' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'social-media', label: 'Social Media', icon: '📱' },
  { id: 'consulting', label: 'Consulting', icon: '💼' },
  { id: 'other', label: 'Other', icon: '📋' }
];

export default function AddProjectCompact({ onProjectAdded, onFormDataChange }: AddProjectCompactProps) {
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    clientId: '',
    description: '',
    budget: '',
    deadline: '',
    status: 'active',
    priority: 'medium',
    category: 'web-development'
  });

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [categories, setCategories] = useState<SmartSelectItem[]>(DEFAULT_CATEGORIES);

  // Client modal state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [initialClientName, setInitialClientName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoadingPopup, setIsLoadingPopup] = useState(false);
  const [successData, setSuccessData] = useState({ title: '', message: '' });

  // Fetch clients on mount
  const fetchClients = useCallback(async () => {
    try {
      setLoadingClients(true);
      const res = await fetch('/api/clients', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Transform clients to SmartSelect items
  const clientSelectItems = useMemo<SmartSelectItem[]>(() => {
    return clients.map(client => ({
      id: client._id,
      label: client.name,
      subLabel: `${client.projectCount || 0} ${client.projectCount === 1 ? 'project' : 'projects'} · ${client.invoiceCount || 0} ${client.invoiceCount === 1 ? 'invoice' : 'invoices'}`,
      icon: <span className="text-sm">👤</span>,
      metadata: client
    }));
  }, [clients]);

  // Check if form has any data (is dirty)
  const isFormDirty = useCallback(() => {
    return formData.title.trim() !== '' || 
           formData.client.trim() !== '' || 
           formData.clientId.trim() !== '' || 
           formData.description.trim() !== '' || 
           formData.budget.trim() !== '' || 
           formData.deadline.trim() !== '';
  }, [formData.title, formData.client, formData.clientId, formData.description, formData.budget, formData.deadline]);

  // Notify parent component when form data changes
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(isFormDirty());
    }
  }, [onFormDataChange, isFormDirty]);

  // Handle form data changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle client selection from SmartSelect
  const handleClientSelect = (selectedId: string, item?: SmartSelectItem) => {
    setFormData(prev => ({
      ...prev,
      clientId: selectedId,
      client: item ? item.label : ''
    }));
  };

  // Open modal when user wants to create client from typed query
  const handleCreateClientFromQuery = (query: string) => {
    setInitialClientName(query);
    setIsClientModalOpen(true);
  };

  // Open modal from plus button beside selector
  const handlePlusButtonClick = () => {
    setInitialClientName('');
    setIsClientModalOpen(true);
  };

  // When a new client is created in modal, auto-select it in the form
  const handleClientCreated = (newClient: ClientItem) => {
    setClients(prev => {
      const exists = prev.some(c => c._id === newClient._id);
      if (exists) return prev;
      return [newClient, ...prev];
    });

    setFormData(prev => ({
      ...prev,
      clientId: newClient._id,
      client: newClient.name
    }));
  };

  // Handle Category selection
  const handleCategorySelect = (selectedId: string, item?: SmartSelectItem) => {
    setFormData(prev => ({
      ...prev,
      category: item ? item.id : selectedId
    }));
  };

  // Handle creating a new Category from typed query
  const handleCreateCategory = (newCategoryName: string) => {
    const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newItem: SmartSelectItem = {
      id: slug || newCategoryName,
      label: newCategoryName,
      icon: '📁'
    };

    setCategories(prev => {
      if (prev.some(c => c.label.toLowerCase() === newCategoryName.toLowerCase())) return prev;
      return [...prev, newItem];
    });

    setFormData(prev => ({
      ...prev,
      category: newItem.id
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client.trim() && !formData.clientId.trim()) {
      setError('Please select or create a client');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    // Show loading popup
    setShowSuccessPopup(true);
    setIsLoadingPopup(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseFloat(formData.budget) : 0
        }),
      });

      if (response.ok) {
        const projectData = await response.json();
        
        // Add notification for successful project creation
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              title: 'Project Created Successfully',
              message: `New project "${formData.title}" has been created for client ${formData.client}`,
              type: 'general',
              projectId: projectData.project?._id,
              projectTitle: formData.title,
              clientName: formData.client
            })
          });
          await triggerNotificationRefresh();
        } catch (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1200));
        await triggerNotificationRefresh();
        
        // Refresh clients list in background so project count updates
        fetchClients();

        setIsLoadingPopup(false);
        setSuccessData({
          title: 'Project Berhasil Dibuat! 🎉',
          message: `Project "${formData.title}" untuk client ${formData.client} telah berhasil ditambahkan`
        });
        
        setTimeout(() => {
          triggerDashboardRefresh('project-created');
        }, 1000);
        
        // Reset form
        setFormData({
          title: '',
          client: '',
          clientId: '',
          description: '',
          budget: '',
          deadline: '',
          status: 'active',
          priority: 'medium',
          category: 'web-development'
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create project');
        setShowSuccessPopup(false);
        setIsLoadingPopup(false);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Network error. Please try again.');
      setShowSuccessPopup(false);
      setIsLoadingPopup(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSuccessComplete = () => {
    setShowSuccessPopup(false);
    setIsLoadingPopup(false);
    if (onProjectAdded) {
      onProjectAdded();
    }
  };

  return (
    <div className="space-y-3">
      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-2 rounded-lg flex items-center space-x-2 text-sm"
          style={{ 
            backgroundColor: 'var(--neuro-success-light)', 
            border: '1px solid var(--neuro-success)', 
            color: 'var(--neuro-success)' 
          }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--neuro-success)' }}></div>
          <span>Project created successfully!</span>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3 py-2 rounded-lg flex items-center space-x-2 text-sm"
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

        {/* Project Title */}
        <div>
          <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Project Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-[#1A1D22] border border-white/10 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 transition-all"
            placeholder="Enter project title"
          />
        </div>

        {/* Client (Smart Select + Create) */}
        <div>
          <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Client *</label>
          <SmartSelect
            items={clientSelectItems}
            value={formData.clientId || formData.client}
            onChange={handleClientSelect}
            placeholder="Search or select client..."
            headerTitle="CLIENTS"
            itemTypeLabel="client"
            loading={loadingClients}
            showPlusButton={true}
            plusButtonTitle="Create New Client"
            onPlusClick={handlePlusButtonClick}
            onCreateNew={handleCreateClientFromQuery}
            createItemLabel={(query) => `+ Create "${query}" as new client`}
            normalizeText={normalizeClientName}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-xl bg-[#1A1D22] border border-white/10 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 transition-all resize-none"
            placeholder="Describe your project..."
          />
        </div>

        {/* Budget and Deadline */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Budget ($)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#1A1D22] border border-white/10 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 transition-all font-mono"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {formData.budget && Number(formData.budget) > 0 ? (
              <p className="text-[10px] text-purple-400 mt-1 font-mono">
                ≈ {usdToIdr(Number(formData.budget))}
              </p>
            ) : null}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#1A1D22] border border-white/10 text-slate-100 outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Category</label>
            <SmartSelect
              items={categories}
              value={formData.category}
              onChange={handleCategorySelect}
              placeholder="Select category..."
              headerTitle="CATEGORIES"
              itemTypeLabel="category"
              showPlusButton={false}
              onCreateNew={handleCreateCategory}
              createItemLabel={(query) => `+ Create "${query}"`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#1A1D22] border border-white/10 text-slate-100 outline-none focus:border-purple-500 transition-all"
              required
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-[#1A1D22] border border-white/10 text-slate-100 outline-none focus:border-purple-500 transition-all"
            required
          >
            <option value="active">🔵 Active</option>
            <option value="on-hold">🟡 On Hold</option>
            <option value="completed">🟢 Completed</option>
          </select>
        </div>

        <div className="px-5 py-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: 'var(--neuro-text-primary)' }}></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Create Project</span>
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Create New Client Modal */}
      <CreateClientModal
        isOpen={isClientModalOpen}
        initialName={initialClientName}
        onClose={() => setIsClientModalOpen(false)}
        onClientCreated={handleClientCreated}
        existingClients={clients}
      />

      {/* Success Popup */}
      <SuccessPopup
        isVisible={showSuccessPopup}
        isLoading={isLoadingPopup}
        title={successData.title}
        message={successData.message}
        onComplete={handleSuccessComplete}
      />
    </div>
  );
}