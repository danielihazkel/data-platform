import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Save, X, Database } from 'lucide-react';
import { apiService } from '../services/api';
import { DistributionCollectorQuery, DistributionCollectorSystem } from '../types';
import SplitView from '../components/ui/SplitView';
import { StatusBadge } from '../components/ui/Badge';

const QueriesView: React.FC = () => {
  const [queries, setQueries] = useState<DistributionCollectorQuery[]>([]);
  const [systems, setSystems] = useState<DistributionCollectorSystem[]>([]);
  const [databases, setDatabases] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedQuery, setSelectedQuery] = useState<Partial<DistributionCollectorQuery> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [qData, sData, dbData] = await Promise.all([
      apiService.getQueries(),
      apiService.getSystems(),
      apiService.getAvailableDatabases()
    ]);
    setQueries(qData);
    setSystems(sData);
    setDatabases(dbData);
  };

  const filteredQueries = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return queries.filter(q => 
      q.name.toLowerCase().includes(term) || 
      q.id.toLowerCase().includes(term) ||
      q.system?.name.toLowerCase().includes(term)
    );
  }, [queries, searchTerm]);

  const handleSelect = (query: DistributionCollectorQuery) => {
    setSelectedQuery({ ...query });
    setIsEditing(true);
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
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery) return;
    
    // Basic validation logic
    if (!selectedQuery.id || !selectedQuery.name || !selectedQuery.systemId) {
      alert("נא למלא שדות חובה");
      return;
    }

    try {
      // Find the full system object for optimistic update
      const system = systems.find(s => s.id === selectedQuery.systemId);
      const payload = { ...selectedQuery, system } as DistributionCollectorQuery;
      
      await apiService.saveQuery(payload);
      
      // Refresh list
      await loadData();
      setIsEditing(false);
      setSelectedQuery(null);
    } catch (err) {
      console.error(err);
      alert("שגיאה בשמירה");
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="חיפוש לפי שם, מזהה או מערכת..."
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
          שאילתה חדשה
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
                  <th className="px-6 py-4 font-semibold text-slate-600">מערכת</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueries.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => handleSelect(item)}
                    className={`cursor-pointer transition-colors ${selectedQuery?.id === item.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-4 font-mono text-slate-500">{item.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                    <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                        <Database size={14} className="text-slate-400"/>
                        {item.system?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge isActive={item.isActive} />
                    </td>
                  </tr>
                ))}
                {filteredQueries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400">
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
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800">
                  {selectedQuery.createTs ? 'עריכת שאילתה' : 'יצירת שאילתה'}
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
                        value={selectedQuery.id || ''}
                        onChange={e => setSelectedQuery({...selectedQuery, id: e.target.value})}
                        disabled={!!selectedQuery.createTs}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">שם</label>
                      <input
                        required
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={selectedQuery.name || ''}
                        onChange={e => setSelectedQuery({...selectedQuery, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">תיאור</label>
                    <textarea
                      rows={2}
                      className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      value={selectedQuery.description || ''}
                      onChange={e => setSelectedQuery({...selectedQuery, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">מערכת</label>
                      <select
                        required
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={selectedQuery.systemId || ''}
                        onChange={e => setSelectedQuery({...selectedQuery, systemId: e.target.value})}
                      >
                        <option value="">בחר מערכת...</option>
                        {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-semibold text-slate-500">מקור מידע</label>
                       <select
                        required
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={selectedQuery.dataSource || ''}
                        onChange={e => setSelectedQuery({...selectedQuery, dataSource: e.target.value})}
                       >
                         <option value="">בחר DB...</option>
                         {databases.map(d => <option key={d} value={d}>{d}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">שאילתת SQL</label>
                    <textarea
                      required
                      dir="ltr"
                      rows={5}
                      className="w-full p-2 font-mono text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                      value={selectedQuery.dataQuery || ''}
                      onChange={e => setSelectedQuery({...selectedQuery, dataQuery: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">עמודות (מופרד בפסיקים)</label>
                    <input
                        dir="ltr"
                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={selectedQuery.dataColumns || ''}
                        onChange={e => setSelectedQuery({...selectedQuery, dataColumns: e.target.value})}
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">מקסימום תוצאות</label>
                        <input
                          type="number"
                          className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={selectedQuery.maxResults || 0}
                          onChange={e => setSelectedQuery({...selectedQuery, maxResults: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">סטטוס</label>
                        <select
                          className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          value={selectedQuery.isActive}
                          onChange={e => setSelectedQuery({...selectedQuery, isActive: parseInt(e.target.value)})}
                        >
                          <option value={1}>פעיל</option>
                          <option value={0}>לא פעיל</option>
                        </select>
                      </div>
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

export default QueriesView;
