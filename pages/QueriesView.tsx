import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Save, X, Database, Play, AlertCircle, CheckCircle, Loader2, CalendarClock, Share2, Layers } from 'lucide-react';
import { apiService } from '../services/api';
import { DistributionCollectorQuery, DistributionCollectorSystem, QueryTestResult, DistributionSchedulerSchedule, DistributionDistributerDistribution } from '../types';
import SplitView from '../components/ui/SplitView';
import { StatusBadge } from '../components/ui/Badge';

const QueriesView: React.FC = () => {
  const [queries, setQueries] = useState<DistributionCollectorQuery[]>([]);
  const [systems, setSystems] = useState<DistributionCollectorSystem[]>([]);
  const [databases, setDatabases] = useState<string[]>([]);
  
  // Dependency Data
  const [schedules, setSchedules] = useState<DistributionSchedulerSchedule[]>([]);
  const [distributions, setDistributions] = useState<DistributionDistributerDistribution[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedQuery, setSelectedQuery] = useState<Partial<DistributionCollectorQuery> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'usage'>('general');

  // Testing State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<QueryTestResult | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [qData, sData, dbData, schedData, distData] = await Promise.all([
      apiService.getQueries(),
      apiService.getSystems(),
      apiService.getAvailableDatabases(),
      apiService.getSchedules(),
      apiService.getDistributions()
    ]);
    setQueries(qData);
    setSystems(sData);
    setDatabases(dbData);
    setSchedules(schedData);
    setDistributions(distData);
  };

  const filteredQueries = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return queries.filter(q => 
      q.name.toLowerCase().includes(term) || 
      q.id.toLowerCase().includes(term) ||
      q.system?.name.toLowerCase().includes(term)
    );
  }, [queries, searchTerm]);

  const getUsageStats = (queryId: string) => {
    const relSchedules = schedules.filter(s => s.queryId === queryId);
    const relSchedIds = relSchedules.map(s => s.id);
    const relDistributions = distributions.filter(d => relSchedIds.includes(d.scheduleId));
    return { relSchedules, relDistributions };
  };

  const handleSelect = (query: DistributionCollectorQuery) => {
    setSelectedQuery({ ...query });
    setIsEditing(true);
    setActiveTab('general');
    setTestResult(null); 
  };

  const handleNew = () => {
    setSelectedQuery({
      id: '',
      name: '',
      description: '',
      dataQuery: '',
      dataSource: '',
      dataColumns: '',
      maxResults: 1000,
      isActive: 1,
      systemId: ''
    });
    setIsEditing(true);
    setActiveTab('general');
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!selectedQuery?.dataSource || !selectedQuery?.dataQuery) {
        alert("נא למלא מקור מידע ושאילתה לביצוע בדיקה");
        return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    setShowTestModal(true);

    try {
        const result = await apiService.testQuery(selectedQuery);
        setTestResult(result);
    } catch (e) {
        setTestResult({ success: false, error: 'שגיאה בביצוע הבדיקה מול השרת' });
    } finally {
        setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery) return;
    
    if (!selectedQuery.id || !selectedQuery.name || !selectedQuery.systemId) {
      alert("נא למלא שדות חובה");
      return;
    }

    try {
      const system = systems.find(s => s.id === selectedQuery.systemId);
      const payload = { ...selectedQuery, system } as DistributionCollectorQuery;
      
      await apiService.saveQuery(payload);
      
      await loadData();
      setIsEditing(false);
      setSelectedQuery(null);
    } catch (err) {
      console.error(err);
      alert("שגיאה בשמירה");
    }
  };

  // Render Helpers
  const renderUsageTab = () => {
      if (!selectedQuery?.id) return <div className="text-center text-slate-400 p-8">יש לשמור את השאילתה לפני צפייה בשימושים</div>;

      const { relSchedules, relDistributions } = getUsageStats(selectedQuery.id);

      return (
          <div className="space-y-6 animate-fadeIn">
              {/* Schedules Section */}
              <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <CalendarClock size={16} className="text-emerald-500" />
                      תזמונים משוייכים ({relSchedules.length})
                  </h3>
                  {relSchedules.length > 0 ? (
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                          {relSchedules.map(s => (
                              <div key={s.id} className="p-3 border-b border-slate-100 dark:border-slate-700 last:border-0 flex justify-between items-center text-sm">
                                  <div className="flex flex-col">
                                      <span className="font-medium text-slate-700 dark:text-slate-200">{s.name}</span>
                                      <span className="text-xs text-slate-400 font-mono">{s.id}</span>
                                  </div>
                                  <StatusBadge isActive={s.isActive} />
                              </div>
                          ))}
                      </div>
                  ) : (
                      <p className="text-sm text-slate-400 italic">אין תזמונים המשתמשים בשאילתה זו</p>
                  )}
              </div>

              {/* Distributions Section */}
              <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Share2 size={16} className="text-amber-500" />
                      הפצות מושפעות ({relDistributions.length})
                  </h3>
                   {relDistributions.length > 0 ? (
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                          {relDistributions.map(d => (
                              <div key={d.id} className="p-3 border-b border-slate-100 dark:border-slate-700 last:border-0 flex justify-between items-center text-sm">
                                  <div className="flex flex-col">
                                      <span className="font-medium text-slate-700 dark:text-slate-200">{d.distributionType?.name}</span>
                                      <span className="text-xs text-slate-400 font-mono">דרך תזמון: {d.scheduleId}</span>
                                  </div>
                                  <StatusBadge isActive={d.isActive} />
                              </div>
                          ))}
                      </div>
                  ) : (
                      <p className="text-sm text-slate-400 italic">אין הפצות המקושרות לתזמונים של שאילתה זו</p>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col space-y-4 relative">
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-200">
        <div className="relative w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="חיפוש לפי שם, מזהה או מערכת..."
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
          שאילתה חדשה
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
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">מערכת</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">שימושים</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredQueries.map((item) => {
                  const stats = getUsageStats(item.id);
                  return (
                    <tr 
                        key={item.id} 
                        onClick={() => handleSelect(item)}
                        className={`cursor-pointer transition-colors ${
                            selectedQuery?.id === item.id 
                            ? 'bg-indigo-50 dark:bg-indigo-900/30' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{item.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <Database size={14} className="text-slate-400"/>
                            {item.system?.name || '-'}
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex gap-2">
                               {stats.relSchedules.length > 0 && (
                                   <span title={`${stats.relSchedules.length} תזמונים`} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium flex items-center gap-1">
                                      <CalendarClock size={12} /> {stats.relSchedules.length}
                                   </span>
                               )}
                               {stats.relDistributions.length > 0 && (
                                   <span title={`${stats.relDistributions.length} הפצות`} className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium flex items-center gap-1">
                                      <Share2 size={12} /> {stats.relDistributions.length}
                                   </span>
                               )}
                               {stats.relSchedules.length === 0 && stats.relDistributions.length === 0 && (
                                   <span className="text-slate-400 text-xs">-</span>
                               )}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                        <StatusBadge isActive={item.isActive} />
                        </td>
                    </tr>
                  );
                })}
                {filteredQueries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      לא נמצאו תוצאות
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        }
        detail={
          selectedQuery && (
            <div className="flex flex-col h-full">
              <div className="p-6 pb-0 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    {selectedQuery.createTs ? 'עריכת שאילתה' : 'יצירת שאילתה'}
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
                     <form id="query-form" onSubmit={handleSave} className="space-y-6 animate-fadeIn">
                        <div className="space-y-4">
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">מזהה</label>
                            <input
                                required
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 disabled:opacity-50"
                                value={selectedQuery.id || ''}
                                onChange={e => setSelectedQuery({...selectedQuery, id: e.target.value})}
                                disabled={!!selectedQuery.createTs}
                            />
                            </div>
                            <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">שם</label>
                            <input
                                required
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                value={selectedQuery.name || ''}
                                onChange={e => setSelectedQuery({...selectedQuery, name: e.target.value})}
                            />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">תיאור</label>
                            <textarea
                            rows={2}
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                            value={selectedQuery.description || ''}
                            onChange={e => setSelectedQuery({...selectedQuery, description: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">מערכת</label>
                            <select
                                required
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                value={selectedQuery.systemId || ''}
                                onChange={e => setSelectedQuery({...selectedQuery, systemId: e.target.value})}
                            >
                                <option value="">בחר מערכת...</option>
                                {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            </div>
                            <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">מקור מידע</label>
                            <select
                                required
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                value={selectedQuery.dataSource || ''}
                                onChange={e => setSelectedQuery({...selectedQuery, dataSource: e.target.value})}
                            >
                                <option value="">בחר DB...</option>
                                {databases.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">שאילתת SQL</label>
                            <textarea
                            required
                            dir="ltr"
                            rows={5}
                            className="w-full p-2 font-mono text-sm border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                            value={selectedQuery.dataQuery || ''}
                            onChange={e => setSelectedQuery({...selectedQuery, dataQuery: e.target.value})}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">עמודות (מופרד בפסיקים)</label>
                            <input
                                dir="ltr"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                value={selectedQuery.dataColumns || ''}
                                onChange={e => setSelectedQuery({...selectedQuery, dataColumns: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">מקסימום תוצאות</label>
                                <input
                                type="number"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                value={selectedQuery.maxResults || 0}
                                onChange={e => setSelectedQuery({...selectedQuery, maxResults: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">סטטוס</label>
                                <select
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                value={selectedQuery.isActive}
                                onChange={e => setSelectedQuery({...selectedQuery, isActive: parseInt(e.target.value)})}
                                >
                                <option value={1}>פעיל</option>
                                <option value={0}>לא פעיל</option>
                                </select>
                            </div>
                        </div>

                        </div>
                     </form>
                 ) : (
                     renderUsageTab()
                 )}
              </div>

              {/* Action Buttons - Only show on General tab */}
              {activeTab === 'general' && (
                  <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
                    <button
                        type="button"
                        onClick={handleTest}
                        className="px-4 py-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors flex items-center gap-2 border border-emerald-100 dark:border-emerald-800"
                    >
                        <Play size={16} className="fill-current" />
                        בדיקה
                    </button>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            ביטול
                        </button>
                        <button
                            type="submit"
                            form="query-form"
                            className="bg-[#664FE1] hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                        >
                            <Save size={18} />
                            שמירה
                        </button>
                    </div>
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

      {/* Test Result Modal */}
      {showTestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[80vh] animate-scaleIn border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Play size={18} className="text-emerald-500" />
                        תוצאות בדיקה
                    </h3>
                    <button onClick={() => setShowTestModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-auto bg-slate-50/50 dark:bg-slate-900/50 flex-1 min-h-[200px]">
                    {isTesting ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-4 text-slate-500">
                            <Loader2 size={32} className="animate-spin text-indigo-500" />
                            <p>מריץ שאילתה מול השרת...</p>
                        </div>
                    ) : testResult ? (
                        <div className="space-y-4">
                            <div className={`p-4 rounded-lg flex items-center gap-3 border ${
                                testResult.success 
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                            }`}>
                                {testResult.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                <div>
                                    <p className="font-bold">{testResult.success ? 'השאילתה בוצעה בהצלחה' : 'שגיאה בביצוע השאילתה'}</p>
                                    {testResult.executionTimeMs && (
                                        <p className="text-xs opacity-80 mt-0.5">זמן ריצה: {testResult.executionTimeMs}ms</p>
                                    )}
                                </div>
                            </div>
                            {testResult.error && (
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-red-100 dark:border-red-900/50 font-mono text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
                                    {testResult.error}
                                </div>
                            )}
                            {testResult.success && testResult.rows && (
                                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-right text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                                <tr>
                                                    {testResult.columns?.map((col) => (
                                                        <th key={col} className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{col}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {testResult.rows.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                                        {testResult.columns?.map((col) => (
                                                            <td key={col} className="px-4 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">{row[col]}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-2 text-xs text-center text-slate-400 border-t border-slate-100 dark:border-slate-700">
                                        מוצגות {testResult.rows.length} רשומות
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button 
                        onClick={() => setShowTestModal(false)}
                        className="px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors"
                    >
                        סגור
                    </button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default QueriesView;
