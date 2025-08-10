'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessPopupProps {
  isVisible: boolean;
  isLoading: boolean;
  title: string;
  message: string;
  onComplete?: () => void;
}

export default function SuccessPopup({ 
  isVisible, 
  isLoading, 
  title, 
  message, 
  onComplete 
}: SuccessPopupProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isVisible && !isLoading) {
      // Delay untuk menampilkan success setelah loading selesai
      const timer = setTimeout(() => {
        setShowSuccess(true);
        
        // Generate particles untuk efek celebrasi
        const newParticles = Array.from({ length: 12 }, (_, i) => ({
          id: i,
          x: Math.random() * 300 - 150,
          y: Math.random() * 300 - 150,
          delay: Math.random() * 0.5
        }));
        setParticles(newParticles);
        
        // Auto close setelah 3 detik
        const closeTimer = setTimeout(() => {
          if (onComplete) onComplete();
        }, 3000);
        
        return () => clearTimeout(closeTimer);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setShowSuccess(false);
      setParticles([]);
    }
  }, [isVisible, isLoading, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
          className="relative p-8 rounded-2xl max-w-md w-full mx-4"
          style={{
            background: 'var(--neuro-bg)',
            boxShadow: `
              20px 20px 40px var(--neuro-shadow-dark),
              -20px -20px 40px var(--neuro-shadow-light),
              0 0 60px rgba(255, 165, 0, 0.1)
            `,
            border: '1px solid var(--neuro-border)'
          }}
        >
          {/* Particles untuk efek celebrasi */}
          {showSuccess && particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                opacity: 0, 
                scale: 0, 
                x: 0, 
                y: 0 
              }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1, 0.5], 
                x: particle.x, 
                y: particle.y,
                rotate: 360
              }}
              transition={{ 
                duration: 2, 
                delay: particle.delay,
                ease: "easeOut"
              }}
              className="absolute top-1/2 left-1/2 pointer-events-none"
            >
              <Sparkles 
                className="w-4 h-4" 
                style={{ color: 'var(--neuro-orange)' }} 
              />
            </motion.div>
          ))}

          <div className="text-center">
            {/* Loading State */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="relative">
                  {/* Outer rotating ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    className="w-16 h-16 rounded-full border-4 border-transparent"
                    style={{
                      borderTopColor: 'var(--neuro-orange)',
                      borderRightColor: 'var(--neuro-orange)',
                      background: `conic-gradient(from 0deg, var(--neuro-orange), transparent)`
                    }}
                  />
                  
                  {/* Inner pulsing circle */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute inset-2 rounded-full"
                    style={{
                      background: 'var(--neuro-orange)',
                      opacity: 0.2
                    }}
                  />
                  
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 
                      className="w-6 h-6 animate-spin" 
                      style={{ color: 'var(--neuro-orange)' }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <motion.h3 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="text-lg font-semibold"
                    style={{ color: 'var(--neuro-text-primary)' }}
                  >
                    Membuat Project...
                  </motion.h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--neuro-text-secondary)' }}
                  >
                    Sedang memproses data project Anda
                  </p>
                </div>
                
                {/* Loading dots */}
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        y: [-4, 4, -4],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity, 
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--neuro-orange)' }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Success State */}
            {!isLoading && showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25 
                }}
                className="flex flex-col items-center space-y-4"
              >
                {/* Success Icon dengan efek ripple */}
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ 
                      duration: 0.6,
                      times: [0, 0.6, 1],
                      ease: "easeOut"
                    }}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: 'var(--neuro-success)',
                      boxShadow: `
                        8px 8px 16px var(--neuro-shadow-dark),
                        -8px -8px 16px var(--neuro-shadow-light),
                        0 0 30px rgba(34, 197, 94, 0.3)
                      `
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: 0.3,
                        duration: 0.5,
                        ease: "easeOut"
                      }}
                    >
                      <CheckCircle 
                        className="w-8 h-8 text-white" 
                      />
                    </motion.div>
                  </motion.div>
                  
                  {/* Ripple effect */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ 
                      scale: [0, 2, 3], 
                      opacity: [0.8, 0.3, 0] 
                    }}
                    transition={{ 
                      duration: 1.5,
                      ease: "easeOut"
                    }}
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: 'var(--neuro-success)' }}
                  />
                </div>
                
                <div className="space-y-2">
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl font-bold"
                    style={{ color: 'var(--neuro-success)' }}
                  >
                    {title}
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm"
                    style={{ color: 'var(--neuro-text-secondary)' }}
                  >
                    {message}
                  </motion.p>
                </div>
                
                {/* Success checkmark animation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs font-medium px-4 py-2 rounded-full"
                  style={{
                    background: 'var(--neuro-success-light)',
                    color: 'var(--neuro-success)'
                  }}
                >
                  Dashboard akan terupdate otomatis
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}