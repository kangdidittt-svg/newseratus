'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X } from 'lucide-react';
// import ModernCard from '@/components/ModernCard';

interface StudioSummary {
  activeProjectsCount: number;
  pendingInvoicesCount: number;
  pendingInvoicesTotalIdr: number;
  completedProjectsThisMonth: number;
  topWorkTypeNameThisMonth: string | null;
}

export default function StudioRobot() {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<StudioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState('Halo yang mulia✨');

  useEffect(() => {
    // Set greeting based on time
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 12) {
      setGreeting('Pagi! yang mulia✨');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Siang! yang mulia✨');
    } else if (hour >= 18 && hour < 23) {
      setGreeting('Malam! yang mulia✨');
    } else {
      setGreeting('Halo yang mulia✨');
    }
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/studio-summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        setSummary(null);
      }
    } catch (error) {
      console.error('Error fetching studio summary:', error);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRobotClick = () => {
    setIsOpen(true);
    fetchSummary();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDailyReport = () => {
    if (loading) {
      return 'Mengambil data...';
    }

    if (!summary) {
      return 'Maaf yang mulia, aku gagal ambil data hari ini 😅';
    }

    return `${greeting}
• Project aktif: ${summary.activeProjectsCount}
• Invoice pending: ${summary.pendingInvoicesCount} (total ${formatCurrency(summary.pendingInvoicesTotalIdr)})
• Project selesai bulan ini: ${summary.completedProjectsThisMonth}
• Tipe kerja terbanyak: ${summary.topWorkTypeNameThisMonth || 'Belum ada'}`;
  };

  return (
    <>
      {/* Robot Button */}
      <motion.button
        onClick={handleRobotClick}
        className="fixed bottom-6 right-6 neuro-button-orange p-4 rounded-full shadow-lg transition-all duration-300 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
        aria-label="Studio Robot"
      >
        <Bot className="h-6 w-6" />
      </motion.button>

      {/* Robot Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-80 z-50"
          >
            <div className="neuro-card p-6 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg neuro-card">
                    <Bot className="h-5 w-5" style={{ color: 'var(--neuro-orange)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>Studio Robot</h3>
                    <p className="text-xs" style={{ color: 'var(--neuro-text-secondary)' }}>Asisten harianmu</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="neuro-button p-1"
                  >
                  <X className="h-4 w-4" style={{ color: 'var(--neuro-text-muted)' }} />
                  </button>
              </div>

              {/* Chat Content */}
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-lg p-4"
                  style={{ background: 'var(--neuro-bg-secondary)' }}
                  >
                  <div className="text-sm whitespace-pre-line leading-relaxed" style={{ color: 'var(--neuro-text-primary)' }}>
                    {getDailyReport()}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={fetchSummary}
                    disabled={loading}
                    className="flex-1 neuro-button text-xs py-2"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    className="flex-1 neuro-button-orange text-xs py-2"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}