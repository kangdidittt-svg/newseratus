import React from 'react';
import { Home, FolderOpen, FileText, Settings, CheckSquare } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'todo', label: 'Tasks', icon: CheckSquare },
    { id: 'invoice', label: 'Invoice', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 border-t px-2 py-1.5 z-50 md:hidden backdrop-blur-lg"
      style={{
        backgroundColor: 'rgba(11, 19, 32, 0.92)',
        borderColor: 'rgba(56, 189, 248, 0.15)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'} />
              <span className="text-[10px] font-medium mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};