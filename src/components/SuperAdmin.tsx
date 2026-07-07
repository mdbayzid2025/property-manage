import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Company } from '../services/db';
import { Shield, Layers, Users, Sliders, CheckCircle, CreditCard, MessageSquare } from 'lucide-react';

export default function SuperAdmin() {
  const { t, lang } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>(() => MockDB.getTable<Company>('companies'));
  const [aiEnabled, setAiEnabled] = useState(true);
  const [mfsGateway, setMfsGateway] = useState(true);
  const [autoSuspension, setAutoSuspension] = useState(false);

  const toggleSuspension = (id: string) => {
    const updated = companies.map(c => {
      if (c.id === id) {
        const nextState = !c.suspended;
        MockDB.update<Company>('companies', id, { suspended: nextState });
        return { ...c, suspended: nextState };
      }
      return c;
    });
    setCompanies(updated);
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t('superAdmin')}</h2>
          <p className="text-xs text-slate-400">Global SaaS Control Panel & Subscription Packages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Companies & Subscriptions */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Active Tenant Organizations
            </span>
            <span className="text-xs text-slate-400">Total: {companies.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-blue-950/40 text-slate-400">
                  <th className="py-2 font-medium">Tenant Name</th>
                  <th className="py-2 font-medium">SaaS Package</th>
                  <th className="py-2 font-medium">Expiry Date</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-950/30">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-950/10">
                    <td className="py-3 font-semibold text-slate-300">{c.name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.plan === 'Enterprise' ? 'bg-purple-500/10 text-purple-400' :
                        c.plan === 'Standard' ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{c.expiryDate}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.suspended ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {c.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => toggleSuspension(c.id)}
                        className={`px-2.5 py-1 rounded-lg font-semibold text-[10px] border transition-all ${
                          c.suspended 
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10'
                            : 'border-rose-500/30 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10'
                        }`}
                      >
                        {c.suspended ? 'Reactivate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global SaaS Resource Credits & Settings */}
        <div className="space-y-6">
          
          {/* SMS / WhatsApp Credit Panel */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
            <span className="font-bold text-sm flex items-center gap-2 mb-3 text-sky-400">
              <MessageSquare className="w-4 h-4" />
              Communication Credits
            </span>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2.5 bg-slate-100 dark:bg-slate-900/40 rounded-xl">
                <div>
                  <span className="text-xs text-slate-400">Global SMS Credit Pool</span>
                  <p className="text-lg font-bold text-slate-300">42,500 <span className="text-xs text-slate-500">units</span></p>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">Healthy</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-100 dark:bg-slate-900/40 rounded-xl">
                <div>
                  <span className="text-xs text-slate-400">WhatsApp Gateway Credits</span>
                  <p className="text-lg font-bold text-slate-300">8,900 <span className="text-xs text-slate-500">units</span></p>
                </div>
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">Recharge Soon</span>
              </div>
            </div>
          </div>

          {/* Feature Control Toggles */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
            <span className="font-bold text-sm flex items-center gap-2 mb-4 text-purple-400">
              <Sliders className="w-4 h-4" />
              Global Feature Toggles
            </span>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-semibold">Enable AI Analytics</h4>
                  <p className="text-[10px] text-slate-400">Provide vacancy forecasts and pricing suggestions</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={aiEnabled} 
                  onChange={() => setAiEnabled(!aiEnabled)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-semibold">Bangladesh MFS Integrations</h4>
                  <p className="text-[10px] text-slate-400">Enable bKash, Nagad payment checkout systems</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={mfsGateway} 
                  onChange={() => setMfsGateway(!mfsGateway)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-semibold">Auto Subscription Suspension</h4>
                  <p className="text-[10px] text-slate-400">Lock dashboard if subscription is unpaid for 3 days</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoSuspension} 
                  onChange={() => setAutoSuspension(!autoSuspension)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
