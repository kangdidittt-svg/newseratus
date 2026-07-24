import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'red';
  change?: string;
  changeType?: 'increase' | 'decrease';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'purple',
  change,
  changeType
}) => {
  const colorClasses = {
    orange: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    blue: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    green: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    red: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
  };

  const changeColorClasses = {
    increase: 'text-emerald-400',
    decrease: 'text-rose-400'
  };

  return (
    <div className="bg-[#171A21] rounded-2xl border border-white/10 p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-black text-slate-100 mt-1 font-mono">{value}</p>
          {change && (
            <p className={`text-xs mt-1 font-medium ${changeColorClasses[changeType!]}`}>
              {changeType === 'increase' ? '↗' : '↘'} {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};