'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import AddProjectCompact from './AddProjectCompact';

interface AddProjectPopoverProps {
  isActive: boolean;
  onProjectAdded?: () => void;
  expanded?: boolean;
}

export default function AddProjectPopover({ isActive, onProjectAdded, expanded = false }: AddProjectPopoverProps) {
  const [open, setOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [buttonTop, setButtonTop] = useState(0);

  // Update button position whenever open changes so we can place the fixed form
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonTop(rect.top);
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        formRef.current && !formRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
        !isFormDirty
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, isFormDirty]);

  const handleProjectAdded = () => {
    setOpen(false);
    setIsFormDirty(false);
    if (onProjectAdded) onProjectAdded();
  };

  return (
    <div className="relative">
      {/* + New Project Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setOpen(prev => !prev)}
        whileTap={{ scale: 0.97 }}
        title="New Project"
        className="w-full flex items-center py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left border border-transparent text-[#9CA3AF] hover:text-[#F5F5F5] hover:bg-white/5 group"
        style={{ paddingLeft: 12, paddingRight: 12 }}
      >
        <Plus className="w-[18px] h-[18px] shrink-0 text-[#6B7280] group-hover:text-[#9CA3AF]" />
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.13, delay: 0.04 }}
              className="ml-3 overflow-hidden whitespace-nowrap"
            >
              New Project
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Form — Fixed position so it's never clipped by sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, scale: 0.95, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed z-[200] w-96 max-h-[85vh] overflow-y-auto rounded-2xl bg-[#14161A] border border-white/8 shadow-2xl"
            style={{
              left: 76,
              top: Math.max(8, buttonTop - 8),
              transformOrigin: 'left top',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
              <h3 className="text-sm font-semibold text-[#FAFAFA]">Quick Add Project</h3>
              <button
                onClick={() => { setOpen(false); setIsFormDirty(false); }}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4 text-[#71717A]" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-4">
              <AddProjectCompact
                onProjectAdded={handleProjectAdded}
                onFormDataChange={(dirty) => setIsFormDirty(dirty)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}