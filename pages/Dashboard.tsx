import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { apiService } from '../services/api';
import { DistributionCollectorQuery, DistributionSchedulerSchedule, DistributionDistributerDistribution } from '../types';
import { Loader2 } from 'lucide-react';

const COLORS = ['#664FE1', '#10B981', '#EF4444', '#F59E0B'];

const Dashboard: React.FC = () => {
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
    { name: 'שאילתות', value: stats.queries.filter(x => x.isActive === 1).length, total: stats.queries.length },
    { name: 'תזמונים', value: stats.schedules.filter(x => x.isActive === 1).length, total: stats.schedules.length },
    { name: 'הפצות', value: stats.distributions.filter(x => x.isActive === 1).length, total: stats.distributions.length },
  ];

  const pieData = activeStats.map(s => ({ name: s.name, value: s.value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeStats.map((stat, idx) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-medium text-sm mb-1">{stat.name} פעילים</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800">{stat.value}</span>
              <span className="text-sm text-slate-400">מתוך {stat.total}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
              <div 
                className="bg-[#664FE1] h-1.5 rounded-full" 
                style={{ width: `${(stat.value / stat.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
          <h3 className="text-lg font-bold text-slate-800 mb-6">התפלגות פעילות</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
          <h3 className="text-lg font-bold text-slate-800 mb-6">מבט על</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeStats}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="total" name="סה״כ" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="value" name="פעילים" fill="#664FE1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
