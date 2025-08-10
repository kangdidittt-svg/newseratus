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
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Tutup popover jika klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
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
  }, [open]);

  // Handle project added callback
  const handleProjectAdded = () => {
    setOpen(false); // Close popover after successful submission
    if (onProjectAdded) {
      onProjectAdded();
    }
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
    <div className="relative">
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
        onMouseEnter={() => {
          if (isDesktop) {
            setOpen(true);
          }
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

      {/* Popover Form - Only on desktop */}
      <AnimatePresence>
        {open && isDesktop && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -10 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.2, 0.8, 0.2, 1]
            }}
            className="absolute left-full top-0 ml-4 w-96 max-h-[80vh] overflow-y-auto z-50"
            style={{
              transformOrigin: 'left center',
              background: 'var(--neuro-bg)',
              borderRadius: 'var(--neuro-radius-lg)',
              boxShadow: '8px 8px 16px rgba(163, 163, 166, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.9)'
            }}
          >
            {/* Header dengan tombol close */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--neuro-border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>
                Quick Add Project
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="neuro-button p-2 rounded-lg"
                style={{ minWidth: 'auto' }}
              >
                <X className="w-4 h-4" style={{ color: 'var(--neuro-text-secondary)' }} />
              </button>
            </div>
            
            {/* Form Content */}
            <div className="p-4">
              <AddProjectCompact onProjectAdded={handleProjectAdded} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}