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
  ChevronDown,
  FileText,
  Bot,
  FileCode
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
    <div className="p-6 space-y-6 font-sans">
      {/* 1. OVERVIEW SECTION (4 Stat Cards Row) */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
          OVERVIEW
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Projects */}
          <div className="bg-[#121418] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-[#9CA3AF] font-medium">Total Projects</div>
              <div className="text-2xl font-bold font-mono text-[#F5F5F5] mt-1">{stats?.totalProjects || 92}</div>
              <div className="text-[10px] text-[#6B7280] mt-1">All Projects</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#6B7280]">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Active Projects */}
          <div className="bg-[#121418] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-[#9CA3AF] font-medium">Active Projects</div>
              <div className="text-2xl font-bold font-mono text-[#F5F5F5] mt-1">{stats?.activeProjects || 4}</div>
              <div className="text-[10px] text-[#6B7280] mt-1">On Going</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#6B7280]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Total Earnings */}
          <div className="bg-[#121418] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-[#9CA3AF] font-medium">Total Earnings</div>
              <div className="text-2xl font-bold font-mono text-[#FAFAFA] mt-1">
                ${stats?.totalEarnings ? stats.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '12,450'}
              </div>
              <div className="text-[10px] text-[#6B7280] mt-1">Active & Finished Income</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#8B5CF6]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: Pending Payments */}
          <div className="bg-[#121418] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-[#9CA3AF] font-medium">Pending Payments</div>
              <div className="text-2xl font-bold font-mono text-[#F5F5F5] mt-1">${stats?.totalPendingPayments?.toFixed(0) || '3'}</div>
              <div className="text-[10px] text-[#6B7280] mt-1">Invoice Pending</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#6B7280]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN GRID (Left 2/3, Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* TODAY'S FOCUS CARD */}
          <div className="bg-[#121418] border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
              TODAY&apos;S FOCUS
            </div>

            <div className="space-y-2">
              {/* Item 1 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center cursor-pointer hover:border-purple-400"></div>
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-[#8B5CF6]">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#F5F5F5]">Predator Combat Higres</div>
                    <div className="text-[10px] text-[#6B7280]">Mr Sohail • High Priority</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-[#9CA3AF] border border-white/5">In Progress</span>
                  <div className="text-[10px] text-[#6B7280] mt-0.5 font-mono">Due Today</div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center cursor-pointer hover:border-purple-400"></div>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#F5F5F5]">Invoice #INV-202607-001</div>
                    <div className="text-[10px] text-[#6B7280]">Mr Sohail • $330.00</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>
                  <div className="text-[10px] text-[#6B7280] mt-0.5 font-mono">Due Today</div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center cursor-pointer hover:border-purple-400"></div>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#F5F5F5]">Client Meeting</div>
                    <div className="text-[10px] text-[#6B7280]">Mr Paul</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-[#9CA3AF] border border-white/5">Scheduled</span>
                  <div className="text-[10px] text-[#6B7280] mt-0.5 font-mono">Tomorrow 09:00 (UK)</div>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT PROJECTS CARD */}
          <div className="bg-[#121418] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                RECENT PROJECTS
              </div>
              <button onClick={() => onNavigate?.('projects')} className="text-xs text-[#9CA3AF] hover:text-[#F5F5F5] font-medium">View All</button>
            </div>

            <div className="space-y-2">
              {recentProjects.length > 0 ? (
                recentProjects.slice(0, 5).map((project, index) => {
                  const initial = project.title ? project.title.slice(0, 2).toUpperCase() : 'PR';
                  return (
                    <div key={project._id || index} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-xs font-bold text-[#F5F5F5] shrink-0">
                          {initial}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-semibold text-[#F5F5F5] truncate">{project.title}</div>
                          <div className="text-[10px] text-[#6B7280] truncate">{project.client} • {(project as any).category || 'Design'}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-xs text-[#9CA3AF]">
                        <div className="hidden sm:block">
                          <div className="text-[9px] text-[#6B7280] mb-0.5">Progress</div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-[#181A20] rounded-full h-1.5 overflow-hidden">
                              <div className="bg-[#8B5CF6] h-full rounded-full" style={{ width: `${project.status === 'completed' ? 100 : (60 - index * 15)}%` }} />
                            </div>
                            <span className="text-[10px] font-mono">{project.status === 'completed' ? '100%' : `${60 - index * 15}%`}</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] text-[#6B7280]">Budget</div>
                          <div className="font-mono font-bold text-[#F5F5F5]">${project.budget || 20}</div>
                        </div>

                        <div>
                          <div className="text-[9px] text-[#6B7280]">Deadline</div>
                          <div className="font-mono text-xs text-[#F5F5F5]">{project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}</div>
                        </div>

                        <ChevronDown className="w-4 h-4 text-[#6B7280] cursor-pointer hover:text-white -rotate-90" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  {/* Mockup Row 1 */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-xs font-bold text-[#F5F5F5] shrink-0">
                        PC
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-[#F5F5F5] truncate">Predator Combat Higres</div>
                        <div className="text-[10px] text-[#6B7280] truncate">Mr Sohail • Design</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-xs text-[#9CA3AF]">
                      <div className="hidden sm:block">
                        <div className="text-[9px] text-[#6B7280] mb-0.5">Progress</div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-[#181A20] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[#8B5CF6] h-full rounded-full w-[60%]" />
                          </div>
                          <span className="text-[10px] font-mono">60%</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] text-[#6B7280]">Budget</div>
                        <div className="font-mono font-bold text-[#F5F5F5]">$20</div>
                      </div>

                      <div>
                        <div className="text-[9px] text-[#6B7280]">Deadline</div>
                        <div className="font-mono text-xs text-[#F5F5F5]">Today</div>
                      </div>

                      <ChevronDown className="w-4 h-4 text-[#6B7280] cursor-pointer hover:text-white -rotate-90" />
                    </div>
                  </div>

                  {/* Mockup Row 2 */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-xs font-bold text-[#F5F5F5] shrink-0">
                        IL
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-[#F5F5F5] truncate">11 Logo Sponsor Highres</div>
                        <div className="text-[10px] text-[#6B7280] truncate">Mr Sohail • Branding</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-xs text-[#9CA3AF]">
                      <div className="hidden sm:block">
                        <div className="text-[9px] text-[#6B7280] mb-0.5">Progress</div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-[#181A20] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[#8B5CF6] h-full rounded-full w-[45%]" />
                          </div>
                          <span className="text-[10px] font-mono">45%</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] text-[#6B7280]">Budget</div>
                        <div className="font-mono font-bold text-[#F5F5F5]">$200</div>
                      </div>

                      <div>
                        <div className="text-[9px] text-[#6B7280]">Deadline</div>
                        <div className="font-mono text-xs text-[#F5F5F5]">Tomorrow</div>
                      </div>

                      <ChevronDown className="w-4 h-4 text-[#6B7280] cursor-pointer hover:text-white -rotate-90" />
                    </div>
                  </div>

                  {/* Mockup Row 3 */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-xs font-bold text-[#F5F5F5] shrink-0">
                        SC
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-[#F5F5F5] truncate">4 Scotland Design Bubble</div>
                        <div className="text-[10px] text-[#6B7280] truncate">Mr Paul • Design</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-xs text-[#9CA3AF]">
                      <div className="hidden sm:block">
                        <div className="text-[9px] text-[#6B7280] mb-0.5">Progress</div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-[#181A20] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[#8B5CF6] h-full rounded-full w-[30%]" />
                          </div>
                          <span className="text-[10px] font-mono">30%</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] text-[#6B7280]">Budget</div>
                        <div className="font-mono font-bold text-[#F5F5F5]">$30</div>
                      </div>

                      <div>
                        <div className="text-[9px] text-[#6B7280]">Deadline</div>
                        <div className="font-mono text-xs text-[#F5F5F5]">2 Days Left</div>
                      </div>

                      <ChevronDown className="w-4 h-4 text-[#6B7280] cursor-pointer hover:text-white -rotate-90" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3 Width) */}
        <div className="space-y-6">

          {/* UPCOMING DEADLINES WIDGET */}
          <div className="bg-[#121418] border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                UPCOMING DEADLINES
              </div>
              <button className="text-xs text-[#9CA3AF] hover:text-[#F5F5F5]">View All</button>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-[#F5F5F5] truncate">Predator Combat Higres</div>
                    <div className="text-[10px] text-[#6B7280]">Mr Sohail</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#9CA3AF] shrink-0">Today</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-[#F5F5F5] truncate">Invoice #INV-202607-001</div>
                    <div className="text-[10px] text-[#6B7280]">Mr Sohail</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#9CA3AF] shrink-0">Today</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-[#F5F5F5] truncate">Client Meeting</div>
                    <div className="text-[10px] text-[#6B7280]">Mr Paul</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#9CA3AF] shrink-0">Tomorrow 09:00 UK</span>
              </div>
            </div>
          </div>

          {/* NOTIFICATIONS WIDGET */}
          <div className="bg-[#121418] border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                NOTIFICATIONS
              </div>
              <button className="text-[10px] text-[#9CA3AF] hover:text-[#F5F5F5]">Mark all read</button>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-start space-x-2.5">
                <FileText className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[#F5F5F5] leading-snug">Payment received for Invoice #INV-202606-002</div>
                </div>
                <span className="text-[10px] text-[#6B7280] shrink-0 font-mono">2h ago</span>
              </div>

              <div className="flex items-start space-x-2.5">
                <FileText className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[#F5F5F5] leading-snug">New project &quot;Insure Smart High Res&quot;</div>
                </div>
                <span className="text-[10px] text-[#6B7280] shrink-0 font-mono">3h ago</span>
              </div>

              <button className="w-full py-2 px-3 rounded-xl bg-[#181A20] border border-white/5 hover:bg-white/5 text-xs text-[#9CA3AF] hover:text-[#F5F5F5] font-semibold transition-colors text-center mt-2 flex items-center justify-center space-x-1">
                <span>View All Notifications</span>
                <span>→</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
