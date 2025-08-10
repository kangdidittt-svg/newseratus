'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { triggerDashboardRefresh } from '../hooks/useRealtimeDashboard';
import { triggerNotificationRefresh } from '../hooks/useNotificationRefresh';
import SuccessPopup from './SuccessPopup';

interface AddProjectProps {
  onProjectAdded?: () => void;
}

export default function AddProject({ onProjectAdded }: AddProjectProps) {
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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoadingPopup, setIsLoadingPopup] = useState(false);
  const [successData, setSuccessData] = useState({ title: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          // Trigger immediate notification refresh
          await triggerNotificationRefresh();
        } catch (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
        
        // Simulate processing time untuk efek loading yang lebih realistis
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Trigger notification refresh again after loading
        await triggerNotificationRefresh();
        
        // Stop loading dan show success
        setIsLoadingPopup(false);
        setSuccessData({
          title: 'Project Berhasil Dibuat! 🎉',
          message: `Project "${formData.title}" untuk client ${formData.client} telah berhasil ditambahkan`
        });
        
        // Trigger dashboard refresh setelah delay
        setTimeout(() => {
          triggerDashboardRefresh('project-created');
        }, 1000);
        
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
        setTimeout(() => setSuccess(false), 3000);
        if (onProjectAdded) {
          onProjectAdded();
        }
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>Add New Project</h1>
        <p className="mt-1" style={{ color: 'var(--neuro-text-secondary)' }}>Create a new project to start tracking your work</p>
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
          <span>Project created successfully!</span>
        </motion.div>
      )}

      {/* Form */}
      <div className="neuro-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Project Title */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Project Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="neuro-input w-full px-4 py-3 transition-all"
              placeholder="Enter project title"
            />
          </div>

          {/* Client */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Client *</label>
            <input
              type="text"
              required
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="neuro-input w-full px-4 py-3 transition-all"
              placeholder="Enter client name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="neuro-input w-full px-4 py-3 transition-all resize-none"
              placeholder="Describe your project..."
            />
          </div>

          {/* Budget and Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Budget ($)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="neuro-input w-full px-4 py-3 transition-all"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="neuro-input w-full px-4 py-3 transition-all"
              />
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="neuro-select w-full px-4 py-2"
                required
              >
                <option value="web-development">🌐 Web Development</option>
                <option value="mobile-app">📱 Mobile App</option>
                <option value="design">🎨 Design</option>
                <option value="consulting">💼 Consulting</option>
                <option value="other">📋 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="neuro-select w-full px-4 py-2"
                required
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="neuro-select w-full px-4 py-2"
                required
              >
                <option value="active">🔵 Active</option>
                <option value="on-hold">🟡 On Hold</option>
                <option value="completed">🟢 Completed</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="neuro-button-orange w-full py-4 px-6 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--neuro-text-primary)' }}></div>
                  <span>Creating Project...</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>Create Project</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="neuro-card p-6">
        <h3 className="font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>💡 Tips for Creating Projects</h3>
        <ul className="text-sm space-y-1" style={{ color: 'var(--neuro-text-secondary)' }}>
          <li>• Use descriptive titles to easily identify your projects</li>
          <li>• Set realistic deadlines to manage expectations</li>
          <li>• Choose the right priority level to organize your workflow</li>
          <li>• Add detailed descriptions to track project requirements</li>
        </ul>
      </div>
      
      {/* Success Popup */}
       <SuccessPopup
         isVisible={showSuccessPopup}
         isLoading={isLoadingPopup}
         title={successData.title}
         message={successData.message}
         onComplete={handleSuccessComplete}
       />
    </motion.div>
  );
}