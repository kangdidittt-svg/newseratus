'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, Clock, User, ExternalLink, Tag } from 'lucide-react';

interface Project {
  _id?: string;
  id?: string | number;
  title: string;
  description?: string;
  client: string;
  status: string;
  priority?: string;
  category?: string;
  budget?: number;
  hourlyRate?: number;
  hoursWorked?: number;
  totalEarned?: number;
  deadline?: string | Date;
  masterLink?: string;
  masterNotes?: string;
}

interface ProjectSidePanelProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectSidePanel({ project, onClose }: ProjectSidePanelProps) {
  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-[#171A21] border-l border-white/10 h-full p-6 overflow-y-auto flex flex-col justify-between"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {project.category || 'Freelance Project'}
                </span>
                <h2 className="text-xl font-bold text-slate-100 mt-2">{project.title}</h2>
                <p className="text-xs text-slate-400 flex items-center mt-1">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Client: <strong className="text-slate-200 ml-1">{project.client}</strong>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#1E222B] border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Status</div>
                <div className="text-sm font-bold capitalize text-purple-400 mt-0.5">{project.status}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#1E222B] border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Budget / Earned</div>
                <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                  ${(project.totalEarned || project.budget || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Scope / Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description & Scope</h3>
              <div className="p-3.5 rounded-xl bg-[#1E222B] border border-white/5 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                {project.description || 'No detailed scope description provided.'}
              </div>
            </div>

            {/* Additional Notes & Master Link */}
            {project.masterNotes && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Master Notes</h3>
                <div className="p-3.5 rounded-xl bg-[#1E222B] border border-white/5 text-xs text-slate-300 whitespace-pre-line">
                  {project.masterNotes}
                </div>
              </div>
            )}

            {project.masterLink && (
              <a
                href={project.masterLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium hover:bg-purple-500/20 transition-colors"
              >
                <span className="truncate">Open Deliverables / Master Link</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            )}
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
}
