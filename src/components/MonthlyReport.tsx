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
  FolderOpen,
  CheckCircle,
  Download,
  TrendingUp,
  FileText
} from 'lucide-react';

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
  hours?: number;
  projectCount?: number;
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
      return [{ month: currentMonth, earnings: stats?.totalEarnings || 0, projects: stats?.totalProjects || 0 }];
    }
    
    return monthlyEarnings.map(item => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
      earnings: item.earnings || 0,
      projects: item.projectCount ?? 0
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--neuro-orange)' }}></div>
          <p className="mt-4 font-inter" style={{ color: 'var(--neuro-text-secondary)' }}>Loading report...</p>
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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>{currentMonth} {currentYear} Report</h1>
          <p className="mt-1" style={{ color: 'var(--neuro-text-secondary)' }}>Your freelance performance summary</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg neuro-select font-inter"
            style={{ 
              background: 'var(--neuro-bg)',
              color: 'var(--neuro-text-primary)',
              border: 'none'
            }}
          >
            <option value="current">Current Month</option>
            <option value="last3">Last 3 Months</option>
            <option value="last6">Last 6 Months</option>
            <option value="year">This Year</option>
          </select>
          <motion.button
            onClick={handleExportReport}
            className="px-6 py-2 rounded-lg neuro-button hover:neuro-button-hover flex items-center space-x-2 font-inter font-medium transition-all duration-300"
            style={{ color: 'var(--neuro-text-primary)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="h-4 w-4" style={{ color: 'var(--neuro-orange)' }} />
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
          className="p-6 rounded-xl neuro-card font-inter"
          style={{ background: 'var(--neuro-bg)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--neuro-text-secondary)' }}>Total Earnings</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>${stats?.totalEarnings?.toLocaleString()}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--neuro-text-secondary)' }}>From {stats?.totalProjects} projects</p>
            </div>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center neuro-icon">
              <DollarSign className="h-6 w-6" style={{ color: 'var(--neuro-orange)' }} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl neuro-card font-inter"
          style={{ background: 'var(--neuro-bg)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--neuro-text-secondary)' }}>Total Projects</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>{stats?.totalProjects}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--neuro-text-secondary)' }}>{stats?.activeProjects} active projects</p>
            </div>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center neuro-icon">
              <FolderOpen className="h-6 w-6" style={{ color: 'var(--neuro-orange)' }} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl neuro-card font-inter"
          style={{ background: 'var(--neuro-bg)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--neuro-text-secondary)' }}>Completed</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>{stats?.completedProjects}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--neuro-text-secondary)' }}>{stats?.totalProjects ? Math.round((stats?.completedProjects / stats?.totalProjects) * 100) : 0}% completion rate</p>
            </div>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center neuro-icon">
              <CheckCircle className="h-6 w-6" style={{ color: 'var(--neuro-orange)' }} />
            </div>
          </div>
        </motion.div>

        
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Earnings Trend */}
        {/* Monthly Earnings Trend */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-xl neuro-card font-inter"
          style={{ background: 'var(--neuro-bg)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>Monthly Earnings Trend</h3>
            <TrendingUp className="h-5 w-5" style={{ color: 'var(--neuro-orange)' }} />
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
                  stroke="var(--neuro-orange)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--neuro-orange)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'var(--neuro-orange)', strokeWidth: 2 }}
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
          className="p-6 rounded-xl neuro-card font-inter"
          style={{ background: 'var(--neuro-bg)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>Projects by Month</h3>
            <FolderOpen className="h-5 w-5" style={{ color: 'var(--neuro-orange)' }} />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMonthlyTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [value, 'Projects']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px' 
                  }}
                />
                <Bar 
                  dataKey="projects" 
                  fill="var(--neuro-orange)" 
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
        className="p-8 rounded-xl neuro-card font-inter"
        style={{ background: 'var(--neuro-bg)' }}
      >
        <div className="flex items-center mb-6">
          <FileText className="h-6 w-6 mr-3" style={{ color: 'var(--neuro-orange)' }} />
          <h3 className="text-xl font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>Monthly Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--neuro-text-primary)' }}>
              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: 'var(--neuro-orange)' }}></div>
              Key Achievements
            </h4>
            <ul className="text-sm space-y-2" style={{ color: 'var(--neuro-text-secondary)' }}>
              <li className="flex items-start">
                <span className="mr-2" style={{ color: 'var(--neuro-orange)' }}>✓</span>
                Completed {stats?.completedProjects} projects successfully
              </li>
              <li className="flex items-start">
                <span className="mr-2" style={{ color: 'var(--neuro-orange)' }}>✓</span>
                Earned ${stats?.totalEarnings?.toLocaleString()} in total revenue
              </li>
              <li className="flex items-start">
                <span className="mr-2" style={{ color: 'var(--neuro-orange)' }}>✓</span>
                Maintained {stats?.activeProjects} active projects
              </li>
              
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--neuro-text-primary)' }}>
              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: 'var(--neuro-orange)' }}></div>
              Performance Metrics
            </h4>
            <ul className="text-sm space-y-2" style={{ color: 'var(--neuro-text-secondary)' }}>
              <li className="flex justify-between">
                <span>Average hourly rate:</span>
                <span className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>${stats?.averageHourlyRate}</span>
              </li>
              <li className="flex justify-between">
                <span>Project completion rate:</span>
                <span className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>{stats?.totalProjects ? Math.round((stats?.completedProjects / stats?.totalProjects) * 100) : 0}%</span>
              </li>
              <li className="flex justify-between">
                <span>Average project value:</span>
                <span className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>${stats?.totalProjects ? Math.round(stats?.totalEarnings / stats?.totalProjects) : 0}</span>
              </li>
              
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}