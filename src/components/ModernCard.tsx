'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  delay?: number;
}

const ModernCard = ({ 
  children, 
  className = '', 
  hover = true, 
  glow = false,
  delay = 0 
}: ModernCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`
        glass-dark rounded-2xl p-6 
        ${hover ? 'card-hover' : ''} 
        ${glow ? 'pulse-glow' : ''}
        ${className}
      `}
      whileHover={hover ? { 
        scale: 1.02,
        boxShadow: '0 25px 50px rgba(139, 92, 246, 0.25)'
      } : {}}
    >
      {children}
    </motion.div>
  );
};

export default ModernCard;