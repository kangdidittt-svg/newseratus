'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Settings from '@/components/Settings';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      {/* Sidebar only on desktop */}
      {!isMobile && (
        <div className="hidden md:block">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={handleNavigation}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="md:ml-20 ml-0 flex flex-col min-h-screen">
        {/* Top Bar */}
        {!isMobile && (
          <div className="hidden md:block">
            <TopBar
              hideSearch
              hideNotifications
              user={user ? {
                name: user.username,
                email: user.email || '',
                avatar: undefined
              } : undefined}
            />
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="md:hidden mb-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="neuro-button px-3 py-2 rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
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
