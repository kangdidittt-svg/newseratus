'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, User, Tag, Clock, Plus, Edit, Trash2, Check, X } from 'lucide-react';

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
  onEditProject?: (project: Project) => void;
  onAddProject?: () => void;
}

export default function ProjectList({ refreshTrigger, onEditProject, onAddProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Project>>({});

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
    if (!confirm('Are you sure you want to delete this project?')) return;
    
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
      case 'pending': return 'text-primary bg-primary/20';
      case 'in progress': return 'text-accent bg-accent/20';
      case 'active': return 'text-accent bg-accent/20';
      case 'completed': return 'text-secondary bg-secondary/20';
      case 'on-hold': return 'text-primary bg-primary/20';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-secondary bg-secondary/20';
      case 'medium': return 'text-primary bg-primary/20';
      case 'low': return 'text-accent bg-accent/20';
      default: return 'text-gray-600 bg-gray-100';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Project List</h1>
          <p className="text-gray-600 mt-1">Manage all your projects in one place</p>
        </div>
        {onAddProject && (
          <motion.button
            onClick={onAddProject}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 hover:from-purple-700 hover:to-pink-700 btn-animate"
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
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-cyan-600">{activeProjects}</p>
            </div>
            <div className="h-12 w-12 bg-accent/20 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-accent" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-pink-600">{completedProjects}</p>
            </div>
            <div className="h-12 w-12 bg-secondary/20 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-purple-600">{pendingProjects}</p>
            </div>
            <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
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
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-6">Start by creating your first project to get organized!</p>
            {onAddProject && (
              <motion.button
                onClick={onAddProject}
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center space-x-2"
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
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Project Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(project.category)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{project.title}</h3>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <User className="h-4 w-4 mr-1" />
                        {project.client}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Project"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {project.status !== 'completed' && (
                      <button
                        onClick={() => handleMarkAsComplete(project.id)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Mark as Complete"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority} Priority
                  </span>
                </div>

                {/* Budget */}
                <div className="flex items-center text-gray-600 mb-4">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span className="font-semibold text-lg text-green-600">
                    ${project.budget.toLocaleString()}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                {/* Deadline */}
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Due: {formatDate(project.deadline)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: project.status.toLowerCase() === 'completed' ? '100%' : '60%' }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
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
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Project</h2>
              <button
                onClick={closeEditModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus-ring"
                  placeholder="Enter project title"
                />
              </div>

              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                <input
                  type="text"
                  value={editFormData.client || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, client: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus-ring"
                  placeholder="Enter client name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter project description"
                />
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={editFormData.category || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="web-development">Web Development</option>
                    <option value="mobile-app">Mobile App</option>
                    <option value="design">Design</option>
                    <option value="consulting">Consulting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editFormData.status || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'active' | 'completed' | 'pending' | 'on-hold' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={editFormData.priority || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget ($)</label>
                  <input
                    type="number"
                    value={editFormData.budget || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, budget: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter budget"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                <input
                  type="date"
                  value={editFormData.deadline ? editFormData.deadline.split('T')[0] : ''}
                  onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={closeEditModal}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors btn-animate"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-pink-700 btn-animate"
              >
                Update Project
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}