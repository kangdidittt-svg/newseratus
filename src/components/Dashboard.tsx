'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  DollarSign,
  Clock,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  TrendingUp,
  Calendar,
  FileText,
  Eye,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import ModernCard from '@/components/ModernCard';
import GradientText from '@/components/GradientText';
import EdinburghClock from '@/components/EdinburghClock';

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

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#7c3aed'];

interface DashboardProps {
  refreshTrigger?: number;
}

export default function Dashboard({ refreshTrigger }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [projectsByStatus, setProjectsByStatus] = useState<ProjectsByStatus[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse] = await Promise.all([
        fetch('/api/dashboard/stats', { credentials: 'include' })
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
        return <AlertCircle className="h-4 w-4 text-accent" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'on-hold':
        return <PauseCircle className="h-4 w-4 text-secondary" />;
      default:
        return <FolderOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-secondary/20 text-secondary';
      case 'medium':
        return 'bg-primary/20 text-primary';
      case 'low':
        return 'bg-accent/20 text-accent';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <div className="loading-spinner rounded-full h-16 w-16 border-4 border-transparent border-t-primary border-r-secondary mx-auto mb-4"></div>
          <GradientText className="text-xl">Loading Dashboard...</GradientText>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ModernCard className="max-w-md mx-auto">
            <div className="text-secondary mb-4 text-lg">{error}</div>
            <motion.button
              onClick={fetchDashboardData}
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="inline-block w-4 h-4 mr-2" />
              Retry
            </motion.button>
          </ModernCard>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >


      {/* Stats Cards and Monthly Earnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Active Projects Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">Active Projects</span>
                </div>
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats?.activeProjects || 0}
              </div>
              <div className="text-xs text-gray-500">Projects in progress</div>
            </motion.div>

            {/* Completed Projects Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">Completed</span>
                </div>
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats?.completedProjects || 0}
              </div>
              <div className="text-xs text-gray-500">Projects finished</div>
            </motion.div>

            {/* Payment Pending Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">Payment Pending</span>
                </div>
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                ${(stats?.totalPendingPayments || 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Pending payments</div>
            </motion.div>

            {/* Total Earnings Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">Total Earnings</span>
                </div>
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                ${(stats?.totalEarnings || 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total earned</div>
            </motion.div>
          </div>
        </div>

        {/* Edinburgh Clock */}
        <EdinburghClock />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects by Status Chart */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-64"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects by Status</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectsByStatus}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                    animationBegin={0}
                  >
                    {projectsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Projects */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-64"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
          <div className="space-y-3 overflow-y-auto h-48">
            {recentProjects.length > 0 ? (
              recentProjects.slice(0, 4).map((project) => (
                <div key={project._id} className="group hover:bg-gray-50 p-3 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(project.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{project.title}</h4>
                        <p className="text-xs text-gray-500 truncate">{project.client}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent projects</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}