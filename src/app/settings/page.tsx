'use client';

import { useState } from 'react';
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
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings');

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

  // Render settings directly without blocking on loading

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