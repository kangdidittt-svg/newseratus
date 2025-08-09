'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

const GradientText = ({ children, className = '', animate = false }: GradientTextProps) => {
  const Component = animate ? motion.span : 'span';
  
  const animationProps = animate ? {
    initial: { backgroundPosition: '0% 50%' },
    animate: { backgroundPosition: '100% 50%' },
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      ease: 'easeInOut' as const
    }
  } : {};

  return (
    <Component
      className={`gradient-text font-bold ${className}`}
      style={{
        backgroundSize: animate ? '200% 200%' : 'auto'
      }}
      {...animationProps}
    >
      {children}
    </Component>
  );
};

export default GradientText;