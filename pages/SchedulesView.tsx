import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Save, X, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { apiService } from '../services/api';
import { DistributionSchedulerSchedule, DistributionSchedulerGroup, DistributionCollectorQuery } from '../types';
import SplitView from '../components/ui/SplitView';
import { StatusBadge } from '../components/ui/Badge';

const SchedulesView: React.FC = () => {
  const [schedules, setSchedules] = useState<DistributionSchedulerSchedule[]>([]);
  const [groups, setGroups] = useState<DistributionSchedulerGroup[]>([]);
  const [queries, setQueries] = useState<DistributionCollectorQuery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedSchedule, setSelectedSchedule] = useState<Partial<DistributionSchedulerSchedule> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [schedData, groupData, queryData] = await Promise.all([
      apiService.getSchedules(),
      apiService.getGroups(),
      apiService.getQueries()
    ]);
    setSchedules(schedData);
    setGroups(groupData);
    setQueries(queryData);
  };

  const filteredSchedules = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return schedules.filter(s => 
      s.name.toLowerCase().includes(term) || 
      s.id.toLowerCase().includes(term) ||
      s.group?.name.toLowerCase().includes(term)
    );
  }, [schedules, searchTerm]);

  const handleNew = () => {
    setSelectedSchedule({
      id: '',
      name: '',
      queryId: '',
      parameters: '',
      cron: '0 0 12 * * ?',
      isActive: 1,
      // Default to tomorrow 8am
      nextRun: new Date(new Date().setHours(8,0,0,0) + 86400000).toISOString().slice(0, 16)
    });
    setIsEditing(true);
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
      // Convert datetime-local input string back to ISO if needed, though backend often accepts ISO8601
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

  // Helper to format date for input[type="datetime-local"]
  const formatDateForInput = (isoString?: string) => {
      if (!isoString) return '';
      try {
        return new Date(isoString).toISOString().slice(0, 16);
      } catch (e) {
          return '';
      }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="חיפוש לפי שם, קבוצה..."
            className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#664FE1] focus:border-transparent transition-all"
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
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600">מזהה</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">שם</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">קבוצה</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">ריצה הבאה</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedules.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => {
                        setSelectedSchedule({
                            ...item,
                            nextRun: formatDateForInput(item.nextRun)
                        });
                        setIsEditing(true);
                    }}
                    className={`cursor-pointer transition-colors ${selectedSchedule?.id === item.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-4 font-mono text-slate-500">{item.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                    <td className="px-6 py-4 text-slate-600">{item.group?.name || '-'}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {item.nextRun ? format(new Date(item.nextRun), 'dd/MM/yyyy HH:mm') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge isActive={item.isActive} />
                    </td>
                  </tr>
                ))}
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
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800">
                  {selectedSchedule.createTs ? 'עריכת תזמון' : 'תזמון חדש'}
                </h2>
                <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">מזהה</label>
                      <input
                        required
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={selectedSchedule.id || ''}
                        onChange={e => setSelectedSchedule({...selectedSchedule, id: e.target.value})}
                        disabled={!!selectedSchedule.createTs}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">שם</label>
                      <input
                        required
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={selectedSchedule.name || ''}
                        onChange={e => setSelectedSchedule({...selectedSchedule, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">קבוצה</label>
                      <select
                        required
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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
                       <label className="text-xs font-semibold text-slate-500">מזהה שאילתה</label>
                       <select
                        required
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={selectedSchedule.queryId || ''}
                        onChange={e => setSelectedSchedule({...selectedSchedule, queryId: e.target.value})}
                       >
                         <option value="">בחר שאילתה...</option>
                         {queries.map(q => <option key={q.id} value={q.id}>{q.id} - {q.name}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">פרמטרים</label>
                    <input
                      className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={selectedSchedule.parameters || ''}
                      onChange={e => setSelectedSchedule({...selectedSchedule, parameters: e.target.value})}
                    />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg space-y-3 border border-slate-100">
                      <div className="flex items-center gap-2 text-[#664FE1] mb-2">
                          <Clock size={16} />
                          <span className="font-semibold text-sm">הגדרות זמן</span>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Cron Expression</label>
                        <input
                            required
                            dir="ltr"
                            className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                            value={selectedSchedule.cron || ''}
                            onChange={e => setSelectedSchedule({...selectedSchedule, cron: e.target.value})}
                            placeholder="* * * * *"
                        />
                        <p className="text-[10px] text-slate-400">Sec Min Hour Day Month DayOfWeek</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">ריצה הבאה</label>
                        <input
                            type="datetime-local"
                            required
                            className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={selectedSchedule.nextRun || ''}
                            onChange={e => setSelectedSchedule({...selectedSchedule, nextRun: e.target.value})}
                        />
                      </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">סטטוס</label>
                    <select
                      className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      value={selectedSchedule.isActive}
                      onChange={e => setSelectedSchedule({...selectedSchedule, isActive: parseInt(e.target.value)})}
                    >
                      <option value={1}>פעיל</option>
                      <option value={0}>לא פעיל</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    className="bg-[#664FE1] hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Save size={18} />
                    שמירה
                  </button>
                </div>
              </form>
            </div>
          )
        }
      />
    </div>
  );
};

export default SchedulesView;
