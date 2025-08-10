'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface AddProjectCompactProps {
  onProjectAdded?: () => void;
}

export default function AddProjectCompact({ onProjectAdded }: AddProjectCompactProps) {
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    description: '',
    budget: '',
    deadline: '',
    status: 'active',
    priority: 'medium',
    category: 'web-development'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

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
        // Reset form
        setFormData({
          title: '',
          client: '',
          description: '',
          budget: '',
          deadline: '',
          status: 'active',
          priority: 'medium',
          category: 'web-development'
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        if (onProjectAdded) {
          onProjectAdded();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
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
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Project Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="neuro-input w-full px-3 py-2 text-sm transition-all"
            placeholder="Enter project title"
          />
        </div>

        {/* Client */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Client *</label>
          <input
            type="text"
            required
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            className="neuro-input w-full px-3 py-2 text-sm transition-all"
            placeholder="Enter client name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="neuro-input w-full px-3 py-2 text-sm transition-all resize-none"
            placeholder="Describe your project..."
          />
        </div>

        {/* Budget and Deadline */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Budget ($)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="neuro-input w-full px-3 py-2 text-sm transition-all"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="neuro-input w-full px-3 py-2 text-sm transition-all"
            />
          </div>
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="neuro-select w-full px-3 py-2 text-sm"
              required
            >
              <option value="web-development">🌐 Web Dev</option>
              <option value="mobile-app">📱 Mobile</option>
              <option value="design">🎨 Design</option>
              <option value="consulting">💼 Consulting</option>
              <option value="other">📋 Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="neuro-select w-full px-3 py-2 text-sm"
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
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="neuro-select w-full px-3 py-2 text-sm"
            required
          >
            <option value="active">🔵 Active</option>
            <option value="on-hold">🟡 On Hold</option>
            <option value="completed">🟢 Completed</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="neuro-button-orange w-full py-3 px-4 font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
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
          </motion.button>
        </div>
      </form>
    </div>
  );
}