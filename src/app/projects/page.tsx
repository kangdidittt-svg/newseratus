'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Calendar, DollarSign, User, Tag, Clock, ArrowLeft, ChevronRight } from 'lucide-react';

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

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  pendingProjectsCount: number;
  totalEarnings: number;
  totalHours: number;
  totalPendingPayments: number;
}

export default function ProjectListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterStart, setFilterStart] = useState<string>('');
  const [filterEnd, setFilterEnd] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProjects();
    fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      params.set('limit', 'all');
      if (filterStatus) params.set('status', filterStatus);
      if (filterMonth) params.set('month', filterMonth);
      if (filterStart) params.set('start', filterStart);
      if (filterEnd) params.set('end', filterEnd);
      const response = await fetch(`/api/projects?${params.toString()}`, {
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
      case 'ongoing': return 'text-accent bg-accent/20';
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

  const filtered = projects.filter((p) => {
    const statusOk = !filterStatus || p.status.toLowerCase().includes(filterStatus.toLowerCase());
    return statusOk;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, (page - 1) * perPage + perPage);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-4 mb-3 md:mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-gray-600 hover:text-primary hover:bg-white rounded-lg transition-all duration-200 shadow-sm"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Daftar Project
              </h1>
              <p className="mt-1 md:mt-2 text-gray-600 text-sm md:text-base">Semua project yang telah dibuat</p>
            </div>
          </div>

          {/* Mobile Stats & Filters */}
          <div className="md:hidden space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: 'var(--neuro-border)' }}>
                <div className="text-lg font-bold text-purple-600">{stats ? stats.totalProjects : projects.length}</div>
                <div className="text-[11px] text-gray-600">Total</div>
              </div>
              <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: 'var(--neuro-border)' }}>
                <div className="text-lg font-bold text-cyan-600">
                  {stats ? stats.activeProjects : projects.filter(p => p.status.toLowerCase() !== 'completed' && p.status.toLowerCase() !== 'cancelled').length}
                </div>
                <div className="text-[11px] text-gray-600">Aktif</div>
              </div>
              <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: 'var(--neuro-border)' }}>
                <div className="text-lg font-bold text-pink-600">
                  {stats ? stats.completedProjects : projects.filter(p => p.status.toLowerCase() === 'completed').length}
                </div>
                <div className="text-[11px] text-gray-600">Selesai</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pr-2">
                {[
                  { v: '', l: 'Semua' },
                  { v: 'ongoing', l: 'Aktif' },
                  { v: 'completed', l: 'Selesai' },
                  { v: 'cancelled', l: 'Batal' }
                ].map(opt => (
                  <button
                    key={opt.v || 'all'}
                    onClick={() => { setFilterStatus(opt.v); setPage(1); }}
                    className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                      filterStatus === opt.v
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                    style={{
                      backgroundColor: filterStatus === opt.v ? 'var(--neuro-orange)' : 'rgba(255,255,255,0.8)',
                      border: '1px solid var(--neuro-border)'
                    }}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
              <div>
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(parseInt(e.target.value) || 10); setPage(1); }}
                  className="px-3 py-2 rounded-lg border text-sm"
                >
                  {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}/hal</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="hidden md:block bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-xs text-gray-500">Status</label>
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Semua</option>
                  <option value="ongoing">Aktif/Ongoing</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Bulan</label>
                <input
                  type="month"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Tanggal Mulai</label>
                <input
                  type="date"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={filterStart}
                  onChange={(e) => setFilterStart(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Tanggal Akhir</label>
                <input
                  type="date"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={filterEnd}
                  onChange={(e) => setFilterEnd(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => { setLoading(true); fetchProjects(); }}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg hover:from-primary/80 hover:to-accent/80 transition-all duration-200 shadow-sm"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {stats ? stats.totalProjects : projects.length}
              </div>
              <div className="text-sm text-gray-600">Total Project</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-cyan-600">
                {stats ? stats.activeProjects : projects.filter(p => p.status.toLowerCase() !== 'completed' && p.status.toLowerCase() !== 'cancelled').length}
              </div>
              <div className="text-sm text-gray-600">Aktif</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-pink-600">
                {stats ? stats.completedProjects : projects.filter(p => p.status.toLowerCase() === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Selesai</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {stats ? (stats.pendingProjectsCount || 0) : projects.filter(p => p.status.toLowerCase() === 'pending').length}
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
          <div className="grid gap-3 md:gap-6">
            {paginated.map((project) => (
              <div key={project._id}>
                {/* Mobile simple item */}
                <div
                  className="md:hidden bg-white border rounded-xl p-4 cursor-pointer"
                  style={{ borderColor: 'var(--neuro-border)' }}
                  onClick={() => router.push(`/projects/${project._id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/projects/${project._id}`);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{project.title}</h3>
                      <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{project.client}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold" style={{ color: 'var(--neuro-orange)' }}>
                        ${project.budget.toLocaleString()}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Desktop detailed card */}
                <div
                  onClick={() => router.push(`/projects/${project._id}`)}
                  className="hidden md:block bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/30 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/projects/${project._id}`);
                    }
                  }}
                >
                  <div className="p-6">
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
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
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                            project.status.toLowerCase() === 'completed' ? 'bg-green-500 w-full' :
                            project.status.toLowerCase() === 'in progress' || project.status.toLowerCase() === 'active' || project.status.toLowerCase() === 'ongoing' ? 'bg-blue-500 w-3/4' :
                            project.status.toLowerCase() === 'pending' ? 'bg-yellow-500 w-1/4' :
                            'bg-gray-400 w-1/2'
                          }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Pagination */}
            <div className="flex items-center justify-between mt-2 md:mt-4">
              <div className="text-sm text-gray-600">
                Halaman {page} dari {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg border disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={goNext}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 md:mt-8 flex justify-center gap-3 md:gap-4">
          <button
            onClick={() => router.push('/projects/new')}
            className="text-white px-5 md:px-6 py-3 rounded-xl transition-all duration-200"
            style={{ backgroundColor: 'var(--neuro-orange)' }}
          >
            Buat Project Baru
          </button>
          <button
            onClick={() => router.push('/projects/manage')}
            className="text-gray-700 px-5 md:px-6 py-3 rounded-xl transition-all duration-200"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid var(--neuro-border)' }}
          >
            Kelola Project
          </button>
        </div>
      </div>
    </div>
  );
}
