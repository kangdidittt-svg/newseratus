'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, CheckCircle, X, Save } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  client: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  budget: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

interface EditFormData {
  title: string;
  client: string;
  description: string;
  category: string;
  priority: string;
  budget: string;
  deadline: string;
}

function SuccessPopup({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <p className="text-center text-gray-800 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default function ManageProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: '',
    client: '',
    description: '',
    category: 'web-development',
    priority: 'medium',
    budget: '',
    deadline: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProjects();
  }, [user, router]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project._id);
    setEditFormData({
      title: project.title,
      client: project.client,
      description: project.description,
      category: project.category,
      priority: project.priority,
      budget: project.budget.toString(),
      deadline: project.deadline ? project.deadline.split('T')[0] : ''
    });
  };

  const handleSaveEdit = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...editFormData,
          budget: parseFloat(editFormData.budget) || 0
        })
      });

      if (response.ok) {
        setEditingProject(null);
        fetchProjects();
        setSuccessMessage('Project berhasil diperbarui!');
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus project ini?')) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          fetchProjects();
          setSuccessMessage('Project berhasil dihapus!');
          setShowSuccess(true);
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleComplete = async (project: Project) => {
    try {
      const response = await fetch(`/api/projects/${project._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'completed',
          totalEarned: project.budget
        })
      });

      if (response.ok) {
        fetchProjects();
        const formattedBudget = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(project.budget);
        setSuccessMessage(`Project "${project.title}" telah selesai! Pendapatan ${formattedBudget} telah ditambahkan.`);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Error completing project:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-secondary bg-secondary/20';
      case 'medium': return 'text-primary bg-primary/20';
      case 'low': return 'text-accent bg-accent/20';
      default: return 'text-primary bg-primary/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-accent bg-accent/20';
      case 'completed': return 'text-secondary bg-secondary/20';
      case 'on-hold': return 'text-primary bg-primary/20';
      default: return 'text-primary bg-primary/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showSuccess && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kelola Project</h1>
          <p className="mt-2 text-gray-600">Kelola semua project Anda dengan mudah</p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Belum ada project yang dibuat</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Kembali ke Dashboard
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-white rounded-lg shadow-md p-6">
                {editingProject === project._id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Judul Project</label>
                        <input
                          type="text"
                          value={editFormData.title}
                          onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                        <input
                          type="text"
                          value={editFormData.client}
                          onChange={(e) => setEditFormData({ ...editFormData, client: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                      <textarea
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <select
                          value={editFormData.category}
                          onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="web-development">Web Development</option>
                          <option value="mobile-app">Mobile App</option>
                          <option value="design">Design</option>
                          <option value="consulting">Consulting</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                        <select
                          value={editFormData.priority}
                          onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                        <input
                          type="number"
                          value={editFormData.budget}
                          onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                      <input
                        type="date"
                        value={editFormData.deadline}
                        onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(project._id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingProject(null)}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                        <p className="text-gray-600">Client: {project.client}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                          title="Edit Project"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          title="Hapus Project"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        {project.status !== 'completed' && (
                          <button
                            onClick={() => handleComplete(project)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                            title="Selesaikan Project"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Kategori:</span>
                        <p className="font-medium capitalize">{project.category.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Status:</span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Prioritas:</span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Budget:</span>
                        <p className="font-medium">Rp {project.budget.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    
                    {project.description && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-500">Deskripsi:</span>
                        <p className="text-gray-700">{project.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <span>Deadline: </span>
                        <span>{project.deadline ? formatDate(project.deadline) : 'Tidak ada'}</span>
                      </div>
                      <div>
                        <span>Dibuat: </span>
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}