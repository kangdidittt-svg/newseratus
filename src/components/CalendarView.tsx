'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, DollarSign, Users, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'meeting' | 'payment';
  client?: string;
  amount?: number;
}

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const sampleEvents: CalendarEvent[] = [
    { id: '1', title: 'Predator Combat Deliverables', date: '2026-07-28', type: 'deadline', client: 'Mr Sohail' },
    { id: '2', title: 'Scotland Design Review', date: '2026-07-26', type: 'meeting', client: 'Mr Sohail' },
    { id: '3', title: '11 Logo Sponsor Invoice Due', date: '2026-07-30', type: 'payment', amount: 200 },
  ];

  const getEventBadge = (type: 'deadline' | 'meeting' | 'payment') => {
    switch (type) {
      case 'deadline':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'meeting':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'payment':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            Studio Calendar <CalendarIcon className="w-5 h-5 text-purple-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">Deadlines, Meetings, and Payment Reminders</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-[#171A21] border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-200">{monthName}</span>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Events Stream / Agenda List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Deadlines Card */}
        <div className="p-5 rounded-2xl bg-[#171A21] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" /> Project Deadlines
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">7 Days</span>
          </div>
          <div className="space-y-2.5">
            {sampleEvents.filter(e => e.type === 'deadline').map(event => (
              <div key={event.id} className="p-3 rounded-xl bg-[#1E222B] border border-white/5 text-xs">
                <div className="font-semibold text-slate-100">{event.title}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Client: {event.client}</span>
                  <span className="font-mono text-rose-400">{event.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meetings Card */}
        <div className="p-5 rounded-2xl bg-[#171A21] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" /> Client Meetings
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">Upcoming</span>
          </div>
          <div className="space-y-2.5">
            {sampleEvents.filter(e => e.type === 'meeting').map(event => (
              <div key={event.id} className="p-3 rounded-xl bg-[#1E222B] border border-white/5 text-xs">
                <div className="font-semibold text-slate-100">{event.title}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>With: {event.client}</span>
                  <span className="font-mono text-purple-400">{event.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Reminders Card */}
        <div className="p-5 rounded-2xl bg-[#171A21] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Payment Reminders
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Pending</span>
          </div>
          <div className="space-y-2.5">
            {sampleEvents.filter(e => e.type === 'payment').map(event => (
              <div key={event.id} className="p-3 rounded-xl bg-[#1E222B] border border-white/5 text-xs">
                <div className="font-semibold text-slate-100">{event.title}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span className="font-mono text-emerald-400">${event.amount}</span>
                  <span className="font-mono text-slate-300">{event.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
