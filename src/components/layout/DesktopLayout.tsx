import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { BarChart3, FolderOpen, FileText, DollarSign, CheckSquare, Settings, Plus, Search, Bell, User } from 'lucide-react';

interface DesktopLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DesktopLayout({ children, activeTab, onTabChange }: DesktopLayoutProps) {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'projects', label: 'Projects', icon: <FolderOpen className="w-5 h-5" /> },
    { id: 'create', label: 'Create Project', icon: <Plus className="w-5 h-5" /> },
    { id: 'invoices', label: 'Invoices', icon: <FileText className="w-5 h-5" /> },
    { id: 'payments', label: 'Payments', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="hidden md:flex h-screen" style={{ backgroundColor: 'var(--neuro-bg)' }}>
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col" style={{ backgroundColor: 'var(--neuro-bg-secondary)', borderColor: 'var(--neuro-border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--neuro-border)' }}>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--neuro-text-primary)' }}>
            Studio<span style={{ color: 'var(--neuro-accent)' }}>Manager</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm',
                activeTab === item.id
                  ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="border-b px-6 py-4" style={{ backgroundColor: 'var(--neuro-bg-secondary)', borderColor: 'var(--neuro-border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--neuro-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-9 pr-4 py-2 text-sm rounded-xl outline-none transition-all duration-200 border"
                  style={{
                    backgroundColor: 'var(--neuro-bg)',
                    borderColor: 'var(--neuro-border)',
                    color: 'var(--neuro-text-primary)'
                  }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-xl border transition-all" style={{ backgroundColor: 'var(--neuro-bg)', borderColor: 'var(--neuro-border)' }}>
                <Bell className="w-4 h-4" style={{ color: 'var(--neuro-text-secondary)' }} />
              </button>
              <button className="p-2 rounded-xl border transition-all" style={{ backgroundColor: 'var(--neuro-bg)', borderColor: 'var(--neuro-border)' }}>
                <User className="w-4 h-4" style={{ color: 'var(--neuro-text-secondary)' }} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}