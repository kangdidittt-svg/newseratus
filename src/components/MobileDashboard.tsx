import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Calendar, DollarSign, Users, CheckCircle, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { StatCard } from './ui/StatCard';
import { MobileNav } from './ui/MobileNav';
import EdinburghClock from './EdinburghClock';
import ProfilePopover from './ProfilePopover';
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard';
import NotificationPopover from './NotificationPopover';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useRouter } from 'next/navigation';

interface Project {
  id: number;
  name: string;
  status: 'active' | 'completed' | 'pending';
  progress: number;
  dueDate: string;
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const MobileDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { stats, recentProjects } = useRealtimeDashboard();
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    connectionStatus,
    isLoading: isLoadingNotifications,
    markAsRead,
    refreshNotifications
  } = useRealtimeNotifications();

  const projects: Project[] = useMemo(() => {
    return (recentProjects || []).slice(0, 5).map((p, idx) => ({
      id: idx + 1,
      name: p.title,
      status: (p.status as 'active' | 'completed' | 'pending') || 'active',
      progress: p.status === 'completed' ? 100 : p.status === 'pending' ? 25 : 75,
      dueDate: p.deadline ? new Date(p.deadline).toISOString().slice(0, 10) : ''
    }));
  }, [recentProjects]);

  // notifications now come from useRealtimeNotifications via NotificationPopover

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          title="Total Projects" 
          value={stats?.totalProjects ?? 0} 
          icon={<FolderOpen size={24} />} 
          color="orange" 
        />
        <StatCard 
          title="Active Projects" 
          value={stats?.activeProjects ?? 0} 
          icon={<CheckCircle size={24} />} 
          color="blue" 
        />
        <StatCard 
          title="Total Earnings" 
          value={`$${(stats?.totalEarnings ?? 0).toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          color="green" 
        />
        <StatCard 
          title="Pending Payment" 
          value={`$${(stats?.totalPendingPayments ?? 0).toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          color="purple" 
        />
      </div>

      <EdinburghClock />

      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Remove Today Task and FAB on mobile as requested */}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'projects':
        router.push('/projects');
        return renderDashboard();
      case 'create':
        router.push('/projects/new');
        return renderDashboard();
      case 'invoices':
        router.push('/invoice/history');
        return renderDashboard();
      case 'settings':
        router.push('/settings');
        return renderDashboard();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">ProjectHub</h1>
          <div className="flex items-center space-x-3">
            <NotificationPopover
              notifications={notifications}
              unreadCount={unreadCount}
              isLoading={isLoadingNotifications}
              connectionStatus={connectionStatus}
              onMarkAsRead={() => markAsRead()}
              onDelete={async () => true}
            >
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>}
              </button>
            </NotificationPopover>
            <ProfilePopover>
              <button className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </button>
            </ProfilePopover>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {renderContent()}
      </div>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Floating button removed per request */}
    </div>
  );
};
