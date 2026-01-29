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
  status: 'ongoing' | 'completed';
  priority: 'low' | 'medium' | 'high';
  budget: number;
  deadline: string;
  progress: number;
  createdAt: string;
  masterLink?: string;
  masterNotes?: string;
}

interface ProjectListProps {
  refreshTrigger?: number;
  onAddProject?: () => void;
}

export default function ProjectList({ refreshTrigger, onAddProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Project> & { noMasterFile?: boolean }>({});
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; projectId: string; projectTitle: string }>({ isOpen: false, projectId: '', projectTitle: '' });
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [refreshTrigger, filterStatus]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ status?: string }>;
      if (ce.detail?.status) {
        setFilterStatus(ce.detail.status);
      }
    };
    window.addEventListener('projects:setFilter', handler);
    return () => window.removeEventListener('projects:setFilter', handler);
  }, []);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      params.set('limit', 'all');
      const response = await fetch(`/api/projects?${params.toString()}`, {
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
          masterLink?: string;
          masterNotes?: string;
        }) => ({
          id: project._id || project.id,
          title: project.title,
          client: project.client,
          status: (project.status || '').toLowerCase(),
          priority: project.priority,
          budget: project.budget,
          deadline: project.deadline,
          progress: project.progress || 0,
          description: project.description,
          category: project.category,
          createdAt: project.createdAt,
          masterLink: project.masterLink,
          masterNotes: project.masterNotes
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
      deadline: project.deadline,
      masterLink: project.masterLink,
      masterNotes: project.masterNotes,
      noMasterFile: !project.masterLink
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
      // Enforce master link when setting status to completed
      const wantsCompleted = editFormData.status === 'completed';
      const hasMasterLink = !!editFormData.masterLink && editFormData.masterLink.trim().length > 0;
      const skipMaster = !!editFormData.noMasterFile;

      if (wantsCompleted && !hasMasterLink && !skipMaster) {
        alert('Masukkan link Master File atau centang "Tanpa master file" sebelum menyelesaikan project.');
        return;
      }

      // Update master files first if provided
      if (editFormData.masterLink !== undefined || editFormData.masterNotes !== undefined) {
        const respMaster = await fetch(`/api/projects/${editingProject.id}/master-files`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            masterLink: editFormData.masterLink,
            masterNotes: editFormData.masterNotes
          })
        });
        if (!respMaster.ok) {
          const err = await respMaster.json().catch(() => ({ error: 'Unknown error' }));
          alert('Gagal menyimpan Master File (link): ' + (err.error || 'Unknown error') + ' — melanjutkan dengan metode alternatif.');
          // fallback: akan disimpan melalui update fields umum di bawah
        }
      }

      // Prepare update payload excluding status if we will handle completion via studio endpoint
      const { status: _status, noMasterFile: _noMasterFile, ...otherFields } = editFormData;

      // Update other fields
      if (Object.keys(otherFields).length > 0) {
        const responseFields = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(otherFields)
        });
        if (!responseFields.ok) {
          const errorData = await responseFields.json();
          alert('Failed to update project fields: ' + (errorData.error || 'Unknown error'));
          return;
        }
      }

      // Handle completion via studio-library endpoint to set completedAt
      if (wantsCompleted) {
        const responseComplete = await fetch(`/api/projects/${editingProject.id}/studio-library`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ confirm: skipMaster })
        });

        const dataComplete = await responseComplete.json();
        if (dataComplete && dataComplete.confirmRequired) {
          alert('Master link belum terdeteksi di server. Isi link atau centang "Tanpa master file" untuk melanjutkan.');
          return;
        }
        if (!responseComplete.ok) {
          // Gracefully handle already completed case
          if (responseComplete.status === 400 && (dataComplete?.error || '').toLowerCase().includes('already')) {
            // continue as success
          } else {
            if (dataComplete && dataComplete.confirmRequired) {
              alert('Master link belum terdeteksi di server. Isi link atau centang "Tanpa master file" untuk melanjutkan.');
            } else {
              alert('Gagal memindahkan ke Studio Library: ' + (dataComplete.error || 'Unknown error'));
            }
            return;
          }
        }

        // Optimistically update local state to completed
        setProjects(prev => prev.map(p =>
          p.id === editingProject.id
            ? { ...p, status: 'completed' as const }
            : p
        ));
      }

      // Refresh list and UI
      setEditingProject(null);
      setEditFormData({});
      triggerDashboardRefresh('project-updated');
      fetchProjects();
      alert('Project updated successfully!');
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project: ' + (error as Error).message);
    }
  };

  const handleMarkAsComplete = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    // Open edit modal and preset status to completed to enforce master link requirement
    handleEditProject({ ...project, status: 'completed' });
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
      case 'ongoing':
      case 'active':
      case 'in progress':
      case 'pending':
      case 'on-hold':
        return { color: 'var(--neuro-info)', backgroundColor: 'var(--neuro-info-light)' };
      case 'completed':
        return { color: 'var(--neuro-success)', backgroundColor: 'var(--neuro-success-light)' };
      case 'cancelled':
        return { color: 'var(--neuro-error)', backgroundColor: 'var(--neuro-error-light)' };
      default:
        return { color: 'var(--neuro-text-muted)', backgroundColor: 'var(--neuro-bg-secondary)' };
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
  const activeProjects = projects.filter(p => p.status.toLowerCase() !== 'completed' && p.status.toLowerCase() !== 'cancelled').length;
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

      {/* Filters */}
      <div className="neuro-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs" style={{ color: 'var(--neuro-text-secondary)' }}>Status</label>
            <select
              className="neuro-input w-full mt-1 px-3 py-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="ongoing">Aktif/Ongoing</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
              <option value="pending">Pending</option>
              <option value="on-hold">On Hold</option>
              <option value="in progress">In Progress</option>
              <option value="active">Active</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="neuro-button px-4 py-2"
              onClick={() => { setLoading(true); fetchProjects(); }}
            >
              Terapkan Filter
            </button>
          </div>
        </div>
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
                    value={editFormData.status || 'ongoing'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'ongoing' | 'completed' })}
                    className="neuro-select w-full px-4 py-2"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
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

              {/* Master Files */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Master File Link</label>
                  <input
                    type="url"
                    value={editFormData.masterLink || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, masterLink: e.target.value })}
                    className="neuro-input w-full px-4 py-2"
                    placeholder="https://drive.google.com/..."
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--neuro-text-secondary)' }}>Wajib diisi jika status diubah ke Completed</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="noMasterFile"
                    type="checkbox"
                    checked={!!editFormData.noMasterFile}
                    onChange={(e) => setEditFormData({ ...editFormData, noMasterFile: e.target.checked })}
                  />
                  <label htmlFor="noMasterFile" className="text-sm" style={{ color: 'var(--neuro-text-primary)' }}>Tanpa master file</label>
                </div>
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
