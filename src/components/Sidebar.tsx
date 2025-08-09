'use client';

import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Plus,
  FolderOpen,
  FileText,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function Sidebar({ activeTab, setActiveTab, user }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'add-project',
      label: 'Add Project',
      icon: Plus,
    },
    {
      id: 'projects',
      label: 'Project List',
      icon: FolderOpen,
    },
    {
      id: 'monthly-report',
      label: 'Monthly Report',
      icon: FileText,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
      },
    },
  };



  return (
    <motion.div
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-20 lg:w-20 md:w-16 sm:w-14 bg-gray-900 min-h-screen shadow-xl flex flex-col justify-center items-center py-8"
    >
      <div className="flex flex-col items-center space-y-8">
        {/* Logo/Brand */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-center"
        >
          <motion.div 
            className="w-12 h-12 md:w-10 md:h-10 sm:w-8 sm:h-8 bg-white rounded-2xl flex items-center justify-center"
            whileHover={{ 
              scale: 1.1,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-gray-900 font-bold text-xl md:text-lg sm:text-base">N</span>
          </motion.div>
        </motion.div>

        {/* Navigation Menu */}
        <motion.nav className="space-y-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                custom={index}
                className="flex justify-center"
              >
                <motion.button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-12 h-12 md:w-10 md:h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-2xl transition-all duration-300 group relative ${
                    activeTab === item.id 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ 
                    scale: 0.9,
                    transition: { duration: 0.1 }
                  }}
                  title={item.label}
                >
                  <Icon className="h-6 w-6 md:h-5 md:w-5 sm:h-4 sm:w-4" />
                  {isActive && (
                    <motion.div
                      className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-full"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.nav>

        {/* User Profile Section */}
        <div className="flex flex-col items-center">
          {/* Profile Photo */}
          <motion.div
            variants={itemVariants}
            className="w-12 h-12 md:w-10 md:h-10 sm:w-8 sm:h-8 rounded-2xl overflow-hidden cursor-pointer relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={user?.name || 'User Profile'}
            onClick={() => setActiveTab('settings')}
          >
            {user?.avatar && !user.avatar.includes('placeholder') ? (
              <img 
                src={user.avatar} 
                alt={user.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-semibold text-lg md:text-base sm:text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}