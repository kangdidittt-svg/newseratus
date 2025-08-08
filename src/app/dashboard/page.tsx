'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  DollarSign,
  Clock,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  Plus,
  TrendingUp,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Eye,
  Download,
  X
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalEarnings: number;
  totalHours: number;
  averageHourlyRate: number;
}

interface Project {
  _id: string;
  title: string;
  client: string;
  status: string;
  priority: string;
  updatedAt: string;
  budget?: number;
  deadline?: string;
  progress?: number;
  description?: string;
}

interface ProjectsByStatus {
  name: string;
  value: number;
}

interface MonthlyEarning {
  _id: { year: number; month: number };
  earnings: number;
  hours: number;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];

// Add Project Form Component
function AddProjectForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    description: '',
    budget: '',
    deadline: '',
    status: 'active',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        onSuccess();
        onClose();
      } else {
        console.error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
        <input
          type="text"
          required
          value={formData.client}
          onChange={(e) => setFormData({ ...formData, client: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Monthly Report Component
function MonthlyReportComponent() {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const mockData = {
    totalEarnings: 8500,
    totalProjects: 12,
    completedProjects: 9,
    activeProjects: 3,
    totalHours: 180,
    avgHourlyRate: 47
  };

  const monthlyData = [
    { month: 'Jan', earnings: 5200, projects: 8 },
    { month: 'Feb', earnings: 6800, projects: 10 },
    { month: 'Mar', earnings: 7200, projects: 11 },
    { month: 'Apr', earnings: 8500, projects: 12 },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">{currentMonth} {currentYear} Report</h3>
        <p className="text-gray-600">Your freelance performance summary</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-green-600">Total Earnings</p>
              <p className="text-xl font-bold text-green-900">${mockData.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <FolderOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-blue-600">Total Projects</p>
              <p className="text-xl font-bold text-blue-900">{mockData.totalProjects}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-purple-600">Completed</p>
              <p className="text-xl font-bold text-purple-900">{mockData.completedProjects}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm text-orange-600">Total Hours</p>
              <p className="text-xl font-bold text-orange-900">{mockData.totalHours}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Earnings Trend</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
            <Line type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Key Achievements</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Completed {mockData.completedProjects} projects successfully</li>
              <li>• Earned ${mockData.totalEarnings.toLocaleString()} in total revenue</li>
              <li>• Maintained {mockData.activeProjects} active projects</li>
              <li>• Worked {mockData.totalHours} hours total</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Performance Metrics</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Average hourly rate: ${mockData.avgHourlyRate}</li>
              <li>• Project completion rate: {Math.round((mockData.completedProjects / mockData.totalProjects) * 100)}%</li>
              <li>• Average project value: ${Math.round(mockData.totalEarnings / mockData.totalProjects)}</li>
              <li>• Hours per project: {Math.round(mockData.totalHours / mockData.totalProjects)}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="text-center">
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 mx-auto transition-colors">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [projectsByStatus, setProjectsByStatus] = useState<ProjectsByStatus[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, projectsResponse] = await Promise.all([
        fetch('/api/dashboard/stats', { credentials: 'include' }),
        fetch('/api/projects', { credentials: 'include' })
      ]);

      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data.stats);
        setRecentProjects(data.recentProjects);
        setProjectsByStatus(data.projectsByStatus);
        setMonthlyEarnings(data.monthlyEarnings);
      } else {
        setError('Failed to fetch dashboard data');
      }

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setAllProjects(projectsData.projects || []);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'on-hold':
        return <PauseCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <FolderOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.username}!</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddProject(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Project
              </button>
              <button
                onClick={() => setShowMonthlyReport(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Monthly Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalProjects || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeProjects || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalEarnings || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalHours || 0}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Projects by Status Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
              <button
                onClick={() => setShowAddProject(true)}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Add Project
              </button>
            </div>
            <div className="space-y-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(project.status)}
                      <div>
                        <p className="font-medium text-gray-900">{project.title}</p>
                        <p className="text-sm text-gray-600">{project.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(project.updatedAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No projects yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Current Projects List */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Current Projects</h3>
              <button
                onClick={() => setShowAddProject(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Project
              </button>
            </div>
          </div>
          <div className="p-6">
            {allProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProjects.slice(0, 6).map((project) => (
                  <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{project.title}</h4>
                        <p className="text-sm text-gray-600">{project.client}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    {project.budget && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ${project.budget.toLocaleString()}
                      </div>
                    )}
                    {project.deadline && (
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(project.deadline)}
                      </div>
                    )}
                    {project.progress !== undefined && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors">
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors">
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h4>
                <p className="text-gray-600 mb-4">Get started by creating your first project</p>
                <button
                  onClick={() => setShowAddProject(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 flex items-center gap-2 mx-auto transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create First Project
                </button>
              </div>
            )}
            {allProjects.length > 6 && (
              <div className="text-center mt-6">
                <button className="text-indigo-600 hover:text-indigo-500 font-medium">
                  View All Projects ({allProjects.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Earnings Chart */}
        {monthlyEarnings.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Earnings
              </h3>
              <button
                onClick={() => setShowMonthlyReport(true)}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                View Full Report
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="_id"
                  tickFormatter={(value) => `${value.month}/${value.year}`}
                />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'Earnings']}
                  labelFormatter={(label) => `${label.month}/${label.year}`}
                />
                <Bar dataKey="earnings" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Add Project Modal */}
        {showAddProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Project</h2>
                  <button
                    onClick={() => setShowAddProject(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <AddProjectForm onClose={() => setShowAddProject(false)} onSuccess={fetchDashboardData} />
              </div>
            </div>
          </div>
        )}

        {/* Monthly Report Modal */}
        {showMonthlyReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Monthly Report</h2>
                  <button
                    onClick={() => setShowMonthlyReport(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <MonthlyReportComponent />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}