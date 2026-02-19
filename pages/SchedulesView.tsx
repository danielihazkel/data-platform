import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Save, X, Calendar, Clock, Share2, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { apiService } from '../services/api';
import { DistributionSchedulerSchedule, DistributionSchedulerGroup, DistributionCollectorQuery, DistributionDistributerDistribution } from '../types';
import SplitView from '../components/ui/SplitView';
import { StatusBadge } from '../components/ui/Badge';

const SchedulesView: React.FC = () => {
  const [schedules, setSchedules] = useState<DistributionSchedulerSchedule[]>([]);
  const [groups, setGroups] = useState<DistributionSchedulerGroup[]>([]);
  const [queries, setQueries] = useState<DistributionCollectorQuery[]>([]);
  
  // Dependency Data
  const [distributions, setDistributions] = useState<DistributionDistributerDistribution[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedSchedule, setSelectedSchedule] = useState<Partial<DistributionSchedulerSchedule> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'usage'>('general');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [schedData, groupData, queryData, distData] = await Promise.all([
      apiService.getSchedules(),
      apiService.getGroups(),
      apiService.getQueries(),
      apiService.getDistributions()
    ]);
    setSchedules(schedData);
    setGroups(groupData);
    setQueries(queryData);
    setDistributions(distData);
  };

  const filteredSchedules = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return schedules.filter(s => 
      s.name.toLowerCase().includes(term) || 
      s.id.toLowerCase().includes(term) ||
      s.group?.name.toLowerCase().includes(term)
    );
  }, [schedules, searchTerm]);

  const getUsageStats = (scheduleId: string) => {
    const relDistributions = distributions.filter(d => d.scheduleId === scheduleId);
    return { relDistributions };
  };

  const handleNew = () => {
    setSelectedSchedule({
      id: '',
      name: '',
      queryId: '',
      parameters: '',
      cron: '0 0 12 * * ?',
      isActive: 1,
      nextRun: new Date(new Date().setHours(8,0,0,0) + 86400000).toISOString().slice(0, 16)
    });
    setIsEditing(true);
    setActiveTab('general');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    if (!selectedSchedule.id || !selectedSchedule.name || !selectedSchedule.queryId || !selectedSchedule.group) {
        alert("נא למלא שדות חובה");
        return;
    }

    try {
      const payload = { ...selectedSchedule } as DistributionSchedulerSchedule;
      if (payload.nextRun) {
        payload.nextRun = new Date(payload.nextRun).toISOString();
      }

      await apiService.saveSchedule(payload);
      await loadData();
      setIsEditing(false);
      setSelectedSchedule(null);
    } catch (err) {
      console.error(err);
      alert("שגיאה בשמירה");
    }
  };

  const formatDateForInput = (isoString?: string) => {
      if (!isoString) return '';
      try {
        return new Date(isoString).toISOString().slice(0, 16);
      } catch (e) {
          return '';
      }
  };

  const renderUsageTab = () => {
      if (!selectedSchedule?.id) return <div className="text-center text-slate-400 p-8">יש לשמור את התזמון לפני צפייה בשימושים</div>;

      const { relDistributions } = getUsageStats(selectedSchedule.id);

      return (
          <div className="space-y-6 animate-fadeIn">
              <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Share2 size={16} className="text-amber-500" />
                      הפצות מקושרות ({relDistributions.length})
                  </h3>
                   {relDistributions.length > 0 ? (
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                          {relDistributions.map(d => (
                              <div key={d.id} className="p-3 border-b border-slate-100 dark:border-slate-700 last:border-0 flex justify-between items-center text-sm">
                                  <div className="flex flex-col">
                                      <span className="font-medium text-slate-700 dark:text-slate-200">{d.distributionType?.name}</span>
                                      <span className="text-xs text-slate-400 font-mono">מזהה: {d.id}</span>
                                  </div>
                                  <StatusBadge isActive={d.isActive} />
                              </div>
                          ))}
                      </div>
                  ) : (
                      <p className="text-sm text-slate-400 italic">אין הפצות המשתמשות בתזמון זה</p>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-200">
        <div className="relative w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="חיפוש לפי שם, קבוצה..."
            className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#664FE1] focus:border-transparent text-slate-800 dark:text-slate-100 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleNew}
          className="bg-[#664FE1] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <Plus size={18} />
          תזמון חדש
        </button>
      </div>

      <SplitView
        showDetail={isEditing}
        onCloseDetail={() => setIsEditing(false)}
        list={
          <div className="overflow-auto flex-1">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">מזהה</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">שם</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">קבוצה</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">שימושים</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredSchedules.map((item) => {
                    const stats = getUsageStats(item.id);
                    return (
                        <tr 
                            key={item.id} 
                            onClick={() => {
                                setSelectedSchedule({
                                    ...item,
                                    nextRun: formatDateForInput(item.nextRun)
                                });
                                setIsEditing(true);
                                setActiveTab('general');
                            }}
                            className={`cursor-pointer transition-colors ${selectedSchedule?.id === item.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                        >
                            <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{item.id}</td>
                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.group?.name || '-'}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                {stats.relDistributions.length > 0 ? (
                                   <span title={`${stats.relDistributions.length} הפצות`} className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                                      <Share2 size={12} /> {stats.relDistributions.length}
                                   </span>
                                ) : (
                                    <span className="text-slate-400 text-xs">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                            <StatusBadge isActive={item.isActive} />
                            </td>
                        </tr>
                    )
                })}
                {filteredSchedules.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400">לא נמצאו תוצאות</td></tr>
                )}
              </tbody>
            </table>
          </div>
        }
        detail={
          selectedSchedule && (
            <div className="flex flex-col h-full">
              <div className="p-6 pb-0 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    {selectedSchedule.createTs ? 'עריכת תזמון' : 'תזמון חדש'}
                    </h2>
                    <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={20} />
                    </button>
                </div>
                
                 {/* Tabs */}
                 <div className="flex gap-6">
                    <button 
                        onClick={() => setActiveTab('general')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'general' ? 'text-[#664FE1] dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        פרטים כלליים
                        {activeTab === 'general' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#664FE1] dark:bg-indigo-400 rounded-t-full"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('usage')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'usage' ? 'text-[#664FE1] dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        שימושים ותלויות
                        {activeTab === 'usage' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#664FE1] dark:bg-indigo-400 rounded-t-full"></div>}
                    </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'general' ? (
                     <form id="sched-form" onSubmit={handleSave} className="space-y-6 animate-fadeIn">
                        <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">מזהה</label>
                            <input
                                required
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 disabled:opacity-50"
                                value={selectedSchedule.id || ''}
                                onChange={e => setSelectedSchedule({...selectedSchedule, id: e.target.value})}
                                disabled={!!selectedSchedule.createTs}
                            />
                            </div>
                            <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">שם</label>
                            <input
                                required
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                value={selectedSchedule.name || ''}
                                onChange={e => setSelectedSchedule({...selectedSchedule, name: e.target.value})}
                            />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">קבוצה</label>
                            <select
                                required
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                value={selectedSchedule.group?.id || ''}
                                onChange={e => {
                                    const grp = groups.find(g => g.id === e.target.value);
                                    setSelectedSchedule({...selectedSchedule, group: grp});
                                }}
                            >
                                <option value="">בחר קבוצה...</option>
                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                            </div>
                            <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">מזהה שאילתה</label>
                            <select
                                required
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                value={selectedSchedule.queryId || ''}
                                onChange={e => setSelectedSchedule({...selectedSchedule, queryId: e.target.value})}
                            >
                                <option value="">בחר שאילתה...</option>
                                {queries.map(q => <option key={q.id} value={q.id}>{q.id} - {q.name}</option>)}
                            </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">פרמטרים</label>
                            <input
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                            value={selectedSchedule.parameters || ''}
                            onChange={e => setSelectedSchedule({...selectedSchedule, parameters: e.target.value})}
                            />
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-3 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-[#664FE1] dark:text-indigo-400 mb-2">
                                <Clock size={16} />
                                <span className="font-semibold text-sm">הגדרות זמן</span>
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cron Expression</label>
                                <input
                                    required
                                    dir="ltr"
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                                    value={selectedSchedule.cron || ''}
                                    onChange={e => setSelectedSchedule({...selectedSchedule, cron: e.target.value})}
                                    placeholder="* * * * *"
                                />
                                <p className="text-[10px] text-slate-400">Sec Min Hour Day Month DayOfWeek</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">ריצה הבאה</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                                    value={selectedSchedule.nextRun || ''}
                                    onChange={e => setSelectedSchedule({...selectedSchedule, nextRun: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">סטטוס</label>
                            <select
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                            value={selectedSchedule.isActive}
                            onChange={e => setSelectedSchedule({...selectedSchedule, isActive: parseInt(e.target.value)})}
                            >
                            <option value={1}>פעיל</option>
                            <option value={0}>לא פעיל</option>
                            </select>
                        </div>
                        </div>
                     </form>
                ) : (
                    renderUsageTab()
                )}
              </div>

              {activeTab === 'general' && (
                <div className="pt-4 p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-white dark:bg-slate-800">
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        ביטול
                    </button>
                    <button
                        type="submit"
                        form="sched-form"
                        className="bg-[#664FE1] hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                    >
                        <Save size={18} />
                        שמירה
                    </button>
                </div>
              )}
               {activeTab === 'usage' && (
                  <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end bg-white dark:bg-slate-800">
                     <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                        סגור
                    </button>
                  </div>
              )}
            </div>
          )
        }
      />
    </div>
  );
};

export default SchedulesView;
