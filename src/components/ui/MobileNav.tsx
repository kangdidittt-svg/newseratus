'use client';

import React, { useState } from 'react';
import { Home, FolderOpen, FileText, Settings, CheckSquare, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddProjectCompact from '../AddProjectCompact';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange }) => {
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  const navItemsLeft = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
  ];

  const navItemsRight = [
    { id: 'todo', label: 'Tasks', icon: CheckSquare },
    { id: 'invoice', label: 'Invoices', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/5 px-3 py-2 z-40 lg:hidden bg-[#0B0C0E]/95 backdrop-blur-md">
        <div className="flex justify-between items-center max-w-md mx-auto relative px-1">
          
          {/* Left Nav Items */}
          <div className="flex items-center space-x-3">
            {navItemsLeft.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
                    isActive ? 'text-[#8B5CF6]' : 'text-[#71717A] hover:text-[#FAFAFA]'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-[10px] font-medium mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Center + New Project Button */}
          <button
            onClick={() => setShowAddProjectModal(true)}
            className="flex flex-col items-center justify-center -mt-5"
            title="New Project"
          >
            <div className="w-11 h-11 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white flex items-center justify-center shadow-lg shadow-purple-900/40 border-2 border-[#0B0C0E] transition-transform active:scale-95">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-semibold text-[#FAFAFA] mt-0.5">New</span>
          </button>

          {/* Right Nav Items */}
          <div className="flex items-center space-x-2">
            {navItemsRight.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
                    isActive ? 'text-[#8B5CF6]' : 'text-[#71717A] hover:text-[#FAFAFA]'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-[10px] font-medium mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Mobile New Project Bottom Sheet Modal */}
      <AnimatePresence>
        {showAddProjectModal && (
          <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center bg-black/70 backdrop-blur-sm p-0">
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-[#14161A] border-t border-white/10 rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
                <div>
                  <h3 className="text-base font-bold text-[#FAFAFA]">Create New Project</h3>
                  <p className="text-xs text-[#A1A1AA]">Add project details below</p>
                </div>
                <button
                  onClick={() => setShowAddProjectModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Component */}
              <AddProjectCompact
                onProjectAdded={() => setShowAddProjectModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};