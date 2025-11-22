'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calculator, PlusCircle } from 'lucide-react';
import { triggerDashboardRefresh } from '../hooks/useRealtimeDashboard';
import { triggerNotificationRefresh } from '../hooks/useNotificationRefresh';
import SuccessPopup from './SuccessPopup';
import SmartPricingSuggestion from './SmartPricingSuggestion';

interface WorkType {
  _id: string;
  name: string;
  category: string;
}

interface ComplexityLevel {
  _id: string;
  name: string;
  weight: number;
}

interface AddProjectProps {
  onProjectAdded?: () => void;
}

export default function AddProjectStudio({ onProjectAdded }: AddProjectProps) {
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    description: '',
    budget: '',
    deadline: '',
    status: 'ongoing',
    priority: 'medium',
    category: 'Design',
    workTypeId: '',
    complexityId: '',
    hourlyRate: '',
    hoursWorked: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoadingPopup, setIsLoadingPopup] = useState(false);
  const [successData, setSuccessData] = useState({ title: '', message: '' });
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [complexityLevels, setComplexityLevels] = useState<ComplexityLevel[]>([]);
  const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
  const [newWorkTypeName, setNewWorkTypeName] = useState('');

  useEffect(() => {
    fetchWorkTypesAndComplexity();
  }, []);

  const fetchWorkTypesAndComplexity = async () => {
    try {
      const [workTypesRes, complexityRes] = await Promise.all([
        fetch('/api/work-types'),
        fetch('/api/complexity-levels')
      ]);

      if (workTypesRes.ok) {
        const data = await workTypesRes.json();
        setWorkTypes(data);
      }

      if (complexityRes.ok) {
        const data = await complexityRes.json();
        setComplexityLevels(data);
      }
    } catch (error) {
      console.error('Error fetching work types and complexity levels:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
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
          budget: formData.budget ? parseFloat(formData.budget) : 0,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : 0,
          hoursWorked: formData.hoursWorked ? parseFloat(formData.hoursWorked) : 0
        }),
      });

      if (response.ok) {
        const projectData = await response.json();
        
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
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        await triggerNotificationRefresh();
        
        setIsLoadingPopup(false);
        setSuccessData({
          title: 'Project Berhasil Dibuat! 🎉',
          message: `Project "${formData.title}" untuk client ${formData.client} telah berhasil ditambahkan`
        });
        
        setTimeout(() => {
          triggerDashboardRefresh('project-created');
        }, 1000);
        
        setFormData({
          title: '',
          client: '',
          description: '',
          budget: '',
          deadline: '',
          status: 'ongoing',
          priority: 'medium',
          category: 'Design',
          workTypeId: '',
          complexityId: '',
          hourlyRate: '',
          hoursWorked: ''
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

  const handleCreateWorkType = async () => {
    if (!newWorkTypeName.trim()) return;

    try {
      const response = await fetch('/api/work-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWorkTypeName, category: formData.category })
      });

      if (response.ok) {
        const newWorkType = await response.json();
        setWorkTypes([...workTypes, newWorkType]);
        setFormData({ ...formData, workTypeId: newWorkType._id });
        setNewWorkTypeName('');
        setShowWorkTypeModal(false);
      }
    } catch (error) {
      console.error('Error creating work type:', error);
    }
  };

  const handleUsePricingRecommendation = (recommendedPrice: number) => {
    setFormData({ ...formData, budget: recommendedPrice.toString() });
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
        <p className="mt-1" style={{ color: 'var(--neuro-text-secondary)' }}>Create a new project with Studio features</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
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

              {/* Category and Work Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="neuro-select w-full px-4 py-2"
                    required
                  >
                    <option value="Design">🎨 Design</option>
                    <option value="Web Development">🌐 Web Development</option>
                    <option value="Mobile App">📱 Mobile App</option>
                    <option value="Consulting">💼 Consulting</option>
                    <option value="Other">📋 Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Work Type</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.workTypeId}
                      onChange={(e) => setFormData({ ...formData, workTypeId: e.target.value })}
                      className="neuro-select w-full px-4 py-2"
                    >
                      <option value="">Select Work Type</option>
                      {workTypes.map((workType) => (
                        <option key={workType._id} value={workType._id}>
                          {workType.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowWorkTypeModal(true)}
                      className="neuro-button p-2"
                      title="Add New Work Type"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Complexity and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Complexity</label>
                  <select
                    value={formData.complexityId}
                    onChange={(e) => setFormData({ ...formData, complexityId: e.target.value })}
                    className="neuro-select w-full px-4 py-2"
                  >
                    <option value="">Select Complexity</option>
                    {complexityLevels.map((complexity) => (
                      <option key={complexity._id} value={complexity._id}>
                        {complexity.name} (Weight: {complexity.weight})
                      </option>
                    ))}
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

              {/* Budget and Hourly Rate */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Budget (IDR)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="neuro-input w-full px-4 py-3 transition-all"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Hourly Rate (IDR)</label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="neuro-input w-full px-4 py-3 transition-all"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Hours Worked</label>
                  <input
                    type="number"
                    value={formData.hoursWorked}
                    onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                    className="neuro-input w-full px-4 py-3 transition-all"
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="neuro-input w-full px-4 py-3 transition-all"
                />
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
        </div>

        {/* Smart Pricing Sidebar */}
        <div>
          <SmartPricingSuggestion
            category={formData.category}
            workTypeId={formData.workTypeId}
            complexityId={formData.complexityId}
            onUseRecommendation={handleUsePricingRecommendation}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="neuro-card p-6">
        <h3 className="font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>💡 Tips for Creating Projects</h3>
        <ul className="text-sm space-y-1" style={{ color: 'var(--neuro-text-secondary)' }}>
          <li>• Use descriptive titles to easily identify your projects</li>
          <li>• Set realistic deadlines to manage expectations</li>
          <li>• Choose the right work type and complexity for better pricing insights</li>
          <li>• Use the Smart Pricing feature to get recommendations based on similar projects</li>
        </ul>
      </div>
      
      {/* Work Type Modal */}
      {showWorkTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="neuro-card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--neuro-text-primary)' }}>
              Tambah Jenis Pekerjaan
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
                  Nama Jenis Pekerjaan
                </label>
                <input
                  type="text"
                  value={newWorkTypeName}
                  onChange={(e) => setNewWorkTypeName(e.target.value)}
                  className="neuro-input w-full px-4 py-3"
                  placeholder="Contoh: Tracing, Mockup, Layout"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowWorkTypeModal(false);
                  setNewWorkTypeName('');
                }}
                className="neuro-button-secondary flex-1 py-2"
              >
                Batal
              </button>
              <button
                onClick={handleCreateWorkType}
                className="neuro-button-orange flex-1 py-2"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
      
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