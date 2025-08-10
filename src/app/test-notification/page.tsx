'use client';

import NotificationPopover from '../../components/NotificationPopover';
import { Bell } from 'lucide-react';
import { useState } from 'react';

const mockNotifications = [
  {
    id: '1',
    title: 'Project Created',
    message: 'New project "Website Redesign" has been created successfully',
    time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unread: true,
    type: 'project',
    projectTitle: 'Website Redesign',
    clientName: 'John Doe'
  },
  {
    id: '2', 
    title: 'User Notification',
    message: 'Your profile has been updated',
    time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unread: false,
    type: 'user'
  },
  {
    id: '3',
    title: 'Warning',
    message: 'System maintenance scheduled for tonight',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unread: true,
    type: 'warning'
  }
];

export default function TestNotificationPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAsRead = (ids?: string[]) => {
    console.log('Mark as read:', ids);
    if (ids) {
      setNotifications(prev => 
        prev.map(n => ids.includes(n.id) ? { ...n, unread: false } : n)
      );
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    }
  };

  const handleDelete = async (id: string) => {
    console.log('Delete notification:', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    return true;
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--neuro-bg)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: 'var(--neuro-text-primary)' }}>
          Test Notification Popover
        </h1>
        
        <div className="flex justify-center items-center space-x-8">
          {/* Test Area */}
          <div className="p-8 rounded-2xl" style={{
            background: 'var(--neuro-bg)',
            boxShadow: '12px 12px 24px rgba(163, 163, 166, 0.4), -12px -12px 24px rgba(255, 255, 255, 0.9)'
          }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--neuro-text-primary)' }}>
              Hover Test
            </h2>
            <p className="mb-4" style={{ color: 'var(--neuro-text-secondary)' }}>
              Arahkan cursor ke tombol bell di bawah ini:
            </p>
            
            <div className="flex justify-center">
              <NotificationPopover
                notifications={notifications}
                unreadCount={unreadCount}
                isLoading={false}
                connectionStatus="connected"
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              >
                <button 
                  className="p-4 rounded-full relative"
                  style={{
                    background: 'var(--neuro-bg)',
                    boxShadow: '8px 8px 16px rgba(163, 163, 166, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Bell className="h-6 w-6" style={{ color: 'var(--neuro-text-primary)' }} />
                  {unreadCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: 'var(--neuro-orange)' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              </NotificationPopover>
            </div>
            
            <div className="mt-6 text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>
              <p>• Hover untuk membuka popover</p>
              <p>• Klik untuk toggle</p>
              <p>• Check console untuk log events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}