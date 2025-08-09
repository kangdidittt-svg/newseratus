'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

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
        setTimeout(() => setSuccess(false), 3000);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Project</h1>
        <p className="text-gray-600 mt-1">Create a new project to start tracking your work</p>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Project created successfully!</span>
        </motion.div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{error}</span>
            </motion.div>
          )}

          {/* Project Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Enter project title"
            />
          </div>

          {/* Client */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Client *</label>
            <input
              type="text"
              required
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter client name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="Describe your project..."
            />
          </div>

          {/* Budget and Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Budget ($)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="web-development">🌐 Web Development</option>
                <option value="mobile-app">📱 Mobile App</option>
                <option value="design">🎨 Design</option>
                <option value="consulting">💼 Consulting</option>
                <option value="other">📋 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="font-semibold text-indigo-900 mb-2">💡 Tips for Creating Projects</h3>
        <ul className="text-sm text-indigo-700 space-y-1">
          <li>• Use descriptive titles to easily identify your projects</li>
          <li>• Set realistic deadlines to manage expectations</li>
          <li>• Choose the right priority level to organize your workflow</li>
          <li>• Add detailed descriptions to track project requirements</li>
        </ul>
      </div>
    </motion.div>
  );
}