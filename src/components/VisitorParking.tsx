import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Visitor, ParkingSpace, Unit } from '../services/db';
import { ShieldCheck, Plus, CheckCircle2, Car, LogOut, Clock } from 'lucide-react';

export default function VisitorParking({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // DB tables
  const [visitors, setVisitors] = useState<Visitor[]>(() => MockDB.getTable<Visitor>('visitors'));
  const [parking, setParking] = useState<ParkingSpace[]>(() => MockDB.getTable<ParkingSpace>('parking'));
  const [units] = useState<Unit[]>(() => MockDB.getTable<Unit>('units'));

  // Visitor Form State
  const [showVisitorForm, setShowVisitorForm] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [targetUnitId, setTargetUnitId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [activePass, setActivePass] = useState<Visitor | null>(null);

  const handleRegisterVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPhone.trim() || !targetUnitId) return;

    const nextPassCode = 'VST-' + Math.floor(1000 + Math.random() * 9000);

    const newVisitor = MockDB.insert<Visitor>('visitors', {
      id: 'vst_' + Math.random().toString(36).substr(2, 9),
      companyId,
      name: visitorName,
      phone: visitorPhone,
      unitId: targetUnitId,
      purpose,
      entryTime: new Date().toISOString(),
      passCode: nextPassCode
    });

    setVisitors(prev => [newVisitor, ...prev]);
    setActivePass(newVisitor);

    // Reset Form
    setVisitorName('');
    setVisitorPhone('');
    setTargetUnitId('');
    setPurpose('');
    setShowVisitorForm(false);
  };

  const handleCheckoutVisitor = (id: string) => {
    MockDB.update<Visitor>('visitors', id, {
      exitTime: new Date().toISOString()
    });
    setVisitors(MockDB.getTable<Visitor>('visitors'));
    alert('Visitor marked checked out.');
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('visitorMgmt')} & Parking</h2>
            <p className="text-xs text-slate-400">Security Gate Log, Visitor Pass Code issuer & Parking slots map</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Visitors Log Module */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">Visitor Log Register</span>
            <button 
              onClick={() => setShowVisitorForm(!showVisitorForm)}
              className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold"
            >
              Add Entry Pass
            </button>
          </div>

          {showVisitorForm && (
            <form onSubmit={handleRegisterVisitor} className="space-y-3 p-3 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl animate-slide-in">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">Visitor Name</label>
                  <input 
                    type="text" 
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-300 outline-none"
                    placeholder="e.g. মোঃ মামুন"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-300 outline-none"
                    placeholder="Mobile"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">Unit Flat to Visit</label>
                  <select 
                    value={targetUnitId}
                    onChange={(e) => setTargetUnitId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-300 outline-none"
                    required
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">-- Flat / Shop --</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{u.number}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">Purpose / মন্তব্য</label>
                  <input 
                    type="text" 
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-300 outline-none"
                    placeholder="e.g. পার্সেল ডেলিভারি"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs"
              >
                Generate Entry Pass Code
              </button>
            </form>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {visitors.map((v) => {
              const unitNo = units.find(u => u.id === v.unitId)?.number || 'N/A';
              const isCheckedOut = !!v.exitTime;
              return (
                <div key={v.id} className="p-3 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-300">{v.name} <span className="text-[10px] text-slate-500">({v.phone})</span></h4>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">Visiting: <span className="text-sky-600 dark:text-sky-400 font-semibold">{unitNo}</span> • Purpose: {v.purpose}</p>
                    <div className="flex gap-2 items-center text-[9px] text-slate-500 mt-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span>In: {new Date(v.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      {isCheckedOut && <span>Out: {new Date(v.exitTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-amber-500 dark:text-amber-400 block mb-1.5">{v.passCode}</span>
                    {isCheckedOut ? (
                      <span className="text-[9px] text-slate-600 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">Checked Out</span>
                    ) : (
                      <button 
                        onClick={() => handleCheckoutVisitor(v.id)}
                        className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-md text-[9px] font-bold border border-rose-500/20"
                      >
                        Check Out
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Parking Allocation Map */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 space-y-4">
          <span className="font-bold text-sm flex items-center gap-2">
            <Car className="w-4 h-4 text-sky-400" />
            Parking Bay Allocations
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {parking.map((pk) => {
              const allocatedUnit = units.find(u => u.id === pk.allocatedTo)?.number || 'N/A';
              const isVacant = pk.status === 'vacant';
              return (
                <div key={pk.id} className={`p-4 rounded-xl border flex flex-col justify-between h-28 transition-all ${
                  isVacant 
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-400'
                }`}>
                  <div className="flex justify-between items-start font-bold">
                    <span>{pk.slotNumber}</span>
                    <span className="text-[9px] uppercase tracking-wider">{pk.status}</span>
                  </div>
                  {!isVacant && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 space-y-0.5">
                      <p>Flat: <strong className="text-slate-800 dark:text-slate-300">{allocatedUnit}</strong></p>
                      <p className="italic text-[9px]">{pk.vehiclePlate}</p>
                    </div>
                  )}
                  {isVacant && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Available for Allocation</p>
                  )}
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-300 mt-2 block">Bay Rent: ৳{pk.rentAmount}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Visitor Pass Code Overlay */}
      {activePass && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl glass-panel border border-slate-200 dark:border-blue-900/30 p-6 text-center space-y-4 animate-slide-in">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Visitor Pass Code Generated</h3>
              <p className="text-xs text-slate-400 mt-1">Show this pass to the gate security guard</p>
            </div>
            
            {/* Mock QR Visitor Pass */}
            <div className="w-32 h-32 bg-white rounded-2xl mx-auto flex items-center justify-center p-3 border border-slate-200">
              <div className="grid grid-cols-4 gap-1 w-full h-full bg-slate-100 p-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={`rounded-sm ${i % 3 === 0 || i % 7 === 0 ? 'bg-slate-900' : 'bg-white'}`}></div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-lg font-mono font-black text-amber-400 tracking-wider">{activePass.passCode}</span>
              <p className="text-[10px] text-slate-500">{activePass.name} ({units.find(u => u.id === activePass.unitId)?.number})</p>
            </div>

            <button 
              onClick={() => setActivePass(null)}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs"
            >
              Done / ঠিক আছে
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
