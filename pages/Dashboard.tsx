import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { apiService } from '../services/api';
import { DistributionCollectorQuery, DistributionSchedulerSchedule, DistributionDistributerDistribution } from '../types';
import { Loader2, Database, CalendarClock, Share2, TrendingUp, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    queries: [] as DistributionCollectorQuery[],
    schedules: [] as DistributionSchedulerSchedule[],
    distributions: [] as DistributionDistributerDistribution[],
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [q, s, d] = await Promise.all([
          apiService.getQueries(),
          apiService.getSchedules(),
          apiService.getDistributions(),
        ]);
        setStats({ queries: q, schedules: s, distributions: d });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-[#664FE1]" size={48} /></div>;
  }

  const activeStats = [
    { 
        id: 'queries',
        name: 'שאילתות', 
        value: stats.queries.filter(x => x.isActive === 1).length, 
        total: stats.queries.length,
        icon: Database,
        color: '#6366f1', // Indigo
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        bar: 'bg-indigo-500',
        path: '/queries'
    },
    { 
        id: 'schedules',
        name: 'תזמונים', 
        value: stats.schedules.filter(x => x.isActive === 1).length, 
        total: stats.schedules.length,
        icon: CalendarClock,
        color: '#10b981', // Emerald
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        bar: 'bg-emerald-500',
        path: '/schedules'
    },
    { 
        id: 'distributions',
        name: 'הפצות', 
        value: stats.distributions.filter(x => x.isActive === 1).length, 
        total: stats.distributions.length,
        icon: Share2,
        color: '#f59e0b', // Amber
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
        bar: 'bg-amber-500',
        path: '/distributions'
    },
  ];

  const pieData = activeStats.map(s => ({ name: s.name, value: s.value }));

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 shadow-lg rounded-lg text-right z-50">
          <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
          {payload.map((p: any, index: number) => (
             <p key={index} className="text-sm font-medium flex items-center justify-end gap-2" style={{ color: p.fill || p.color }}>
                <span>{p.value}</span>
                <span>: {p.name}</span>
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-slideInRight">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">דשבורד ראשי</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">סקירה כללית על סטטוס המערכת והתהליכים הפעילים</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
            <Activity size={16} className="text-indigo-500"/>
            <span>עודכן לאחרונה: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeStats.map((stat) => (
          <div 
            key={stat.id} 
            onClick={() => navigate(stat.path)}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all relative overflow-hidden group cursor-pointer hover:-translate-y-1"
          >
            {/* Background decoration */}
            <div 
                className="absolute -left-6 -top-6 w-32 h-32 rounded-full opacity-[0.08] transition-transform group-hover:scale-110" 
                style={{backgroundColor: stat.color}}
            ></div>
            
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">{stat.name} פעילים</p>
                    <h3 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.text}`}>
                    <stat.icon size={24} />
                </div>
            </div>

            <div className="mt-6 relative z-10">
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-2 font-medium">
                    <span>סה״כ במערכת: {stat.total}</span>
                    <span>{stat.total > 0 ? Math.round((stat.value / stat.total) * 100) : 0}% פעילות</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${stat.bar}`}
                        style={{ width: `${stat.total > 0 ? (stat.value / stat.total) * 100 : 0}%` }}
                    />
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart - Takes up 2 columns */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-500" />
                מבט על - פעיל מול סה״כ
             </h3>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeStats} barGap={8} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12}} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12}}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                    <Bar dataKey="total" name="סה״כ במערכת" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={32} />
                    <Bar dataKey="value" name="פעילים כעת" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32}>
                        {activeStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
           <div className="mb-6">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white">התפלגות סוגי ישויות</h3>
             <p className="text-sm text-slate-400">יחס כמותי בין הרכיבים הפעילים</p>
           </div>
           <div className="flex-1 w-full min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    cornerRadius={6}
                    startAngle={90}
                    endAngle={-270}
                >
                    {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={activeStats[index].color} strokeWidth={0} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-800 dark:text-white">
                    {activeStats.reduce((acc, curr) => acc + curr.value, 0)}
                </span>
                <p className="text-xs text-slate-400 font-medium">סה״כ פעילים</p>
            </div>
           </div>
           
           {/* Custom Legend for Pie */}
           <div className="flex justify-center flex-wrap gap-4 mt-4">
                {activeStats.map((stat) => (
                    <div key={stat.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: stat.color}}></div>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{stat.name}</span>
                    </div>
                ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
