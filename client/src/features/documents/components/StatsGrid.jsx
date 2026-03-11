import React from 'react';
import { LayoutDashboard, FileText, Clock, BadgePercent } from 'lucide-react';
import { formatNumber } from '../../../utils/helpers';

const StatsCard = ({ title, value, icon: Icon, colorClass, shadowClass }) => (
  <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-5 group`}>
    <div className={`p-4 rounded-xl ${colorClass} text-white group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-800">{value}</h3>
    </div>
  </div>
);

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard 
        title="Net Pay (ยอดจ่ายสุทธิ)" 
        value={`฿${formatNumber(stats.totalNetPay)}`} 
        icon={LayoutDashboard} 
        colorClass="bg-blue-600"
      />
      <StatsCard 
        title="Total Bills (จำนวนบิล)" 
        value={stats.count} 
        icon={FileText} 
        colorClass="bg-indigo-600"
      />
      <StatsCard 
        title="Upcoming (ใน 7 วัน)" 
        value={stats.upcomingDue} 
        icon={Clock} 
        colorClass="bg-amber-500"
      />
      <StatsCard 
        title="Total WHT (หัก ณ ที่จ่าย)" 
        value={`฿${formatNumber(stats.totalWHT)}`} 
        icon={BadgePercent} 
        colorClass="bg-emerald-600"
      />
    </div>
  );
};

export default StatsGrid;