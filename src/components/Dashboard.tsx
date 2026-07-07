import React from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Invoice, AccountTransaction } from '../services/db';
import { 
  TrendingUp, TrendingDown, AlertCircle, 
  FileText 
} from 'lucide-react';

export default function Dashboard({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // Load state from DB
  const invoices = MockDB.getTable<Invoice>('invoices');
  const txs = MockDB.getTable<AccountTransaction>('transactions').filter(t => t.companyId === companyId);

  // Multi-tenant isolation filter
  const filteredInvoices = invoices.filter(i => i.companyId === companyId);

  // Calculations for current month's rent (July 2026)
  const currentMonthRentInvoices = filteredInvoices.filter(
    i => i.billingMonth === 'July 2026' && i.invoiceType === 'rent'
  );

  const currentMonthReceivable = currentMonthRentInvoices.reduce((sum, i) => sum + i.amount, 0);
  const currentMonthCollected = currentMonthRentInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const currentMonthDue = currentMonthRentInvoices.reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);

  const totalRevenue = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* 3 Core Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Receivable Rent Card */}
        <div className="glass-panel glass-card-hover rounded-2xl p-6 border border-slate-200 dark:border-blue-900/30 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold">{t('currentMonthReceivableRent')}</span>
            <h3 className="text-2xl font-extrabold tracking-tight">৳ {currentMonthReceivable.toLocaleString()}</h3>
            <span className="text-[10px] text-sky-400 font-medium">
              {lang === 'bn' ? 'বিলিং সাইকেল: জুলাই ২০২৬' : 'Billing Cycle: July 2026'}
            </span>
          </div>
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Rent Collected Card */}
        <div className="glass-panel glass-card-hover rounded-2xl p-6 border border-slate-200 dark:border-blue-900/30 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold">{t('rentCollected')}</span>
            <h3 className="text-2xl font-extrabold tracking-tight text-emerald-400">৳ {currentMonthCollected.toLocaleString()}</h3>
            <span className="text-[10px] text-emerald-400 font-medium">
              {lang === 'bn' 
                ? `${currentMonthReceivable > 0 ? Math.round((currentMonthCollected / currentMonthReceivable) * 100) : 0}% আদায় হয়েছে` 
                : `${currentMonthReceivable > 0 ? Math.round((currentMonthCollected / currentMonthReceivable) * 100) : 0}% Collected`}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Rent Due Card */}
        <div className="glass-panel glass-card-hover rounded-2xl p-6 border border-slate-200 dark:border-blue-900/30 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold">{t('rentDue')}</span>
            <h3 className="text-2xl font-extrabold tracking-tight text-rose-400">৳ {currentMonthDue.toLocaleString()}</h3>
            <span className="text-[10px] text-rose-400 font-medium">
              {lang === 'bn' ? 'তাত্ক্ষণিক তাগাদা প্রয়োজন' : 'Outstanding this month'}
            </span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
        </div>

      </div>

      {/* 2 Charts Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income Chart Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-blue-900/30">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm flex items-center gap-2 text-sky-400">
              <TrendingUp className="w-4 h-4" />
              {t('revenueAnalytics')}
            </span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-semibold">
              {lang === 'bn' ? 'মোট সংগৃহীত: ' : 'Total Collected: '}৳{totalRevenue.toLocaleString()}
            </span>
          </div>

          <div className="h-52 flex items-end justify-between px-4 pt-6 border-b border-slate-200 dark:border-blue-950/40 relative">
            
            {/* background grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
              <div className="border-b border-dashed border-slate-200 dark:border-blue-950/20 w-full h-0"></div>
              <div className="border-b border-dashed border-slate-200 dark:border-blue-950/20 w-full h-0"></div>
              <div className="border-b border-dashed border-slate-200 dark:border-blue-950/20 w-full h-0"></div>
            </div>

            {[
              { m: 'Jan', val: 40 },
              { m: 'Feb', val: 55 },
              { m: 'Mar', val: 60 },
              { m: 'Apr', val: 45 },
              { m: 'May', val: 70 },
              { m: 'Jun', val: 90 },
              { m: 'Jul', val: 110 }
            ].map((d, i) => (
              <div key={i} className="flex flex-col items-center w-1/8 group relative z-10">
                {/* Tooltip */}
                <div className="absolute -top-10 bg-slate-800 text-white text-[9px] p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none shadow-lg whitespace-nowrap">
                  {lang === 'bn' ? 'আয়: ' : 'Income: '}৳{(d.val*1000).toLocaleString()}
                </div>
                {/* Visual Bar */}
                <div className="flex items-end h-36 w-8 bg-slate-100 dark:bg-slate-900/30 rounded-t-lg overflow-hidden">
                  <div 
                    className="w-full bg-gradient-to-t from-emerald-500 to-sky-400 group-hover:from-emerald-400 group-hover:to-sky-300 transition-all duration-300 rounded-t-lg" 
                    style={{ height: `${(d.val / 120) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-semibold">{d.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Chart Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-blue-900/30">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm flex items-center gap-2 text-rose-400">
              <TrendingDown className="w-4 h-4" />
              {t('expenseAnalytics')}
            </span>
            <span className="text-xs bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full font-semibold">
              {lang === 'bn' ? 'মোট ব্যয়: ' : 'Total Expense: '}৳{totalExpense.toLocaleString()}
            </span>
          </div>

          <div className="h-52 flex items-end justify-between px-4 pt-6 border-b border-slate-200 dark:border-blue-950/40 relative">
            
            {/* background grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
              <div className="border-b border-dashed border-slate-200 dark:border-blue-950/20 w-full h-0"></div>
              <div className="border-b border-dashed border-slate-200 dark:border-blue-950/20 w-full h-0"></div>
              <div className="border-b border-dashed border-slate-200 dark:border-blue-950/20 w-full h-0"></div>
            </div>

            {[
              { m: 'Jan', val: 15 },
              { m: 'Feb', val: 20 },
              { m: 'Mar', val: 18 },
              { m: 'Apr', val: 25 },
              { m: 'May', val: 30 },
              { m: 'Jun', val: 51 },
              { m: 'Jul', val: 12 }
            ].map((d, i) => (
              <div key={i} className="flex flex-col items-center w-1/8 group relative z-10">
                {/* Tooltip */}
                <div className="absolute -top-10 bg-slate-800 text-white text-[9px] p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none shadow-lg whitespace-nowrap">
                  {lang === 'bn' ? 'ব্যয়: ' : 'Expense: '}৳{(d.val*1000).toLocaleString()}
                </div>
                {/* Visual Bar */}
                <div className="flex items-end h-36 w-8 bg-slate-100 dark:bg-slate-900/30 rounded-t-lg overflow-hidden">
                  <div 
                    className="w-full bg-gradient-to-t from-rose-500 to-amber-500 group-hover:from-rose-400 group-hover:to-amber-400 transition-all duration-300 rounded-t-lg" 
                    style={{ height: `${(d.val / 60) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-semibold">{d.m}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
