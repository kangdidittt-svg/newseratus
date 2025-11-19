'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, User, Tag, Clock, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { triggerDashboardRefresh } from '../hooks/useRealtimeDashboard';

interface Project {
  id: string;
  title: string;
  client: string;
  description: string;
  category: string;
  status: 'active' | 'completed' | 'pending' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  budget: number;
  deadline: string;
  progress: number;
  createdAt: string;
}

interface ProjectListProps {
  refreshTrigger?: number;
  onAddProject?: () => void;
}

export default function ProjectList({ refreshTrigger, onAddProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Project>>({});
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; projectId: string; projectTitle: string }>({ isOpen: false, projectId: '', projectTitle: '' });
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [refreshTrigger]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const projectsData = data.projects?.map((project: {
          _id?: string;
          id?: string;
          title: string;
          client: string;
          status: string;
          priority: string;
          budget: number;
          deadline: string;
          progress: number;
          description: string;
          category: string;
          createdAt: string;
        }) => ({
          id: project._id || project.id,
          title: project.title,
          client: project.client,
          status: project.status,
          priority: project.priority,
          budget: project.budget,
          deadline: project.deadline,
          progress: project.progress || 0,
          description: project.description,
          category: project.category,
          createdAt: project.createdAt
        })) || [];
        setProjects(projectsData);
      } else {
        console.error('Failed to fetch projects:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const openDeleteModal = (projectId: string, projectTitle: string) => {
    setDeleteModal({ isOpen: true, projectId, projectTitle });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, projectId: '', projectTitle: '' });
  };

  const confirmDelete = () => {
    handleDeleteProject(deleteModal.projectId);
    closeDeleteModal();
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditFormData({
      title: project.title,
      client: project.client,
      description: project.description,
      category: project.category,
      status: project.status,
      priority: project.priority,
      budget: project.budget,
      deadline: project.deadline
    });
  };

  const handleUpdateProject = async () => {
    if (!editingProject) {
      console.log('No editing project found');
      return;
    }
    
    console.log('Updating project:', editingProject.id);
    console.log('Form data:', editFormData);
    
    try {
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editFormData)
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const updatedProject = await response.json();
        console.log('Updated project:', updatedProject);
        
        setProjects(projects.map(p => 
          p.id === editingProject.id ? updatedProject.project : p
        ));
        setEditingProject(null);
        setEditFormData({});
        
        // Trigger dashboard refresh
        triggerDashboardRefresh('project-updated');
        
        // Refresh projects list
        fetchProjects();
        
        alert('Project updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        alert('Failed to update project: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project: ' + (error as Error).message);
    }
  };

  const handleMarkAsComplete = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'completed' })
      });
      
      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(projects.map(p => 
          p.id === projectId ? updatedProject.project : p
        ));
        
        // Trigger dashboard refresh
        triggerDashboardRefresh('project-completed');
      }
    } catch (error) {
      console.error('Error marking project as complete:', error);
    }
  };

  const closeEditModal = () => {
    setEditingProject(null);
    setEditFormData({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return { color: 'var(--neuro-warning)', backgroundColor: 'var(--neuro-warning-light)' };
      case 'in progress': return { color: 'var(--neuro-info)', backgroundColor: 'var(--neuro-info-light)' };
      case 'active': return { color: 'var(--neuro-info)', backgroundColor: 'var(--neuro-info-light)' };
      case 'completed': return { color: 'var(--neuro-success)', backgroundColor: 'var(--neuro-success-light)' };
      case 'on-hold': return { color: 'var(--neuro-error)', backgroundColor: 'var(--neuro-error-light)' };
      default: return { color: 'var(--neuro-text-muted)', backgroundColor: 'var(--neuro-bg-secondary)' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return { color: 'var(--neuro-error)', backgroundColor: 'var(--neuro-error-light)' };
      case 'medium': return { color: 'var(--neuro-orange)', backgroundColor: 'var(--neuro-orange-light)' };
      case 'low': return { color: 'var(--neuro-success)', backgroundColor: 'var(--neuro-success-light)' };
      default: return { color: 'var(--neuro-text-muted)', backgroundColor: 'var(--neuro-bg-secondary)' };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'web-development': return '🌐';
      case 'mobile-app': return '📱';
      case 'design': return '🎨';
      case 'consulting': return '💼';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--neuro-orange)' }}></div>
          <p className="mt-4" style={{ color: 'var(--neuro-text-secondary)' }}>Loading projects...</p>
        </motion.div>
      </div>
    );
  }

  // Calculate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status.toLowerCase() === 'active' || p.status.toLowerCase() === 'in progress').length;
  const completedProjects = projects.filter(p => p.status.toLowerCase() === 'completed').length;
  const pendingProjects = projects.filter(p => p.status.toLowerCase() === 'pending').length;

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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>Project List</h1>
          <p className="mt-1" style={{ color: 'var(--neuro-text-secondary)' }}>Manage all your projects in one place</p>
        </div>
        {onAddProject && (
          <motion.button
            onClick={onAddProject}
            className="neuro-button-orange px-6 py-3 font-semibold transition-all duration-300 flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-5 w-5" />
            <span>Add New Project</span>
          </motion.button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neuro-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--neuro-text-secondary)' }}>Total Projects</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>{totalProjects}</p>
            </div>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--neuro-orange-light)' }}>
              <Tag className="h-6 w-6" style={{ color: 'var(--neuro-orange)' }} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neuro-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--neuro-text-secondary)' }}>Active</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--neuro-info)' }}>{activeProjects}</p>
            </div>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--neuro-info-light)' }}>
              <Clock className="h-6 w-6" style={{ color: 'var(--neuro-info)' }} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, scale: showCompletedOnly ? 1.03 : 1 }}
          transition={{ delay: 0.3 }}
          className="neuro-card p-6 cursor-pointer"
          onClick={() => setShowCompletedOnly(prev => !prev)}
          >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--neuro-text-secondary)' }}>Completed</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--neuro-success)' }}>{completedProjects}</p>
            </div>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--neuro-success-light)' }}>
              <Calendar className="h-6 w-6" style={{ color: 'var(--neuro-success)' }} />
            </div>
          </div>
          
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="neuro-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--neuro-text-secondary)' }}>Pending</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--neuro-warning)' }}>{pendingProjects}</p>
            </div>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--neuro-warning-light)' }}>
              <Clock className="h-6 w-6" style={{ color: 'var(--neuro-warning)' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="neuro-card p-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>No Projects Yet</h3>
            <p className="mb-6" style={{ color: 'var(--neuro-text-secondary)' }}>Start by creating your first project to get organized!</p>
            {onAddProject && (
              <motion.button
                onClick={onAddProject}
                className="neuro-button-orange px-6 py-3 font-semibold inline-flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-5 w-5" />
                <span>Create Project</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(showCompletedOnly ? projects.filter(p => p.status.toLowerCase() === 'completed') : projects).map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="neuro-card overflow-hidden neuro-card-hover transition-all duration-300"
            >
              {/* Project Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(project.category)}</span>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--neuro-text-primary)' }}>{project.title}</h3>
                      <p className="text-sm flex items-center mt-1" style={{ color: 'var(--neuro-text-secondary)' }}>
                        <User className="h-4 w-4 mr-1" style={{ color: 'var(--neuro-text-muted)' }} />
                        {project.client}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="neuro-button p-2 transition-colors"
                      style={{ color: 'var(--neuro-text-muted)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--neuro-orange)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--neuro-text-muted)';
                      }}
                      title="Edit Project"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {project.status !== 'completed' && (
                      <button
                        onClick={() => handleMarkAsComplete(project.id)}
                        className="neuro-button p-2 transition-colors"
                        style={{ color: 'var(--neuro-text-muted)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--neuro-success)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--neuro-text-muted)';
                        }}
                        title="Mark as Complete"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openDeleteModal(project.id, project.title)}
                      className="neuro-button p-2 transition-colors"
                      style={{ color: 'var(--neuro-text-muted)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--neuro-error)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--neuro-text-muted)';
                      }}
                      title="Delete Project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={getStatusColor(project.status)}>
                    {project.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={getPriorityColor(project.priority)}>
                    {project.priority} Priority
                  </span>
                </div>

                {/* Budget */}
                <div className="flex items-center mb-4" style={{ color: 'var(--neuro-text-secondary)' }}>
                  <DollarSign className="h-4 w-4 mr-2" style={{ color: 'var(--neuro-text-muted)' }} />
                  <span className="font-semibold text-lg" style={{ color: 'var(--neuro-success)' }}>
                    ${project.budget.toLocaleString()}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--neuro-text-secondary)' }}>{project.description}</p>

                {/* Deadline */}
                <div className="flex items-center text-sm" style={{ color: 'var(--neuro-text-muted)' }}>
                  <Calendar className="h-4 w-4 mr-2" style={{ color: 'var(--neuro-text-muted)' }} />
                  <span>Due: {formatDate(project.deadline)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pb-6">
                <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--neuro-bg-secondary)' }}>
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: project.status.toLowerCase() === 'completed' ? '100%' : '60%',
                      backgroundColor: 'var(--neuro-orange)'
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--neuro-text-muted)' }}>
                  <span>Progress</span>
                  <span>{project.status.toLowerCase() === 'completed' ? '100%' : '60%'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="neuro-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>Edit Project</h2>
              <button
                onClick={closeEditModal}
                className="neuro-button p-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Project Title</label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="neuro-input w-full px-4 py-2"
                  placeholder="Enter project title"
                />
              </div>

              {/* Client */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Client</label>
                <input
                  type="text"
                  value={editFormData.client || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, client: e.target.value })}
                  className="neuro-input w-full px-4 py-2"
                  placeholder="Enter client name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Description</label>
                <textarea
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  className="neuro-input w-full px-4 py-2"
                  placeholder="Enter project description"
                />
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Category</label>
                  <select
                    value={editFormData.category || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="neuro-select w-full px-4 py-2"
                  >
                    <option value="web-development">Web Development</option>
                    <option value="mobile-app">Mobile App</option>
                    <option value="design">Design</option>
                    <option value="consulting">Consulting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Status</label>
                  <select
                    value={editFormData.status || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'active' | 'completed' | 'pending' | 'on-hold' })}
                    className="neuro-select w-full px-4 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Priority and Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Priority</label>
                  <select
                    value={editFormData.priority || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="neuro-select w-full px-4 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Budget ($)</label>
                  <input
                    type="number"
                    value={editFormData.budget || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, budget: Number(e.target.value) })}
                    className="neuro-input w-full px-4 py-2"
                    placeholder="Enter budget"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Deadline</label>
                <input
                  type="date"
                  value={editFormData.deadline ? editFormData.deadline.split('T')[0] : ''}
                  onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                  className="neuro-input w-full px-4 py-2"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6 pt-6" style={{ borderTop: '1px solid var(--neuro-border)' }}>
              <button
                onClick={closeEditModal}
                className="neuro-button px-6 py-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                className="neuro-button-orange px-6 py-2 transition-all duration-300"
              >
                Update Project
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteModal.projectTitle}"? This action cannot be undone and will permanently remove all project data.`}
        confirmText="Delete Project"
        cancelText="Cancel"
      />
    </motion.div>
  );
}