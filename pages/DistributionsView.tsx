import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Save, X, Trash2, Share2 } from 'lucide-react';
import { apiService } from '../services/api';
import { DistributionDistributerDistribution, DistributionDistributerType, DistributionSchedulerSchedule } from '../types';
import SplitView from '../components/ui/SplitView';
import { StatusBadge } from '../components/ui/Badge';

const DistributionsView: React.FC = () => {
  const [distributions, setDistributions] = useState<DistributionDistributerDistribution[]>([]);
  const [types, setTypes] = useState<DistributionDistributerType[]>([]);
  const [schedules, setSchedules] = useState<DistributionSchedulerSchedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedDist, setSelectedDist] = useState<Partial<DistributionDistributerDistribution> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [dData, tData, sData] = await Promise.all([
      apiService.getDistributions(),
      apiService.getDistributionTypes(),
      apiService.getSchedules()
    ]);
    setDistributions(dData);
    setTypes(tData);
    setSchedules(sData);
  };

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return distributions.filter(d => 
      d.id.toLowerCase().includes(term) ||
      d.scheduleId.toLowerCase().includes(term) ||
      d.distributionType?.name.toLowerCase().includes(term)
    );
  }, [distributions, searchTerm]);

  const handleNew = () => {
    setSelectedDist({
      id: '',
      scheduleId: '',
      parameters: '',
      isActive: 1
    });
    setIsEditing(true);
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

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="חיפוש לפי מזהה, סוג..."
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
          הפצה חדשה
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
                  <th className="px-6 py-4 font-semibold text-slate-600">סוג</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">תזמון משוייך</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => { setSelectedDist({...item}); setIsEditing(true); }}
                    className={`cursor-pointer transition-colors ${selectedDist?.id === item.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-4 font-mono text-slate-500">{item.id}</td>
                    <td className="px-6 py-4 flex items-center gap-2 text-slate-800">
                        <Share2 size={14} className="text-slate-400"/>
                        {item.distributionType?.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{item.scheduleId}</td>
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
        }
        detail={
          selectedDist && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800">
                  {selectedDist.createTs ? 'עריכת הפצה' : 'הפצה חדשה'}
                </h2>
                <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">מזהה</label>
                      <input
                        required
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={selectedDist.id || ''}
                        onChange={e => setSelectedDist({...selectedDist, id: e.target.value})}
                        disabled={!!selectedDist.createTs}
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">סוג הפצה</label>
                      <select
                        required
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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
                       <label className="text-xs font-semibold text-slate-500">תזמון</label>
                       <select
                        required
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={selectedDist.scheduleId || ''}
                        onChange={e => setSelectedDist({...selectedDist, scheduleId: e.target.value})}
                       >
                         <option value="">בחר תזמון...</option>
                         {schedules.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">פרמטרים (JSON)</label>
                    <textarea
                      required
                      dir="ltr"
                      rows={6}
                      className="w-full p-2 font-mono text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                      value={selectedDist.parameters || ''}
                      onChange={e => setSelectedDist({...selectedDist, parameters: e.target.value})}
                      placeholder='{"key": "value"}'
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">סטטוס</label>
                    <select
                      className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      value={selectedDist.isActive}
                      onChange={e => setSelectedDist({...selectedDist, isActive: parseInt(e.target.value)})}
                    >
                      <option value={1}>פעיל</option>
                      <option value={0}>לא פעיל</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                  {selectedDist.isActive === 1 && selectedDist.createTs && (
                     <button
                        type="button"
                        onClick={handleDeactivate}
                        className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2 mr-auto"
                     >
                        <Trash2 size={16}/>
                        השבת
                     </button>
                  )}
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

export default DistributionsView;
