'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel'
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="neuro-card p-6 max-w-md w-full"
        style={{
          background: 'var(--neuro-bg)',
          border: '1px solid var(--neuro-border)',
          boxShadow: `
            inset 8px 8px 16px var(--neuro-shadow-dark),
            inset -8px -8px 16px var(--neuro-shadow-light),
            0 20px 40px rgba(0, 0, 0, 0.3)
          `
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-full"
              style={{
                background: 'var(--neuro-error-light)',
                boxShadow: `
                  inset 4px 4px 8px var(--neuro-shadow-dark),
                  inset -4px -4px 8px var(--neuro-shadow-light)
                `
              }}
            >
              <AlertTriangle className="h-5 w-5" style={{ color: 'var(--neuro-error)' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="neuro-button p-2 transition-all duration-200"
            style={{
              background: 'var(--neuro-bg)',
              border: 'none',
              boxShadow: `
                4px 4px 8px var(--neuro-shadow-dark),
                -4px -4px 8px var(--neuro-shadow-light)
              `
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `
                inset 2px 2px 4px var(--neuro-shadow-dark),
                inset -2px -2px 4px var(--neuro-shadow-light)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `
                4px 4px 8px var(--neuro-shadow-dark),
                -4px -4px 8px var(--neuro-shadow-light)
              `;
            }}
          >
            <X className="h-4 w-4" style={{ color: 'var(--neuro-text-muted)' }} />
          </button>
        </div>

        {/* Message */}
        <div className="mb-8">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--neuro-text-secondary)' }}>
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium transition-all duration-200"
            style={{
              background: 'var(--neuro-bg)',
              color: 'var(--neuro-text-secondary)',
              border: 'none',
              boxShadow: `
                4px 4px 8px var(--neuro-shadow-dark),
                -4px -4px 8px var(--neuro-shadow-light)
              `
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `
                inset 2px 2px 4px var(--neuro-shadow-dark),
                inset -2px -2px 4px var(--neuro-shadow-light)
              `;
              e.currentTarget.style.color = 'var(--neuro-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `
                4px 4px 8px var(--neuro-shadow-dark),
                -4px -4px 8px var(--neuro-shadow-light)
              `;
              e.currentTarget.style.color = 'var(--neuro-text-secondary)';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-2 rounded-lg font-medium transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, var(--neuro-error), #dc2626)',
              color: 'white',
              border: 'none',
              boxShadow: `
                4px 4px 8px var(--neuro-shadow-dark),
                -4px -4px 8px var(--neuro-shadow-light),
                0 4px 12px rgba(239, 68, 68, 0.3)
              `
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `
                6px 6px 12px var(--neuro-shadow-dark),
                -6px -6px 12px var(--neuro-shadow-light),
                0 6px 16px rgba(239, 68, 68, 0.4)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `
                4px 4px 8px var(--neuro-shadow-dark),
                -4px -4px 8px var(--neuro-shadow-light),
                0 4px 12px rgba(239, 68, 68, 0.3)
              `;
            }}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}