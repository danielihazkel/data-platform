import React, { useEffect, useState } from 'react';
import { Plus, X, Search, Server, Users, Edit2, Save, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import { DistributionCollectorSystem, DistributionSchedulerGroup } from '../types';

type Tab = 'systems' | 'groups';

const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('systems');
  const [systems, setSystems] = useState<DistributionCollectorSystem[]>([]);
  const [groups, setGroups] = useState<DistributionSchedulerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<Partial<DistributionCollectorSystem> | null>(null);
  const [editingGroup, setEditingGroup] = useState<Partial<DistributionSchedulerGroup> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, gData] = await Promise.all([
        apiService.getSystems(),
        apiService.getGroups()
      ]);
      setSystems(sData);
      setGroups(gData);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeTab === 'systems' 
    ? systems.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase()))
    : groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.id.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleNew = () => {
    if (activeTab === 'systems') {
      setEditingSystem({ id: '', name: '', department: 0, userManager: '', lineOfBusiness: 0 });
      setEditingGroup(null);
    } else {
      setEditingGroup({ id: '', name: '', department: 0, userManager: '', lineOfBusiness: 0 });
      setEditingSystem(null);
    }
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    if (activeTab === 'systems') {
      setEditingSystem({ ...item });
      setEditingGroup(null);
    } else {
      setEditingGroup({ ...item });
      setEditingSystem(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (activeTab === 'systems' && editingSystem) {
            await apiService.saveSystem(editingSystem as DistributionCollectorSystem);
        } else if (activeTab === 'groups' && editingGroup) {
            await apiService.saveGroup(editingGroup as DistributionSchedulerGroup);
        }
        await loadData();
        setIsModalOpen(false);
    } catch (err) {
        alert("שגיאה בשמירה");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">הגדרות וניהול משאבים</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
        {/* Tabs Header */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('systems')}
            className={`px-8 py-4 text-sm font-semibold flex items-center gap-2 transition-colors relative ${
              activeTab === 'systems' 
                ? 'text-[#664FE1] bg-indigo-50/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Server size={18} />
            מערכות (Systems)
            {activeTab === 'systems' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#664FE1]"></div>}
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-8 py-4 text-sm font-semibold flex items-center gap-2 transition-colors relative ${
              activeTab === 'groups' 
                ? 'text-[#664FE1] bg-indigo-50/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users size={18} />
            קבוצות תזמון (Groups)
            {activeTab === 'groups' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#664FE1]"></div>}
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div className="relative w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    type="text"
                    placeholder="חיפוש..."
                    className="w-full pl-4 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#664FE1] focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={handleNew}
                className="bg-[#664FE1] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-all"
            >
                <Plus size={16} />
                {activeTab === 'systems' ? 'מערכת חדשה' : 'קבוצה חדשה'}
            </button>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
            {loading ? (
                <div className="flex justify-center items-center h-64 text-slate-400">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : (
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0">
                        <tr>
                            <th className="px-6 py-3 border-b border-slate-200">מזהה</th>
                            <th className="px-6 py-3 border-b border-slate-200">שם</th>
                            <th className="px-6 py-3 border-b border-slate-200">אחראי (User Manager)</th>
                            <th className="px-6 py-3 border-b border-slate-200">מחלקה</th>
                            <th className="px-6 py-3 border-b border-slate-200">LOB</th>
                            <th className="px-6 py-3 border-b border-slate-200 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredItems.map((item: any) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-3 font-mono text-slate-500">{item.id}</td>
                                <td className="px-6 py-3 font-medium text-slate-800">{item.name}</td>
                                <td className="px-6 py-3 text-slate-600">{item.userManager || '-'}</td>
                                <td className="px-6 py-3 text-slate-600">{item.department || '-'}</td>
                                <td className="px-6 py-3 text-slate-600">{item.lineOfBusiness || '-'}</td>
                                <td className="px-6 py-3 text-left">
                                    <button 
                                        onClick={() => handleEdit(item)}
                                        className="p-2 text-slate-400 hover:text-[#664FE1] hover:bg-indigo-50 rounded-full transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {filteredItems.length === 0 && (
                             <tr>
                                 <td colSpan={6} className="text-center py-12 text-slate-400">לא נמצאו רשומות</td>
                             </tr>
                         )}
                    </tbody>
                </table>
            )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
              <div className="bg-white w-full max-w-md rounded-xl shadow-2xl flex flex-col animate-scaleIn">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                      <h3 className="font-bold text-slate-800">
                          {activeTab === 'systems' 
                            ? (editingSystem?.createTs ? 'עריכת מערכת' : 'מערכת חדשה') 
                            : (editingGroup?.createTs ? 'עריכת קבוצה' : 'קבוצה חדשה')}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSave} className="p-6 space-y-4">
                      {/* Shared Fields Logic since System and Group structures are identical here */}
                      {(() => {
                          const target = activeTab === 'systems' ? editingSystem : editingGroup;
                          const setTarget = activeTab === 'systems' ? setEditingSystem : setEditingGroup;
                          
                          if (!target) return null;

                          return (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">מזהה</label>
                                    <input
                                        required
                                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={target.id || ''}
                                        onChange={(e) => setTarget({ ...target, id: e.target.value } as any)}
                                        disabled={!!target.createTs}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">שם</label>
                                    <input
                                        required
                                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={target.name || ''}
                                        onChange={(e) => setTarget({ ...target, name: e.target.value } as any)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">אחראי (User Manager)</label>
                                    <input
                                        className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={target.userManager || ''}
                                        onChange={(e) => setTarget({ ...target, userManager: e.target.value } as any)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">מחלקה</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={target.department || ''}
                                            onChange={(e) => setTarget({ ...target, department: parseInt(e.target.value) || 0 } as any)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">LOB</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={target.lineOfBusiness || ''}
                                            onChange={(e) => setTarget({ ...target, lineOfBusiness: parseInt(e.target.value) || 0 } as any)}
                                        />
                                    </div>
                                </div>
                            </>
                          );
                      })()}
                      
                      <div className="pt-4 flex justify-end gap-3">
                          <button
                              type="button"
                              onClick={() => setIsModalOpen(false)}
                              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm"
                          >
                              ביטול
                          </button>
                          <button
                              type="submit"
                              className="bg-[#664FE1] hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm"
                          >
                              <Save size={16} />
                              שמירה
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default SettingsView;
