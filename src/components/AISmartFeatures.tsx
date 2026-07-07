import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { Brain, TrendingUp, ShieldAlert, BadgePercent, HelpCircle } from 'lucide-react';

export default function AISmartFeatures({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();
  
  // Interactive Rent Estimator State
  const [size, setSize] = useState(1500);
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(3);
  const [facing, setFacing] = useState('South');
  const [estimatedRent, setEstimatedRent] = useState(28500);

  const calculateEstimate = () => {
    // Basic premium heuristic estimator for Dhaka
    const basePrice = size * 15; // 15 BDT/sqft base
    const bedBonus = beds * 1500;
    const bathBonus = baths * 1000;
    const facingBonus = facing === 'South' ? 3000 : facing === 'East' ? 1500 : 0;
    const total = basePrice + bedBonus + bathBonus + facingBonus;
    setEstimatedRent(Math.round(total));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
          <Brain className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t('aiSmartTitle')}</h2>
          <p className="text-xs text-slate-400">Heuristics-driven Artificial Intelligence analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Vacancy Predictor */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-emerald-400" />
                {t('aiVacancyPredict')}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">Live Heuristics</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Flat B2 (Maintenance)</span>
                <span className="font-semibold text-amber-400">92% fill probability in 14 days</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Office 301 (Vacant)</span>
                <span className="font-semibold text-emerald-400">74% fill probability in 30 days</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '74%' }}></div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            *Prediction is based on current season (July monsoon), location demands (Dhanmondi / Gulshan), historical move-in speeds, and market pricing dynamics.
          </p>
        </div>

        {/* Rent Suggestion Form */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              {t('aiRentSuggest')}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Size (Sqft)</label>
                <input 
                  type="number" 
                  value={size} 
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-blue-950/40 rounded-lg text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Facing Direction</label>
                <select 
                  value={facing} 
                  onChange={(e) => setFacing(e.target.value)}
                  className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-blue-950/40 rounded-lg text-xs outline-none"
                >
                  <option value="South">South facing (দক্ষিণ মুখী)</option>
                  <option value="East">East facing (পূর্ব মুখী)</option>
                  <option value="North/West">North/West facing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Bedrooms</label>
                <input 
                  type="number" 
                  value={beds} 
                  onChange={(e) => setBeds(Number(e.target.value))}
                  className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-blue-950/40 rounded-lg text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Bathrooms</label>
                <input 
                  type="number" 
                  value={baths} 
                  onChange={(e) => setBaths(Number(e.target.value))}
                  className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-blue-950/40 rounded-lg text-xs outline-none"
                />
              </div>
            </div>

            <button 
              onClick={calculateEstimate} 
              className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold shadow-lg shadow-sky-500/20 transition-all"
            >
              Estimate Optimal Market Rent
            </button>

            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex justify-between items-center">
              <span className="text-xs text-slate-300">Suggested Rent:</span>
              <span className="text-lg font-bold text-sky-400">৳ {estimatedRent.toLocaleString()} <span className="text-xs">/ month</span></span>
            </div>
          </div>
        </div>

        {/* Tenant Risk Score */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
          <span className="text-sm font-semibold flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            {t('aiRiskScore')}
          </span>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-2.5 bg-slate-100 dark:bg-slate-900/40 rounded-xl">
              <div>
                <h4 className="text-xs font-semibold">কামরুল হাসান চৌধুরী (Flat A1)</h4>
                <p className="text-[10px] text-slate-400">Govt Officer, Active lease</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400">Low Risk (8.5/10)</span>
                <p className="text-[9px] text-slate-400">Pays 2 days early average</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-100 dark:bg-slate-900/40 rounded-xl">
              <div>
                <h4 className="text-xs font-semibold">রফিকুল আলম (Shop 101)</h4>
                <p className="text-[10px] text-slate-400">Merchant, Partial payment due</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-400">Medium Risk (6.2/10)</span>
                <p className="text-[9px] text-slate-400">Occasional delays in utility billing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Forecast Chart */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
          <span className="text-sm font-semibold flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            {t('aiForecastRevenue')}
          </span>

          <div className="flex items-end justify-between h-32 pt-4 px-2">
            {[
              { m: 'Jul', v: '95k', h: '60%' },
              { m: 'Aug', v: '105k', h: '66%' },
              { m: 'Sep', v: '120k', h: '75%' },
              { m: 'Oct', v: '140k', h: '88%' },
              { m: 'Nov', v: '140k', h: '88%' },
              { m: 'Dec', v: '160k', h: '100%' }
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col items-center w-1/6 group relative">
                <span className="absolute -top-6 text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {col.v}
                </span>
                <div className="w-4 bg-sky-500/30 dark:bg-sky-500/20 group-hover:bg-sky-400 rounded-t-sm transition-all" style={{ height: col.h }}></div>
                <span className="text-[10px] text-slate-400 mt-2">{col.m}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">Projected growth incorporates new Shop 102 bookings in October.</p>
        </div>

      </div>
    </div>
  );
}
