'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, RefreshCw, Sparkles, FileText, DollarSign, FileCode, MessageSquare, X } from 'lucide-react';

interface StudioSummary {
  activeProjectsCount: number;
  pendingInvoicesCount: number;
  pendingInvoicesTotalIdr: number;
  completedProjectsThisMonth: number;
  topWorkTypeNameThisMonth: string | null;
}

interface StudioRobotProps {
  isPermanentPanel?: boolean;
  onNavigate?: (tab: string) => void;
}

export default function StudioRobot({ isPermanentPanel = false, onNavigate }: StudioRobotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<StudioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState('Good Morning');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good Morning');
    else if (hour >= 12 && hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/studio-summary', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching studio summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (actionType: string) => {
    switch (actionType) {
      case 'invoice':
        if (onNavigate) onNavigate('invoice');
        window.dispatchEvent(new CustomEvent('invoice:openCreateModal'));
        setAiResponse('⚡ Navigated to Invoices page & launched Invoice Creation Wizard!');
        break;
      case 'estimate':
        setAiResponse('💰 AI Project Estimator: Estimated rate for custom branding & UI design is $45 - $65/hr based on active studio projects.');
        break;
      case 'summarize':
        setAiResponse(`📊 Studio Summary: You currently have ${summary?.activeProjectsCount || 0} active projects, ${summary?.pendingInvoicesCount || 0} pending invoices, and ${summary?.completedProjectsThisMonth || 0} completed milestones this month.`);
        break;
      case 'reply':
        setAiResponse('✉️ Client Reply Draft: "Hello! Thank you for your update. The current project milestone is on track and will be delivered on schedule."');
        break;
      default:
        break;
    }
  };

  const renderContent = () => (
    <div className="space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#FAFAFA] flex items-center gap-1.5">
              Studio Robot <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </h3>
            <p className="text-[11px] text-[#A1A1AA]">Creative Assistant</p>
          </div>
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/5 transition-colors"
          title="Refresh Summary"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Morning Brief Card */}
      <div className="p-3.5 rounded-xl bg-[#1A1D22] border border-white/5 space-y-2">
        <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
          Daily Studio Brief
        </div>
        {loading ? (
          <div className="py-4 text-center text-xs text-[#A1A1AA] animate-pulse">
            Gathering studio metrics...
          </div>
        ) : summary ? (
          <div className="text-xs text-[#A1A1AA] space-y-1.5 leading-relaxed">
            <p className="font-medium text-[#FAFAFA]">{greeting}!</p>
            <ul className="space-y-1 text-[#A1A1AA] list-disc list-inside">
              <li><strong className="text-[#FAFAFA]">{summary.activeProjectsCount}</strong> Active Projects in pipeline</li>
              <li><strong className="text-[#FAFAFA]">{summary.pendingInvoicesCount}</strong> Pending Invoices</li>
              <li><strong className="text-[#FAFAFA]">{summary.completedProjectsThisMonth}</strong> Projects completed this month</li>
            </ul>
            <div className="pt-2 border-t border-white/5 text-[11px] text-[#71717A]">
              💡 <span className="text-[#FAFAFA]">Suggestion:</span> Focus on delivering urgent active milestones first.
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#A1A1AA] py-2">
            Click refresh to load your daily brief metrics.
          </div>
        )}
      </div>

      {/* AI Assistant Output Box */}
      {aiResponse && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 leading-relaxed relative"
        >
          <button
            onClick={() => setAiResponse(null)}
            className="absolute top-2 right-2 text-purple-400 hover:text-purple-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {aiResponse}
        </motion.div>
      )}

      {/* Quick Action Shortcuts */}
      <div className="space-y-2 pt-2">
        <div className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">
          Quick Actions
        </div>
        <div className="space-y-1.5">
          <button
            onClick={() => handleQuickAction('invoice')}
            className="w-full flex items-center space-x-2.5 p-2.5 rounded-xl bg-[#1A1D22] border border-white/5 hover:border-[#8B5CF6]/30 text-xs text-[#FAFAFA] hover:text-[#A78BFA] transition-all text-left group"
          >
            <FileText className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
            <span>Generate Invoice</span>
          </button>

          <button
            onClick={() => handleQuickAction('summarize')}
            className="w-full flex items-center space-x-2.5 p-2.5 rounded-xl bg-[#1A1D22] border border-white/5 hover:border-[#8B5CF6]/30 text-xs text-[#FAFAFA] hover:text-[#A78BFA] transition-all text-left group"
          >
            <FileCode className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
            <span>Summarize Studio</span>
          </button>

          <button
            onClick={() => handleQuickAction('reply')}
            className="w-full flex items-center space-x-2.5 p-2.5 rounded-xl bg-[#1A1D22] border border-white/5 hover:border-[#8B5CF6]/30 text-xs text-[#FAFAFA] hover:text-[#A78BFA] transition-all text-left group"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
            <span>Draft Client Reply</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Universal Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-3.5 rounded-2xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-xl transition-all duration-200 z-40 flex items-center space-x-2 group"
        title="Studio Robot Assistant"
      >
        <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold hidden sm:inline">Studio Robot</span>
      </button>

      {/* Universal Popover Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 z-50 p-5 bg-[#151515] border border-white/10 rounded-2xl shadow-2xl"
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[#8B5CF6]" /> Studio Robot Assistant
              </span>
              <button onClick={() => setIsOpen(false)} className="p-1 text-[#9CA3AF] hover:text-[#F5F5F5] rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}