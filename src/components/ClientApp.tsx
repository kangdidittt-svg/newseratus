'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import FreelanceDashboard from './FreelanceDashboard';
import ProjectList from './ProjectList';
import InvoiceHistoryTable from './InvoiceHistoryTable';
import MonthlyReport from './MonthlyReport';
import Settings from './Settings';
import TodoPage from '@/app/todo/page';
import StudioLibrary from '@/app/studio-library/page';
import StudioRobot from './StudioRobot';
import EdinburghClock from './EdinburghClock';
import CommandPalette from './CommandPalette';
import CalendarView from './CalendarView';
import ProjectSidePanel from './ProjectSidePanel';
import { MobileNav } from './ui/MobileNav';
import { Search, Bell, Sparkles } from 'lucide-react';
import NotificationPopover from './NotificationPopover';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function ClientApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedProjectForDrawer, setSelectedProjectForDrawer] = useState<any>(null);

  const {
    notifications,
    unreadCount,
    connectionStatus,
    isLoading: isLoadingNotifications,
    markAsRead,
  } = useRealtimeNotifications();

  useEffect(() => {
    fetchUserData();

    const handleProfileUpdate = (e: any) => {
      if (e.detail?.avatarUrl) {
        setUser(prev => prev ? { ...prev, avatar: e.detail.avatarUrl } : null);
      } else {
        fetchUserData();
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: userData._id,
          name: userData.username,
          email: userData.email,
          avatar: userData.avatar || '/api/placeholder/150/150'
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <FreelanceDashboard 
            onNavigate={handleNavigation}
          />
        );
      case 'projects':
        return <ProjectList />;
      case 'todo':
        return <TodoPage />;
      case 'invoice':
        return <InvoiceHistoryTable />;
      case 'calendar':
        return <CalendarView />;
      case 'monthly-report':
        return <MonthlyReport />;
      case 'studio-library':
        return <StudioLibrary />;
      case 'settings':
        return <Settings />;
      default:
        return <FreelanceDashboard onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#F5F5F5] flex overflow-x-hidden font-sans">
      {/* 1. Left Sidebar (240px) */}
      <div className="hidden lg:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleNavigation}
          user={user || undefined}
        />
      </div>

      {/* 2. Center Workspace (Fluid Full Width) */}
      <div className="flex-1 lg:ml-[64px] flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Workspace Top Header */}
        <header className="border-b border-white/5 px-6 py-4 bg-[#0B0C0E]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Greeting */}
            <div>
              <h2 className="text-base font-bold text-[#F5F5F5] flex items-center gap-1.5">
                Good Morning, {user?.name || 'Creative'}. <span className="text-amber-400">☀️</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">Today is your creative day.</p>
            </div>

            {/* Quick Command Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center space-x-3 px-4 py-2 rounded-xl bg-[#181A20] border border-white/5 text-xs text-[#6B7280] hover:text-[#9CA3AF] transition-colors w-64 justify-between"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Search or command...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/5 rounded text-[#9CA3AF] border border-white/5">⌘ K</kbd>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Edinburgh Clock Widget (Permanently in Header Top Right) */}
            <EdinburghClock />

            {/* Notifications */}
            <NotificationPopover
              notifications={notifications}
              unreadCount={unreadCount}
              isLoading={isLoadingNotifications}
              connectionStatus={connectionStatus}
              onMarkAsRead={markAsRead}
              onDelete={async () => true}
            >
              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full" />
                )}
              </button>
            </NotificationPopover>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Studio Robot Widget (Bottom Right for all screen sizes) */}
      <StudioRobot isPermanentPanel={false} onNavigate={handleNavigation} />

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={handleNavigation} />

      {/* Command Palette Modal (CTRL + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigation}
      />

      {/* Project Side Panel Drawer */}
      <ProjectSidePanel
        project={selectedProjectForDrawer}
        onClose={() => setSelectedProjectForDrawer(null)}
      />
    </div>
  );
}
