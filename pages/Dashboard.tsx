import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { apiService } from '../services/api';
import { DistributionCollectorQuery, DistributionSchedulerSchedule, DistributionDistributerDistribution } from '../types';
import { Loader2, Database, CalendarClock, Share2, TrendingUp, Activity, ArrowUpRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const distributionTypeHealth = useMemo(() => {
    const typeColors: Record<string, string> = { Email: '#6366f1', SFTP: '#10b981', Kafka: '#f59e0b' };
    const groups: Record<string, { total: number; active: number }> = {};
    stats.distributions.forEach(d => {
      const name = d.distributionType?.name ?? 'Unknown';
      if (!groups[name]) groups[name] = { total: 0, active: 0 };
      groups[name].total++;
      if (d.isActive === 1) groups[name].active++;
    });
    return Object.entries(groups).map(([name, { total, active }]) => ({
      name,
      total,
      active,
      percent: total > 0 ? Math.round((active / total) * 100) : 0,
      color: typeColors[name] ?? '#94a3b8',
    }));
  }, [stats.distributions]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="text-slate-500 animate-pulse font-medium">טוען נתונים...</p>
      </div>
    );
  }

  const activeStats = [
    { 
        id: 'queries',
        name: 'שאילתות', 
        value: stats.queries.filter(x => x.isActive === 1).length, 
        total: stats.queries.length,
        icon: Database,
        color: '#6366f1', 
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
        color: '#10b981', 
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
        color: '#f59e0b', 
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
        bar: 'bg-amber-500',
        path: '/distributions'
    },
  ];

  const pieData = activeStats.map(s => ({ name: s.name, value: s.value }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 shadow-xl rounded-xl text-right z-50">
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

  interface HealthRingProps {
    percent: number;
    color: string;
    label: string;
    active: number;
    total: number;
    size?: number;
    strokeWidth?: number;
  }

  const HealthRing: React.FC<HealthRingProps> = ({ percent, color, label, active, total, size = 52, strokeWidth = 5 }) => {
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    const cx = size / 2;
    const cy = size / 2;

    return (
      <div className="flex items-center gap-3">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size}>
            <circle
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-100 dark:text-slate-700"
            />
            <motion.circle
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] font-bold text-slate-700 dark:text-slate-200">{percent}%</span>
          </div>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
          <span className="text-xs text-slate-400">{active}/{total} פעיל</span>
        </div>
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6 pb-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">שלום, ברוכים הבאים</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">סקירה כללית על סטטוס המערכת והתהליכים הפעילים</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium">מערכת פעילה</span>
            </div>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400"/>
                <span>{new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-auto gap-6">
        
        {/* Main Chart - Large (2x2) */}
        <motion.div 
          variants={itemVariants}
          className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <TrendingUp size={120} />
          </div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
             <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <TrendingUp size={22} className="text-indigo-500" />
                    ביצועי מערכת
                </h3>
                <p className="text-sm text-slate-400 mt-1">השוואה בין רכיבים פעילים לסך הכל במערכת</p>
             </div>
             <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                <ArrowUpRight size={20} className="text-slate-400" />
             </button>
          </div>

          <div className="flex-1 w-full min-h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeStats} barGap={12} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} 
                        dy={15}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12}}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(99, 102, 241, 0.04)', radius: 8}} />
                    <Bar dataKey="total" name="סה״כ" fill="#e2e8f0" radius={[8, 8, 8, 8]} barSize={32} />
                    <Bar dataKey="value" name="פעילים" fill="#6366f1" radius={[8, 8, 8, 8]} barSize={32}>
                        {activeStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Stats - Small Cards */}
        {activeStats.map((stat, idx) => (
          <motion.div 
            key={stat.id}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            onClick={() => navigate(stat.path)}
            className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer group relative overflow-hidden"
          >
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity`} style={{ backgroundColor: stat.color }} />
            
            <div className="flex justify-between items-center mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.text}`}>
                    <stat.icon size={22} />
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={12} />
                    <span>+12%</span>
                </div>
            </div>
            
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.name}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
                    <span className="text-slate-400 text-sm font-normal">/ {stat.total}</span>
                </div>
            </div>

            <div className="mt-4">
                <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.total > 0 ? (stat.value / stat.total) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${stat.bar}`}
                    />
                </div>
            </div>
          </motion.div>
        ))}

        {/* Distribution Health Rings */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" />
              בריאות הפצות
            </h3>
            <p className="text-xs text-slate-400">סטטוס פעיל לפי סוג</p>
          </div>
          <div className="flex flex-col gap-4 flex-1 justify-center">
            {distributionTypeHealth.length > 0 ? (
              distributionTypeHealth.map(d => (
                <HealthRing
                  key={d.name}
                  label={d.name}
                  percent={d.percent}
                  color={d.color}
                  active={d.active}
                  total={d.total}
                />
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center">אין נתוני הפצה</p>
            )}
          </div>
        </motion.div>

        {/* Pie Distribution - Medium (1x1) */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">התפלגות</h3>
            <p className="text-xs text-slate-400">יחס רכיבים פעילים</p>
          </div>
          <div className="flex-1 min-h-[160px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={pieData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={8}
                        dataKey="value"
                        cornerRadius={10}
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
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-xl font-bold text-slate-800 dark:text-white">
                    {activeStats.reduce((acc, curr) => acc + curr.value, 0)}
                </span>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;