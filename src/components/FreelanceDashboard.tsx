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
  Plus,
  CheckSquare,
  Check,
  CalendarDays,
  StickyNote,
  ChevronDown
} from 'lucide-react';
import EdinburghClock from './EdinburghClock';
// Removed RobotAssistant and SmartSummaryPanel per user request
import { useRealtimeDashboard, triggerDashboardRefresh } from '../hooks/useRealtimeDashboard';
import { triggerNotificationRefresh } from '../hooks/useNotificationRefresh';

interface FreelanceDashboardProps {
  onNavigate?: (tab: string) => void;
  refreshTrigger?: number;
}

export default function FreelanceDashboard({ onNavigate, refreshTrigger }: FreelanceDashboardProps) {
  const { stats, recentProjects, loading, error, connectionStatus, refreshDashboard } = useRealtimeDashboard();
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayTodos, setTodayTodos] = useState<{ _id: string; title: string; status: 'pending'|'done'; notes?: string; projectId?: string; projectTitle?: string }[]>([]);
  const [expandedTodoIds, setExpandedTodoIds] = useState<Set<string>>(new Set());
  const [collapsedProjectIds, setCollapsedProjectIds] = useState<Set<string>>(new Set());

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


  // Handle refresh trigger from parent (legacy support)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      refreshDashboard();
    }
  }, [refreshTrigger, refreshDashboard]);

  // Fetch today's todos on mount and on event
  useEffect(() => {
    const loadToday = async () => {
      try {
        const res = await fetch('/api/todos?filter=today', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setTodayTodos((data.todos || []).map((t: { _id: string; title: string; status: 'pending'|'done'; notes?: string; projectId?: { _id: string; title: string } | string }) => ({
            _id: t._id,
            title: t.title,
            status: t.status,
            notes: t.notes,
            projectId: typeof t.projectId === 'object' ? t.projectId?._id : (typeof t.projectId === 'string' ? t.projectId : undefined),
            projectTitle: typeof t.projectId === 'object' ? (t.projectId as { _id: string; title: string }).title : undefined
          })));
        }
      } catch (e) {
        console.error('Load today todos error', e);
      }
    };
    loadToday();
    const handler = () => loadToday();
    window.addEventListener('todos:updated', handler);
    const interval = setInterval(handler, 5 * 60 * 1000);
    return () => { window.removeEventListener('todos:updated', handler); clearInterval(interval); };
  }, []);

  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const addDaysStr = (base: string, days: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const markDone = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'done' })
      });
      if (res.ok) {
        setTodayTodos(prev => prev.map(t => t._id === id ? { ...t, status: 'done' } : t));
        window.dispatchEvent(new Event('todos:updated'));
      }
    } catch (e) {
      console.error('Mark done error', e);
    }
  };

  const moveToTomorrow = async (id: string) => {
    try {
      const tomorrow = addDaysStr(todayStr(), 1);
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dueDateStr: tomorrow, status: 'pending' })
      });
      if (res.ok) {
        setTodayTodos(prev => prev.filter(t => t._id !== id));
        window.dispatchEvent(new Event('todos:updated'));
      }
    } catch (e) {
      console.error('Move to tomorrow error', e);
    }
  };

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
        
        // Trigger dashboard refresh
        triggerDashboardRefresh('project-created');
        
        // Trigger notification refresh again
        await triggerNotificationRefresh();
        
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
        // SSE will automatically update dashboard data
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
            onClick={refreshDashboard}
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
      {/* Header with Connection Status */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>Dashboard</h1>
            <p className="mt-1" style={{ color: 'var(--neuro-text-secondary)' }}>Welcome back! Here&apos;s your project overview.</p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Connection Status Indicator - Hidden */}
            <div className="flex items-center gap-2 text-sm" style={{ display: 'none' }}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <span className={`text-xs ${
                connectionStatus === 'connected' ? 'text-green-600' :
                connectionStatus === 'connecting' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {connectionStatus === 'connected' ? 'Real-time' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 'Offline'}
              </span>
            </div>
            {/* Add Project Button - Hidden */}
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="neuro-button-orange px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              style={{ display: 'none' }}
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
        </div>

        {/* Smart Summary Panel removed */}
      </div>

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
        {/* Edinburgh Clock moved up to top-right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="neuro-card p-0 relative flex items-center justify-center h-full"
          style={{
            background: 'linear-gradient(135deg, var(--neuro-bg-primary), var(--neuro-bg-secondary))',
            overflow: 'hidden'
          }}
        >
          <EdinburghClock />
        </motion.div>

        {/* Robot Assistant removed */}
      </div>

      {/* Recent Projects and Edinburgh Clock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Today Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 neuro-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" style={{ color: 'var(--neuro-text-secondary)' }} />
              <span className="font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>Today Tasks</span>
            </div>
            <button className="neuro-button px-3 py-1" onClick={() => onNavigate && onNavigate('todo')}>Manage</button>
          </div>
          <div className="space-y-4">
            {todayTodos.length === 0 ? (
              <div
                className="rounded-md p-4"
                style={{ backgroundColor: 'var(--neuro-warning-light)', color: 'var(--neuro-warning)' }}
              >
                <div className="flex items-start gap-3">
                  <CheckSquare className="w-5 h-5" style={{ color: 'var(--neuro-warning)' }} />
                  <div className="text-sm">
                    list kerjaan hari ini kosong nih , kamu lupa bikin atau jangan jangan gada kerjaan, yok semnagatttt
                  </div>
                </div>
              </div>
            ) : (
              (() => {
                const groups = new Map<string, { title: string; items: typeof todayTodos }>();
                todayTodos.slice(0, 200).forEach(t => {
                  const key = t.projectId || 'none';
                  const title = t.projectTitle || 'No Project';
                  const g = groups.get(key);
                  if (g) g.items.push(t); else groups.set(key, { title, items: [t] });
                });
                const entries = Array.from(groups.entries());
                return entries.map(([key, group]) => (
                  <div key={key} className="space-y-2">
                    <button
                      className="w-full flex items-center justify-between"
                      onClick={() => setCollapsedProjectIds(prev => {
                        const next = new Set(prev);
                        if (next.has(key)) next.delete(key); else next.add(key);
                        return next;
                      })}
                    >
                      <div className="flex items-center gap-2 app-muted text-xs">
                        <FolderOpen className="h-4 w-4" />
                        <span>{group.title}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition ${collapsedProjectIds.has(key) ? '-rotate-90' : 'rotate-0'}`} />
                    </button>
                    <motion.div
                      initial={{ height: 'auto', opacity: 1 }}
                      animate={{ height: collapsedProjectIds.has(key) ? 0 : 'auto', opacity: collapsedProjectIds.has(key) ? 0 : 1 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0 divide-y" style={{ borderColor: 'var(--neuro-border)' }}>
                        {group.items.map(t => (
                        <div key={t._id} className="px-2 py-2">
                          <div
                            role="button"
                            tabIndex={0}
                            className="w-full text-left flex items-center justify-between rounded-md transition hover:neuro-card-pressed"
                            onClick={() => setExpandedTodoIds(prev => {
                              const next = new Set(prev);
                              if (next.has(t._id)) next.delete(t._id); else next.add(t._id);
                              return next;
                            })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setExpandedTodoIds(prev => {
                                  const next = new Set(prev);
                                  if (next.has(t._id)) next.delete(t._id); else next.add(t._id);
                                  return next;
                                });
                              }
                            }}
                          >
                            <span className="text-sm" style={{ color: 'var(--neuro-text-primary)' }}>{t.title}</span>
                            <div className="flex items-center gap-2">
                              <button
                                className="neuro-button px-2 py-1"
                                title="Selesai"
                                onClick={(e) => { e.stopPropagation(); markDone(t._id); }}
                                style={{ color: 'var(--neuro-success)' }}
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                className="neuro-button px-2 py-1"
                                title="Pindah besok"
                                onClick={(e) => { e.stopPropagation(); moveToTomorrow(t._id); }}
                                style={{ color: 'var(--neuro-warning)' }}
                              >
                                <CalendarDays className="h-4 w-4" />
                              </button>
                              <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status.toUpperCase()}</span>
                            </div>
                          </div>
                          {t.notes && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: expandedTodoIds.has(t._id) ? 'auto' : 0, opacity: expandedTodoIds.has(t._id) ? 1 : 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--neuro-border)' }}>
                                <div className="flex items-center gap-2">
                                  <StickyNote className="h-4 w-4" style={{ color: 'var(--neuro-text-secondary)' }} />
                                  <span className="text-xs font-semibold" style={{ color: 'var(--neuro-text-secondary)' }}>Notes</span>
                                </div>
                                <div className="text-sm whitespace-pre-line app-muted mt-1">{t.notes}</div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                ));
              })()
            )}
          </div>
        </motion.div>
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

        {/* Edinburgh Clock removed from here */}
      </div>


    </div>
  );
}
