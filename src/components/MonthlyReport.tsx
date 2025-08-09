'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  DollarSign,
  Clock,
  FolderOpen,
  CheckCircle,
  Download,
  TrendingUp,
  Calendar,
  FileText
} from 'lucide-react';

interface MonthlyData {
  month: string;
  earnings: number;
  projects: number;
  hours: number;
}

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

interface MonthlyEarning {
  _id: { year: number; month: number };
  earnings: number;
  hours: number;
}

export default function MonthlyReport() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', { credentials: 'include' });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setMonthlyEarnings(data.monthlyEarnings);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform monthlyEarnings data for charts
  const getMonthlyTrendData = () => {
    if (!monthlyEarnings || monthlyEarnings.length === 0) {
      // Return default data for current month if no data available
      const currentMonth = new Date().toLocaleString('default', { month: 'short' });
      return [{
        month: currentMonth,
        earnings: stats?.totalEarnings || 0,
        hours: stats?.totalHours || 0,
        projects: stats?.totalProjects || 0
      }];
    }
    
    return monthlyEarnings.map(item => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
      earnings: item.earnings || 0,
      hours: item.hours || 0,
      projects: Math.floor(item.earnings / (stats?.averageHourlyRate || 1) / (item.hours || 1)) || 1 // Estimate projects based on earnings and hours
    }));
  };

  const handleExportReport = () => {
    // Implementation for exporting report
    const reportContent = `
Monthly Report - ${currentMonth} ${currentYear}

Key Metrics:
- Total Earnings: $${stats?.totalEarnings?.toLocaleString()}
- Total Projects: ${stats?.totalProjects}
- Completed Projects: ${stats?.completedProjects}
- Active Projects: ${stats?.activeProjects}
- Total Hours: ${stats?.totalHours}
- Average Hourly Rate: $${stats?.averageHourlyRate}

Generated on: ${new Date().toLocaleDateString()}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-report-${currentMonth}-${currentYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentMonth} {currentYear} Report</h1>
          <p className="text-gray-600 mt-1">Your freelance performance summary</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="current">Current Month</option>
            <option value="last3">Last 3 Months</option>
            <option value="last6">Last 6 Months</option>
            <option value="year">This Year</option>
          </select>
          <motion.button
            onClick={handleExportReport}
            className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 flex items-center space-x-2 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl border border-cyan-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-700">Total Earnings</p>
              <p className="text-2xl font-bold text-cyan-800">${stats?.totalEarnings?.toLocaleString()}</p>
              <p className="text-xs text-cyan-600 mt-1">From {stats?.totalProjects} projects</p>
            </div>
            <div className="h-12 w-12 bg-cyan-200 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-cyan-700" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Total Projects</p>
              <p className="text-2xl font-bold text-purple-800">{stats?.totalProjects}</p>
              <p className="text-xs text-purple-600 mt-1">{stats?.activeProjects} active projects</p>
            </div>
            <div className="h-12 w-12 bg-purple-200 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-purple-700" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Completed</p>
              <p className="text-2xl font-bold text-green-800">{stats?.completedProjects}</p>
              <p className="text-xs text-green-600 mt-1">{stats?.totalProjects ? Math.round((stats?.completedProjects / stats?.totalProjects) * 100) : 0}% completion rate</p>
            </div>
            <div className="h-12 w-12 bg-green-200 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-700" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Hours</p>
              <p className="text-2xl font-bold text-blue-800">{stats?.totalHours}h</p>
              <p className="text-xs text-blue-600 mt-1">${stats?.averageHourlyRate}/hour avg</p>
            </div>
            <div className="h-12 w-12 bg-blue-200 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Earnings Trend */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Earnings Trend</h3>
            <TrendingUp className="h-5 w-5 text-cyan-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getMonthlyTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Earnings']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px' 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
                  animationBegin={0}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Projects by Month */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Hours by Month</h3>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMonthlyTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [value, 'Hours']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px' 
                  }}
                />
                <Bar 
                  dataKey="hours" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  animationBegin={0}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Summary Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl border border-gray-200"
      >
        <div className="flex items-center mb-6">
          <FileText className="h-6 w-6 text-gray-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Monthly Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-cyan-600 rounded-full mr-2"></div>
              Key Achievements
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-cyan-600 mr-2">✓</span>
                Completed {stats?.completedProjects} projects successfully
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 mr-2">✓</span>
                Earned ${stats?.totalEarnings?.toLocaleString()} in total revenue
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 mr-2">✓</span>
                Maintained {stats?.activeProjects} active projects
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 mr-2">✓</span>
                Worked {stats?.totalHours} hours total
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
              Performance Metrics
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex justify-between">
                <span>Average hourly rate:</span>
                <span className="font-medium">${stats?.averageHourlyRate}</span>
              </li>
              <li className="flex justify-between">
                <span>Project completion rate:</span>
                <span className="font-medium">{stats?.totalProjects ? Math.round((stats?.completedProjects / stats?.totalProjects) * 100) : 0}%</span>
              </li>
              <li className="flex justify-between">
                <span>Average project value:</span>
                <span className="font-medium">${stats?.totalProjects ? Math.round(stats?.totalEarnings / stats?.totalProjects) : 0}</span>
              </li>
              <li className="flex justify-between">
                <span>Hours per project:</span>
                <span className="font-medium">{stats?.totalProjects ? Math.round(stats?.totalHours / stats?.totalProjects) : 0}h</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}