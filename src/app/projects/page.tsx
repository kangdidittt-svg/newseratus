'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Calendar, DollarSign, User, Tag, Clock, ArrowLeft } from 'lucide-react';

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

export default function ProjectListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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
      default: return 'text-primary bg-primary/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-accent bg-accent/20';
      case 'medium': return 'text-primary bg-primary/20';
      case 'low': return 'text-secondary bg-secondary/20';
      default: return 'text-primary bg-primary/20';
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-gray-600 hover:text-primary hover:bg-white rounded-lg transition-all duration-200 shadow-sm"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Daftar Project
              </h1>
              <p className="mt-2 text-gray-600">Semua project yang telah dibuat</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{projects.length}</div>
              <div className="text-sm text-gray-600">Total Project</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-cyan-600">
                {projects.filter(p => p.status.toLowerCase() === 'active' || p.status.toLowerCase() === 'in progress').length}
              </div>
              <div className="text-sm text-gray-600">Aktif</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-pink-600">
                {projects.filter(p => p.status.toLowerCase() === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Selesai</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {projects.filter(p => p.status.toLowerCase() === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>

        {/* Project List */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada project</h3>
            <p className="text-gray-500 mb-6">Mulai dengan membuat project pertama Anda</p>
            <button
              onClick={() => router.push('/projects/new')}
              className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg hover:from-primary/80 hover:to-accent/80 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Buat Project Baru
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-200 overflow-hidden">
                <div className="p-6">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getCategoryIcon(project.category)}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{project.client}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>
                  </div>

                  {/* Project Description */}
                  {project.description && (
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">{project.description}</p>
                    </div>
                  )}

                  {/* Project Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-xs text-gray-500">Kategori</span>
                        <p className="text-sm font-medium capitalize">{project.category.replace('-', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-xs text-gray-500">Budget</span>
                        <p className="text-sm font-medium">${project.budget.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-xs text-gray-500">Deadline</span>
                        <p className="text-sm font-medium">{project.deadline ? formatDate(project.deadline) : 'Tidak ada'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-xs text-gray-500">Dibuat</span>
                        <p className="text-sm font-medium">{formatDate(project.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar (visual representation based on status) */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        project.status.toLowerCase() === 'completed' ? 'bg-green-500 w-full' :
                        project.status.toLowerCase() === 'in progress' || project.status.toLowerCase() === 'active' ? 'bg-blue-500 w-3/4' :
                        project.status.toLowerCase() === 'pending' ? 'bg-yellow-500 w-1/4' :
                        'bg-gray-400 w-1/2'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push('/projects/new')}
            className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Buat Project Baru
          </button>
          <button
            onClick={() => router.push('/projects/manage')}
            className="bg-white/70 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-lg hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20"
          >
            Kelola Project
          </button>
        </div>
      </div>
    </div>
  );
}