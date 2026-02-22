import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Save, X, Trash2, Share2, Database, CalendarClock, ArrowRight, LayoutGrid, List, Layers, Server } from 'lucide-react';
import { apiService } from '../services/api';
import { DistributionDistributerDistribution, DistributionDistributerType, DistributionSchedulerSchedule, DistributionCollectorQuery } from '../types';
import SplitView from '../components/ui/SplitView';
import { StatusBadge } from '../components/ui/Badge';
import { motion } from 'framer-motion';

const DistributionsView: React.FC = () => {
  const [distributions, setDistributions] = useState<DistributionDistributerDistribution[]>([]);
  const [types, setTypes] = useState<DistributionDistributerType[]>([]);
  const [schedules, setSchedules] = useState<DistributionSchedulerSchedule[]>([]);
  // Dependency Data
  const [queries, setQueries] = useState<DistributionCollectorQuery[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'lineage'>('table');
  
  const [selectedDist, setSelectedDist] = useState<Partial<DistributionDistributerDistribution> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'context'>('general');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [dData, tData, sData, qData] = await Promise.all([
      apiService.getDistributions(),
      apiService.getDistributionTypes(),
      apiService.getSchedules(),
      apiService.getQueries()
    ]);
    setDistributions(dData);
    setTypes(tData);
    setSchedules(sData);
    setQueries(qData);
  };

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return distributions.filter(d => 
      d.id.toLowerCase().includes(term) ||
      d.scheduleId.toLowerCase().includes(term) ||
      d.distributionType?.name.toLowerCase().includes(term)
    );
  }, [distributions, searchTerm]);

  const getContext = (distScheduleId?: string) => {
      if (!distScheduleId) return { schedule: null, query: null };
      const schedule = schedules.find(s => s.id === distScheduleId);
      const query = schedule ? queries.find(q => q.id === schedule.queryId) : null;
      return { schedule, query };
  };

  const handleNew = () => {
    setSelectedDist({
      id: '',
      scheduleId: '',
      parameters: '',
      isActive: 1
    });
    setIsEditing(true);
    setActiveTab('general');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDist?.id || !selectedDist?.distributionType || !selectedDist?.scheduleId) {
        alert("נא למלא שדות חובה");
        return;
    }
    try {
        await apiService.saveDistribution(selectedDist as DistributionDistributerDistribution);
        await loadData();
        setIsEditing(false);
        setSelectedDist(null);
    } catch (e) {
        alert("שגיאה בשמירה");
    }
  };

  const handleDeactivate = async () => {
      if(!selectedDist?.id) return;
      if (confirm("האם אתה בטוח שברצונך להשבית הפצה זו?")) {
        await apiService.deactivateDistribution(selectedDist.id);
        await loadData();
        setSelectedDist({...selectedDist, isActive: 0});
      }
  };

  const LineageMap = () => {
    return (
        <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900/50 space-y-8">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">מפת שרשרת הפצה</h3>
                <p className="text-xs text-slate-400">מעקב ויזואלי אחר זרימת הנתונים מהמקור ועד ליעד</p>
            </div>

            <div className="space-y-12">
                {filtered.map((dist, idx) => {
                    const { schedule, query } = getContext(dist.scheduleId);
                    const system = query?.system;

                    return (
                        <motion.div 
                            key={dist.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative"
                        >
                            {/* Lineage Track */}
                            <div className="flex items-center gap-4 md:gap-8">
                                
                                {/* Node: System */}
                                <div className="flex flex-col items-center gap-2 w-32 shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 shadow-sm">
                                        <Server size={20} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">מערכת</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate w-32">{system?.name || 'לא ידוע'}</p>
                                    </div>
                                </div>

                                <ArrowRight className="text-slate-300 dark:text-slate-600 shrink-0" size={16} />

                                {/* Node: Query */}
                                <div className="flex flex-col items-center gap-2 w-32 shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-500 shadow-sm">
                                        <Database size={20} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase">שאילתה</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate w-32">{query?.name || 'לא ידוע'}</p>
                                    </div>
                                </div>

                                <ArrowRight className="text-slate-300 dark:text-slate-600 shrink-0" size={16} />

                                {/* Node: Schedule */}
                                <div className="flex flex-col items-center gap-2 w-32 shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-500 shadow-sm">
                                        <CalendarClock size={20} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase">תזמון</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate w-32">{schedule?.name || 'לא ידוע'}</p>
                                    </div>
                                </div>

                                <ArrowRight className="text-slate-300 dark:text-slate-600 shrink-0" size={16} />

                                {/* Node: Distribution (Target) */}
                                <div 
                                    onClick={() => {
                                        setSelectedDist({...dist});
                                        setIsEditing(true);
                                        setActiveTab('general');
                                    }}
                                    className={`flex flex-col items-center gap-2 w-48 shrink-0 cursor-pointer group`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center shadow-lg transition-all group-hover:scale-110 ${dist.isActive ? 'bg-amber-500 border-amber-400 text-white' : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500'}`}>
                                        <Share2 size={20} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-amber-500 uppercase">הפצה: {dist.id}</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{dist.distributionType?.name}</p>
                                        <div className="mt-1">
                                            <StatusBadge isActive={dist.isActive} />
                                        </div>
                                    </div>
                                </div>

                            </div>
                            
                            {/* Background Track Line */}
                            <div className="absolute top-6 left-6 right-24 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
                        </motion.div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="text-center py-20 text-slate-400 italic">לא נמצאו הפצות להצגה במפה</div>
                )}
            </div>
        </div>
    );
  };

  const renderContextTab = () => {
      const { schedule, query } = getContext(selectedDist?.scheduleId);

      if (!schedule) return <div className="text-center text-slate-400 p-8">לא נמצא תזמון משוייך</div>;

      return (
          <div className="space-y-8 animate-fadeIn">
              
              {/* Timeline / Chain Visual */}
              <div className="flex flex-col items-center gap-2 text-slate-400 text-sm mb-6">
                  <div className="flex items-center gap-3 w-full p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900">
                      <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full text-indigo-600 dark:text-indigo-300"><Database size={16}/></div>
                      <div className="flex-1">
                          <span className="text-xs text-indigo-400 block uppercase tracking-wider font-bold">שאילתה</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{query?.name || 'לא ידוע'}</span>
                      </div>
                  </div>
                  
                  <ArrowRight className="rotate-90 text-slate-300 dark:text-slate-600" size={20} />

                  <div className="flex items-center gap-3 w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900">
                      <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-full text-emerald-600 dark:text-emerald-300"><CalendarClock size={16}/></div>
                      <div className="flex-1">
                          <span className="text-xs text-emerald-500 block uppercase tracking-wider font-bold">תזמון</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{schedule.name}</span>
                      </div>
                  </div>

                  <ArrowRight className="rotate-90 text-slate-300 dark:text-slate-600" size={20} />

                  <div className="flex items-center gap-3 w-full p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900">
                      <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full text-amber-600 dark:text-amber-300"><Share2 size={16}/></div>
                      <div className="flex-1">
                          <span className="text-xs text-amber-500 block uppercase tracking-wider font-bold">הפצה נוכחית</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDist?.distributionType?.name}</span>
                      </div>
                  </div>
              </div>

              {/* Detail Cards */}
              <div className="grid gap-4">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                      <h4 className="font-bold text-slate-800 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">פרטי תזמון המקור</h4>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">מזהה:</span> <span className="font-mono text-slate-700 dark:text-slate-200">{schedule.id}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Cron:</span> <span className="font-mono bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1 rounded">{schedule.cron}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">קבוצה:</span> <span className="text-slate-700 dark:text-slate-200">{schedule.group?.name}</span></div>
                      </div>
                  </div>

                   {query && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">פרטי שאילתת המקור</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">מזהה:</span> <span className="font-mono text-slate-700 dark:text-slate-200">{query.id}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">מקור מידע:</span> <span className="text-slate-700 dark:text-slate-200">{query.dataSource}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">מערכת:</span> <span className="text-slate-700 dark:text-slate-200">{query.system?.name}</span></div>
                        </div>
                    </div>
                   )}
              </div>
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-200">
        <div className="flex items-center gap-4">
            <div className="relative w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
                type="text"
                placeholder="חיפוש לפי מזהה, סוג..."
                className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#664FE1] focus:border-transparent text-slate-800 dark:text-slate-100 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button 
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-500' : 'text-slate-400 hover:text-slate-600'}`}
                    title="תצוגת טבלה"
                >
                    <List size={18} />
                </button>
                <button 
                    onClick={() => setViewMode('lineage')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'lineage' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-500' : 'text-slate-400 hover:text-slate-600'}`}
                    title="תצוגת שרשרת הפצה"
                >
                    <Layers size={18} />
                </button>
            </div>
        </div>

        <button 
          onClick={handleNew}
          className="bg-[#664FE1] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <Plus size={18} />
          הפצה חדשה
        </button>
      </div>

      <SplitView
        showDetail={isEditing}
        onCloseDetail={() => setIsEditing(false)}
        list={
          viewMode === 'table' ? (
            <div className="overflow-auto flex-1">
                <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                    <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">מזהה</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">סוג</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">תזמון משוייך</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">סטטוס</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filtered.map((item) => (
                    <tr 
                        key={item.id} 
                        onClick={() => { 
                            setSelectedDist({...item}); 
                            setIsEditing(true); 
                            setActiveTab('general');
                        }}
                        className={`cursor-pointer transition-colors ${selectedDist?.id === item.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                    >
                        <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{item.id}</td>
                        <td className="px-6 py-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <Share2 size={14} className="text-slate-400"/>
                            {item.distributionType?.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{item.scheduleId}</td>
                        <td className="px-6 py-4">
                        <StatusBadge isActive={item.isActive} />
                        </td>
                    </tr>
                    ))}
                    {filtered.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-12 text-slate-400">לא נמצאו תוצאות</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          ) : (
            <LineageMap />
          )
        }
        detail={
          selectedDist && (
            <div className="flex flex-col h-full">
              <div className="p-6 pb-0 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    {selectedDist.createTs ? 'עריכת הפצה' : 'הפצה חדשה'}
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
                        onClick={() => setActiveTab('context')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'context' ? 'text-[#664FE1] dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        מקור מידע
                        {activeTab === 'context' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#664FE1] dark:bg-indigo-400 rounded-t-full"></div>}
                    </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'general' ? (
                     <form id="dist-form" onSubmit={handleSave} className="space-y-6 animate-fadeIn">
                        <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">מזהה</label>
                            <input
                                required
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 disabled:opacity-50"
                                value={selectedDist.id || ''}
                                onChange={e => setSelectedDist({...selectedDist, id: e.target.value})}
                                disabled={!!selectedDist.createTs}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">סוג הפצה</label>
                            <select
                                required
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                value={selectedDist.distributionType?.id || ''}
                                onChange={e => {
                                    const type = types.find(t => t.id === e.target.value);
                                    setSelectedDist({...selectedDist, distributionType: type});
                                }}
                            >
                                <option value="">בחר סוג...</option>
                                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            </div>
                            <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">תזמון</label>
                            <select
                                required
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                value={selectedDist.scheduleId || ''}
                                onChange={e => setSelectedDist({...selectedDist, scheduleId: e.target.value})}
                            >
                                <option value="">בחר תזמון...</option>
                                {schedules.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">פרמטרים (JSON)</label>
                            <textarea
                            required
                            dir="ltr"
                            rows={6}
                            className="w-full p-2 font-mono text-sm border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                            value={selectedDist.parameters || ''}
                            onChange={e => setSelectedDist({...selectedDist, parameters: e.target.value})}
                            placeholder='{"key": "value"}'
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">סטטוס</label>
                            <select
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                            value={selectedDist.isActive}
                            onChange={e => setSelectedDist({...selectedDist, isActive: parseInt(e.target.value)})}
                            >
                            <option value={1}>פעיל</option>
                            <option value={0}>לא פעיל</option>
                            </select>
                        </div>
                        </div>
                     </form>
                ) : (
                    renderContextTab()
                )}
              </div>

               {activeTab === 'general' ? (
                  <div className="pt-4 p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-white dark:bg-slate-800 sticky bottom-0">
                    {selectedDist.isActive === 1 && selectedDist.createTs && (
                        <button
                            type="button"
                            onClick={handleDeactivate}
                            className="px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center gap-2 mr-auto"
                        >
                            <Trash2 size={16}/>
                            השבת
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        ביטול
                    </button>
                    <button
                        type="submit"
                        form="dist-form"
                        className="bg-[#664FE1] hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                    >
                        <Save size={18} />
                        שמירה
                    </button>
                </div>
               ) : (
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

export default DistributionsView;
