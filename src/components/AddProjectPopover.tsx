'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import AddProjectCompact from './AddProjectCompact';

interface AddProjectPopoverProps {
  isActive: boolean;
  onProjectAdded?: () => void;
}

export default function AddProjectPopover({ isActive, onProjectAdded }: AddProjectPopoverProps) {
  const [open, setOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-close dengan hover detection dan proteksi form
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (isDesktop && !open) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isFormDirty) {
      hoverTimeoutRef.current = setTimeout(() => {
        setOpen(false);
      }, 500); // Delay 500ms sebelum menutup untuk mengurangi flicker
    }
  };



  // Tutup popover jika klik di luar (hanya jika form tidak terisi)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        !isFormDirty
      ) {
        setOpen(false);
      }
    }
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, isFormDirty]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Handle project added callback
  const handleProjectAdded = () => {
    setOpen(false); // Close popover after successful submission
    setIsFormDirty(false); // Reset form dirty state
    if (onProjectAdded) {
      onProjectAdded();
    }
  };

  // Handle form data change to track if form is dirty
  const handleFormDataChange = (isDirty: boolean) => {
    setIsFormDirty(isDirty);
  };

  // Only show on desktop (min-width: 768px)
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    
    return () => {
      window.removeEventListener('resize', checkIsDesktop);
    };
  }, []);

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tombol Add Project di sidebar */}
      <motion.button
        ref={buttonRef}
        className={`w-full flex items-center justify-center p-3 rounded-xl font-inter font-medium transition-all duration-300 ${
          isActive
            ? 'neuro-card-pressed'
            : 'neuro-button hover:neuro-button-hover'
        }`}
        style={{
          color: isActive ? 'var(--neuro-orange)' : 'var(--neuro-text-primary)'
        }}
        onClick={() => {
          if (isDesktop) {
            setOpen(prev => !prev);
          }
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title="Add Project"
      >
        <Plus 
          className="w-5 h-5" 
          style={{ 
            color: isActive ? 'var(--neuro-orange)' : 'var(--neuro-text-secondary)' 
          }} 
        />
      </motion.button>

      {/* Blur Background Overlay - Exclude sidebar area */}
      <AnimatePresence>
        {open && isDesktop && (
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 right-0 bottom-0 z-40"
              style={{
                left: '80px', // Sidebar width is 80px (w-20)
                backdropFilter: 'blur(4px)',
                backgroundColor: 'rgba(0, 0, 0, 0.1)'
              }}
            />
        )}
      </AnimatePresence>

      {/* Invisible bridge untuk mencegah flicker */}
      {open && isDesktop && (
        <div className="absolute left-full top-0 w-4 h-full z-40" />
      )}

      {/* Popover Form - Only on desktop */}
      <AnimatePresence>
        {open && isDesktop && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.4
            }}
            className="absolute left-full top-0 ml-4 w-96 max-h-[60vh] overflow-y-auto z-50"
            style={{
              transformOrigin: 'left top',
              background: 'var(--neuro-bg)',
              borderRadius: '20px 20px 20px 8px', // Bubble chat shape
              boxShadow: '12px 12px 24px rgba(163, 163, 166, 0.4), -12px -12px 24px rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Chat bubble tail */}
            <div 
              className="absolute -left-2 top-6 w-4 h-4 rotate-45"
              style={{
                background: 'var(--neuro-bg)',
                boxShadow: '-3px -3px 6px rgba(255, 255, 255, 0.9), 3px 3px 6px rgba(163, 163, 166, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRight: 'none',
                borderBottom: 'none'
              }}
            />
            
            {/* Header dengan tombol close */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--neuro-border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>
                Quick Add Project
              </h3>
              <button
                onClick={() => {
                  setOpen(false);
                  setIsFormDirty(false);
                }}
                className="neuro-button p-2 rounded-lg hover:scale-110 transition-transform"
                style={{ minWidth: 'auto' }}
              >
                <X className="w-4 h-4" style={{ color: 'var(--neuro-text-secondary)' }} />
              </button>
            </div>
            
            {/* Form Content */}
            <div className="p-4">
              <AddProjectCompact 
                onProjectAdded={handleProjectAdded}
                onFormDataChange={handleFormDataChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}