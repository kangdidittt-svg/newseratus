'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProfilePopoverProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  onNavigateToSettings?: () => void;
}

export default function ProfilePopover({ children, userName, userEmail, onNavigateToSettings }: ProfilePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovering(true);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    timeoutRef.current = setTimeout(() => {
      if (!isHovering) {
        setIsOpen(false);
      }
    }, 150);
  };

  const handlePopoverMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovering(true);
  };

  const handlePopoverMouseLeave = () => {
    setIsHovering(false);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Close popover first
        setIsOpen(false);
        // Redirect to login
        window.location.href = '/login';
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSettings = () => {
    // Close popover first
    setIsOpen(false);
    // Navigate to settings using callback if available
    if (onNavigateToSettings) {
      onNavigateToSettings();
    } else {
      // Fallback to router navigation
      router.push('/settings');
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer"
      >
        {children}
      </div>

      {/* Invisible Bridge */}
      {isOpen && (
        <div 
          className="absolute top-full left-1/2 transform -translate-x-1/2 w-full h-2 z-40"
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
        />
      )}

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute top-full right-0 mt-2 w-64 z-50"
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handlePopoverMouseLeave}
            style={{
              background: 'var(--neuro-bg)',
              border: '1px solid var(--neuro-border)',
              borderRadius: '12px',
              boxShadow: `
                8px 8px 16px var(--neuro-shadow-dark),
                -8px -8px 16px var(--neuro-shadow-light),
                0 10px 30px rgba(0, 0, 0, 0.2)
              `,
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Arrow */}
            <div 
              className="absolute -top-2 right-6 w-4 h-4 transform rotate-45"
              style={{
                background: 'var(--neuro-bg)',
                border: '1px solid var(--neuro-border)',
                borderBottom: 'none',
                borderRight: 'none'
              }}
            />

            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4 pb-4" style={{ borderBottom: '1px solid var(--neuro-border)' }}>
                <div 
                  className="p-2 rounded-full"
                  style={{
                    background: 'var(--neuro-bg)',
                    boxShadow: `
                      inset 4px 4px 8px var(--neuro-shadow-dark),
                      inset -4px -4px 8px var(--neuro-shadow-light)
                    `
                  }}
                >
                  <User className="h-4 w-4" style={{ color: 'var(--neuro-orange)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--neuro-text-primary)' }}>
                    {userName || 'User'}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--neuro-text-muted)' }}>
                    {userEmail || 'user@example.com'}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                {/* Settings */}
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--neuro-text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--neuro-bg-secondary)';
                    e.currentTarget.style.color = 'var(--neuro-text-primary)';
                    e.currentTarget.style.boxShadow = `
                      inset 2px 2px 4px var(--neuro-shadow-dark),
                      inset -2px -2px 4px var(--neuro-shadow-light)
                    `;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--neuro-text-secondary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">Settings</span>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--neuro-text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--neuro-error-light)';
                    e.currentTarget.style.color = 'var(--neuro-error)';
                    e.currentTarget.style.boxShadow = `
                      inset 2px 2px 4px var(--neuro-shadow-dark),
                      inset -2px -2px 4px var(--neuro-shadow-light)
                    `;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--neuro-text-secondary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}