'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, FolderOpen, Plus, BarChart3, FileText, BookOpen, Settings, CheckSquare } from 'lucide-react';
// import { useRouter } from 'next/navigation';
import AddProjectPopover from './AddProjectPopover';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  // const router = useRouter();

  const menuItems = [
    {
      id: 'add-project',
      label: 'Add Project',
      icon: Plus,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
    },
    {
      id: 'todo',
      label: 'To Do List',
      icon: CheckSquare,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderOpen,
    },
    {
      id: 'studio-library',
      label: 'Studio Library',
      icon: BookOpen,
    },
    {
      id: 'invoice',
      label: 'Invoice',
      icon: FileText,
    },
    {
      id: 'monthly-report',
      label: 'Reports',
      icon: BarChart3,
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
      className="w-20 bg-var(--neuro-bg) h-screen flex flex-col items-center justify-center p-4 fixed left-0 top-0 z-10"
      style={{ background: 'var(--neuro-bg)' }}
    >

      {/* Navigation Menu */}
      <motion.nav className="flex flex-col items-center">
        <div className="space-y-2 flex flex-col items-center">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                custom={index}
              >
                {item.id === 'add-project' ? (
                  <AddProjectPopover 
                    isActive={isActive}
                    onProjectAdded={() => {
                      // Project added successfully, stay on current page
                      // No redirect needed
                    }}
                  />
                ) : (
                  <motion.button
                    className={`w-full flex items-center justify-center p-3 rounded-xl font-inter font-medium transition-all duration-300 ${
                      isActive
                        ? 'neuro-card-pressed'
                        : 'neuro-button hover:neuro-button-hover'
                    }`}
                    style={{
                      color: isActive ? 'var(--neuro-orange)' : 'var(--neuro-text-primary)'
                    }}
                    onClick={() => {
                      if (item.id === 'todo') {
                        setActiveTab('todo');
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" style={{ color: isActive ? 'var(--neuro-orange)' : 'var(--neuro-text-secondary)' }} />
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.nav>

    </motion.div>
  );
}
