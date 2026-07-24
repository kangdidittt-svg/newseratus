'use client';

import { useState, useEffect } from 'react';
import { Clock, Globe } from 'lucide-react';

export default function EdinburghClock() {
  const [edinburghTime, setEdinburghTime] = useState<string>('');
  const [indonesiaTime, setIndonesiaTime] = useState<string>('');
  const [status, setStatus] = useState<{ label: string; indicator: string; color: string }>({
    label: 'Working Hour',
    indicator: '🟢',
    color: 'text-emerald-400'
  });
  const [overlapText, setOverlapText] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const updateClocks = () => {
      const now = new Date();

      // Edinburgh Time (Europe/London)
      const ediDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
      const ediHours = ediDate.getHours();
      const ediMins = ediDate.getMinutes();

      // Indonesia Time (Asia/Jakarta WIB)
      const idnDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const idnHours = idnDate.getHours();

      setEdinburghTime(ediDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIndonesiaTime(idnDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));

      // Working Hour Status for Edinburgh (09:00 - 17:00)
      if (ediHours >= 9 && ediHours < 12) {
        setStatus({ label: 'Working Hour', indicator: '🟢', color: 'text-emerald-400' });
      } else if (ediHours >= 12 && ediHours < 13) {
        setStatus({ label: 'Lunch Break', indicator: '🟡', color: 'text-amber-400' });
      } else if (ediHours >= 13 && ediHours < 17) {
        setStatus({ label: 'Working Hour', indicator: '🟢', color: 'text-emerald-400' });
      } else {
        setStatus({ label: 'Offline', indicator: '🔴', color: 'text-rose-400' });
      }

      // Next overlap calculation:
      // Overlap occurs when both Edinburgh & Indonesia are within working hours (e.g. 09:00-12:00 UK = 15:00-18:00 WIB)
      if (ediHours >= 9 && ediHours < 12 && idnHours >= 15 && idnHours <= 18) {
        setOverlapText('Overlap Active Now (Ideal Meeting Time)');
      } else if (ediHours < 9) {
        const hoursUntil = 9 - ediHours;
        setOverlapText(`Next Overlap in ~${hoursUntil}h (09:00 UK / 15:00 WIB)`);
      } else {
        setOverlapText('Next Overlap Tomorrow at 09:00 UK (15:00 WIB)');
      }
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#1A1D22] border border-white/5 text-xs text-[#71717A]">
        <span>Loading clock...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center px-3.5 py-1.5 rounded-xl bg-[#1A1D22] border border-white/5 text-xs shadow-sm font-sans">
      <div className="flex flex-col justify-center">
        <div className="flex items-center space-x-2 text-[11px] font-mono font-bold text-[#FAFAFA]">
          <span className="flex items-center space-x-1">
            <span>{edinburghTime ? edinburghTime.slice(0, 5) : '13:40'}</span>
            <span className="text-[9px] text-[#A1A1AA] font-sans font-normal">UK</span>
          </span>
          <span className="text-[#71717A] font-normal">|</span>
          <span className="flex items-center space-x-1">
            <span>{indonesiaTime ? indonesiaTime.slice(0, 5) : '19:40'}</span>
            <span className="text-[9px] text-[#A1A1AA] font-sans font-normal">WIB</span>
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-[#71717A] mt-0.5 font-sans">
          <span className="text-[#A1A1AA] font-medium">{status.label}</span>
          <span className="hidden sm:inline text-[#71717A]">•</span>
          <span className="hidden sm:inline truncate max-w-[170px]" title={overlapText}>{overlapText}</span>
        </div>
      </div>
    </div>
  );
}