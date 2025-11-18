'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import FreelanceDashboard from './FreelanceDashboard';
import ProjectList from './ProjectList';
import AddProject from './AddProject';
import MonthlyReport from './MonthlyReport';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function ClientApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeApp = useCallback(async () => {
    try {
      setError(null);
      // Simulate API calls
      await Promise.all([
        fetchUserData(),
        fetchProjects()
      ]);
    } catch (error) {
      console.error('Error initializing app:', error);
      setError('Failed to load application data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initialize user data and projects
    const init = async () => {
      await initializeApp();
    };
    init();
  }, [initializeApp]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
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

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      if (response.ok) {
        // Projects data processing removed as not used in UI
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    // Navigate to the actual page if it's invoice
    if (tab === 'invoice') {
      window.location.href = '/invoice/create';
    }
  };

  const renderContent = () => {
    const pageVariants = {
      initial: {
        opacity: 0,
        x: 20,
        scale: 0.95
      },
      in: {
        opacity: 1,
        x: 0,
        scale: 1
      },
      out: {
        opacity: 0,
        x: -20,
        scale: 0.95
      }
    };

    const pageTransition = {
      type: 'tween' as const,
      ease: 'anticipate' as const,
      duration: 0.4
    };

    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div
            key="dashboard"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <FreelanceDashboard 
              onNavigate={handleNavigation}
              refreshTrigger={dashboardRefreshTrigger}
            />
          </motion.div>
        );
      case 'projects':
        return (
          <motion.div
            key="projects"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ProjectList />
          </motion.div>
        );

      case 'monthly-report':
        return (
          <motion.div
            key="monthly-report"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <MonthlyReport />
          </motion.div>
        );

      case 'add-project':
        return (
          <motion.div
            key="add-project"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <AddProject onProjectAdded={() => {
              setActiveTab('dashboard');
              setDashboardRefreshTrigger(prev => prev + 1);
            }} />
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="dashboard"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <FreelanceDashboard onNavigate={setActiveTab} />
          </motion.div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full loading-spinner"
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Seratus</h2>
          <p className="text-gray-600">Setting up your freelance dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 btn-animate"
          >
            Refresh Page
          </button>
        </motion.div>
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
          user={user || undefined}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}