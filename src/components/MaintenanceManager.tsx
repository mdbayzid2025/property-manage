import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, MaintenanceRequest, Unit, AccountTransaction } from '../services/db';
import { Wrench, Plus, CheckCircle, RefreshCw, DollarSign } from 'lucide-react';

export default function MaintenanceManager({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // DB tables
  const [requests, setRequests] = useState<MaintenanceRequest[]>(() => MockDB.getTable<MaintenanceRequest>('maintenance'));
  const [units] = useState<Unit[]>(() => MockDB.getTable<Unit>('units'));

  // Edit / Assign States
  const [activeRequest, setActiveRequest] = useState<MaintenanceRequest | null>(null);
  const [techName, setTechName] = useState('');
  const [matCost, setMatCost] = useState('');
  const [labCost, setLabCost] = useState('');
  const [status, setStatus] = useState<'pending' | 'assigned' | 'in_progress' | 'resolved'>('pending');

  const openAssignModal = (req: MaintenanceRequest) => {
    setActiveRequest(req);
    setTechName(req.technicianName || '');
    setMatCost(req.materialCost.toString());
    setLabCost(req.laborCost.toString());
    setStatus(req.status);
  };

  const handleUpdateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    const materials = Number(matCost) || 0;
    const labor = Number(labCost) || 0;

    // Update maintenance request
    const updated = MockDB.update<MaintenanceRequest>('maintenance', activeRequest.id, {
      status,
      technicianName: techName,
      materialCost: materials,
      laborCost: labor
    });

    // If resolved, create accounting expense automatically!
    if (status === 'resolved' && (materials + labor) > 0) {
      MockDB.insert<AccountTransaction>('transactions', {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        companyId,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: 'Maintenance Cost',
        account: 'Cashbook',
        amount: materials + labor,
        description: `রক্ষণাবেক্ষণ ব্যয়: ${activeRequest.title} (${activeRequest.id})`
      });
    }

    setRequests(MockDB.getTable<MaintenanceRequest>('maintenance'));
    setActiveRequest(null);
    alert('Ticket updated successfully!');
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('maintenanceMgmt')}</h2>
            <p className="text-xs text-slate-400">Track tenant complaints, assign electricians/plumbers and log maintenance costs</p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
        <span className="font-bold text-sm block mb-4">Facility Tickets & Complaints Logs</span>
        
        <div className="space-y-3">
          {requests.map((req) => {
            const unitName = units.find(u => u.id === req.unitId)?.number || 'Common Area';
            return (
              <div key={req.id} className="p-4 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-blue-950/40 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{req.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      req.priority === 'high' ? 'bg-rose-500/10 text-rose-500' :
                      req.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'
                    }`}>
                      {req.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-450">{req.description}</p>
                  <div className="flex gap-3 text-[10px] text-slate-600 dark:text-slate-450 pt-1">
                    <span>Target: <strong className="text-slate-800 dark:text-slate-200">{unitName}</strong></span>
                    <span>Created: {req.createdAt}</span>
                    {req.technicianName && <span>Staff: <strong className="text-sky-400">{req.technicianName}</strong></span>}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      req.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                      req.status === 'in_progress' ? 'bg-sky-500/10 text-sky-400' :
                      req.status === 'assigned' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {req.status.toUpperCase()}
                    </span>
                    {(req.materialCost + req.laborCost) > 0 && (
                      <p className="text-[10px] text-slate-400 mt-1">Cost: ৳{(req.materialCost + req.laborCost).toLocaleString()}</p>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => openAssignModal(req)}
                    className="px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 text-[10px] font-bold rounded-lg"
                  >
                    Manage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket Assignment Modal Overlay */}
      {activeRequest && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl glass-panel border border-slate-200 dark:border-blue-900/30 animate-slide-in">
            <form onSubmit={handleUpdateTicket} className="p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Manage Ticket: {activeRequest.title}</h3>
              
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Status / কাজের অবস্থা</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="pending">Pending (অপেক্ষমান)</option>
                  <option value="assigned">Assigned (কর্মী নিয়োজিত)</option>
                  <option value="in_progress">In Progress (চলমান কাজ)</option>
                  <option value="resolved">Resolved (সম্পন্ন হয়েছে)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Assign Technician Name</label>
                <input 
                  type="text" 
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none"
                  placeholder="e.g. রহমান প্লাম্বার"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Material Cost (৳)</label>
                  <input 
                    type="number" 
                    value={matCost}
                    onChange={(e) => setMatCost(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Labor / Service Cost (৳)</label>
                  <input 
                    type="number" 
                    value={labCost}
                    onChange={(e) => setLabCost(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setActiveRequest(null)}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-1/2 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/20"
                >
                  Confirm Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
