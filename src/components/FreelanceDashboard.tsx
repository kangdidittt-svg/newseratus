'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  FolderOpen,
  TrendingUp,
  Calendar,
  User,
  AlertCircle,
  Plus
} from 'lucide-react';
import EdinburghClock from './EdinburghClock';
import RobotAssistant from './RobotAssistant';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalEarnings: number;
  totalHours: number;
  averageHourlyRate: number;
  totalPendingPayments: number;
}

interface Project {
  _id: string;
  title: string;
  client: string;
  status: string;
  priority: string;
  budget: number;
  deadline?: string;
  createdAt: string;
}

interface FreelanceDashboardProps {
  onNavigate?: (tab: string) => void;
}

export default function FreelanceDashboard({ onNavigate }: FreelanceDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSubmitting, setIsSubmitting] = useState(false);

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


  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Removed useEffect dependency on showModal to prevent conflicts

  const closeModal = () => {
    setShowAddProjectModal(false);
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
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
        closeModal();
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        console.error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentProjects(data.recentProjects || []);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'on-hold': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="neuro-card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="neuro-card p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="neuro-button px-4 py-2 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards and Clock Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards - 2x2 Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neuro-card p-6 hover:neuro-card-hover transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter mb-1" style={{ color: 'var(--neuro-text-secondary)' }}>
                Total Projects
              </p>
              <p className="text-2xl font-bold font-inter" style={{ color: 'var(--neuro-text-primary)' }}>
                {stats?.totalProjects || 0}
              </p>
            </div>
            <div className="neuro-card w-12 h-12 flex items-center justify-center">
              <FolderOpen className="w-6 h-6" style={{ color: 'var(--neuro-orange)' }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neuro-card p-6 hover:neuro-card-hover transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter mb-1" style={{ color: 'var(--neuro-text-secondary)' }}>
                Active Projects
              </p>
              <p className="text-2xl font-bold font-inter" style={{ color: 'var(--neuro-text-primary)' }}>
                {stats?.activeProjects || 0}
              </p>
            </div>
            <div className="neuro-card w-12 h-12 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" style={{ color: 'var(--neuro-success)' }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="neuro-card p-6 hover:neuro-card-hover transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter mb-1" style={{ color: 'var(--neuro-text-secondary)' }}>
                Total Earnings
              </p>
              <p className="text-2xl font-bold font-inter" style={{ color: 'var(--neuro-text-primary)' }}>
                ${stats?.totalEarnings?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="neuro-card w-12 h-12 flex items-center justify-center">
              <DollarSign className="w-6 h-6" style={{ color: 'var(--neuro-orange)' }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="neuro-card p-6 hover:neuro-card-hover transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter mb-1" style={{ color: 'var(--neuro-text-secondary)' }}>
                Pending Payment
              </p>
              <p className="text-2xl font-bold font-inter" style={{ color: 'var(--neuro-text-primary)' }}>
                ${stats?.totalPendingPayments?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="neuro-card w-12 h-12 flex items-center justify-center">
              <DollarSign className="w-6 h-6" style={{ color: 'var(--neuro-warning)' }} />
            </div>
          </div>
        </motion.div>
        </div>
        
        {/* Robot Assistant */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 flex items-center justify-center"
          style={{
            background: 'transparent',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)'
          }}
        >
          <RobotAssistant 
            projects={recentProjects} 
            onReminder={(type) => {
              // Handle different reminder types
              if (type === 'project') {
                onNavigate?.('projects');
              }
            }}
          />
        </motion.div>
      </div>

      {/* Recent Projects and Edinburgh Clock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 neuro-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold font-inter" style={{ color: 'var(--neuro-text-primary)' }}>
              Recent Projects
            </h2>
            <button
              onClick={() => onNavigate?.('projects')}
              className="text-sm font-inter transition-colors hover:opacity-80"
              style={{ color: 'var(--neuro-orange)' }}
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.slice(0, 5).map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="neuro-card-pressed p-4 hover:neuro-card transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold font-inter mb-1" style={{ color: 'var(--neuro-text-primary)' }}>
                        {project.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {project.client}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${project.budget?.toLocaleString() || '0'}
                        </span>
                        {project.deadline && (
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--neuro-text-light)' }} />
                <p className="font-inter" style={{ color: 'var(--neuro-text-secondary)' }}>
                  No projects yet. Create your first project to get started!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Edinburgh Clock */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="neuro-card p-0 relative flex items-center justify-center h-full"
          style={{
            background: 'linear-gradient(135deg, var(--neuro-bg-primary), var(--neuro-bg-secondary))',
            overflow: 'hidden',
            minHeight: '100%'
          }}
        >
          <EdinburghClock />

          {/* Add Project Form Modal */}
           <div 
             className={`fixed inset-0 z-50 ${showAddProjectModal ? 'block' : 'hidden'}`}
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
             onClick={closeModal}
           >
             <div className="flex items-center justify-center min-h-screen p-4" onClick={(e) => e.stopPropagation()}>
               <div
                 className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 max-h-[80vh] overflow-y-auto w-full max-w-md"
                 onClick={(e) => e.stopPropagation()}
               >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Add New Project
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleAddProject} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter project title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        name="client"
                        value={formData.client}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter client name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Describe your project..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Budget ($)
                      </label>
                      <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="web-development">Web Development</option>
                        <option value="mobile-app">Mobile App</option>
                        <option value="design">Design</option>
                        <option value="consulting">Consulting</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Deadline
                      </label>
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('add-project')}
                      className="neuro-button-orange px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Project</span>
                    </button>
                  </div>
                </form>
               </div>
             </div>
           </div>


        </motion.div>
      </div>


    </div>
  );
}