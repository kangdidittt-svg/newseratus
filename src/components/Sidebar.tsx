'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  FolderOpen,
  CheckSquare,
  FileText,
  Calendar,
  BarChart2,
  Settings,
  Plus,
  LogOut,
} from 'lucide-react';
import AddProjectPopover from './AddProjectPopover';
import ProfilePopover from './ProfilePopover';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const menuItems = [
  { id: 'dashboard', label: 'Workspace', icon: LayoutGrid },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'todo', label: 'Tasks', icon: CheckSquare },
  { id: 'invoice', label: 'Invoices', icon: FileText },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'monthly-report', label: 'Insights', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, user }: SidebarProps) {
  const [expanded, setExpanded] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <motion.aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      animate={{ width: expanded ? 220 : 64 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="bg-[#0B0C0E] border-r border-white/5 h-screen flex flex-col justify-between py-4 fixed left-0 top-0 z-30 font-sans overflow-hidden"
      style={{ minWidth: 64 }}
    >
      <div className="space-y-2">
        {/* Brand Logo — hover triggers expand */}
        <div className="flex items-center px-3.5 py-1 mb-3">
          <div className="w-8 h-8 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black text-base shrink-0 select-none">
            S
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15, delay: 0.05 }}
                className="ml-3 overflow-hidden whitespace-nowrap"
              >
                <p className="text-sm font-bold tracking-tight text-[#F5F5F5] leading-none">StudioManager</p>
                <p className="text-[10px] text-[#6B7280] mt-0.5">Creative OS</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* + New Project — icon-only or with label */}
        <div className="px-3 mb-1">
          <AddProjectPopover
            isActive={false}
            onProjectAdded={() => {}}
            expanded={expanded}
          />
        </div>

        {/* Nav Items */}
        <nav className="space-y-0.5 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={!expanded ? item.label : undefined}
                className={`w-full flex items-center py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left group ${
                  isActive
                    ? 'bg-[#181A20] text-[#F5F5F5] font-semibold border border-white/5'
                    : 'text-[#9CA3AF] hover:text-[#F5F5F5] hover:bg-white/5 border border-transparent'
                }`}
                style={{ paddingLeft: 12, paddingRight: 12 }}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#8B5CF6]' : 'text-[#6B7280] group-hover:text-[#9CA3AF]'}`}
                />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.13, delay: 0.04 }}
                      className="ml-3 overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Avatar & Logout */}
      <div className="pt-3 border-t border-white/5 px-3 flex items-center justify-between">
        <ProfilePopover
          userName={user?.name}
          userEmail={user?.email}
          onNavigate={setActiveTab}
        >
          <div
            title={!expanded ? (user?.name || 'Profile & Logout') : undefined}
            className="flex items-center py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs text-purple-300 font-bold shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SA'}
              </div>
            )}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.13, delay: 0.04 }}
                  className="ml-2.5 overflow-hidden min-w-0 text-left pr-1"
                >
                  <div className="text-xs font-bold text-[#F5F5F5] truncate max-w-[100px]">{user?.name || 'Studio Admin'}</div>
                  <div className="text-[10px] text-[#6B7280] truncate max-w-[100px]">{user?.email || 'studio@manager.io'}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ProfilePopover>

        {/* Quick Logout button when expanded */}
        <AnimatePresence>
          {expanded && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-[#9CA3AF] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
