'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Settings from '@/components/Settings';
import { useAuth } from '@/contexts/AuthContext';

interface TopBarUser {
  name: string;
  email: string;
  avatar?: string;
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [user, loading, router]);

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      router.push('/dashboard');
    } else if (tab === 'projects') {
      router.push('/projects');
    } else if (tab === 'settings') {
      // Already on settings page
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--neuro-bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--neuro-orange)' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed position */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleNavigation}
      />

      {/* Main Content */}
      <div className="ml-20 flex flex-col min-h-screen">
        {/* Top Bar */}
        <TopBar
          user={user ? {
            name: user.username,
            email: user.email || '',
            avatar: undefined
          } : undefined}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Settings />
          </motion.div>
        </main>
      </div>
    </div>
  );
}