import React from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Invoice, AccountTransaction, Tenant, Property, Unit } from '../services/db';
import {
  TrendingUp, TrendingDown, AlertCircle,
  FileText
} from 'lucide-react';

export default function Dashboard({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // Load state from DB
  const invoices = MockDB.getTable<Invoice>('invoices');
  const txs = MockDB.getTable<AccountTransaction>('transactions').filter(t => t.companyId === companyId);
  const tenants = MockDB.getTable<Tenant>('tenants').filter(t => t.companyId === companyId);
  const properties = MockDB.getTable<Property>('properties').filter(p => p.companyId === companyId);
  const units = MockDB.getTable<Unit>('units');

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

  // Custom Effective Metrics
  const propIds = properties.map(p => p.id);
  const companyUnits = units.filter(u => propIds.includes(u.propertyId));
  const totalUnitsCount = companyUnits.length;
  const occupiedUnitsCount = companyUnits.filter(u => u.status === 'occupied').length;
  const occupancyRate = totalUnitsCount > 0 ? Math.round((occupiedUnitsCount / totalUnitsCount) * 100) : 0;
  const activeTenantsCount = tenants.filter(t => t.status === 'active').length;

  const currentMonthTxIn = txs.filter(t => t.type === 'income' && t.date.includes('2026-07')).reduce((sum, t) => sum + t.amount, 0);
  const currentMonthTxOut = txs.filter(t => t.type === 'expense' && t.date.includes('2026-07')).reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 animate-slide-in">

      {/* 6 Core Effective Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Receivable Rent Card */}
        <div className="glass-panel glass-card-hover rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">চলতি মাসের প্রাপ্য ভাড়া</span>
            <h3 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">৳ {currentMonthReceivable.toLocaleString()}</h3>
            <span className="text-[10px] text-sky-500 font-medium">
              {lang === 'bn' ? 'বিলিং সাইকেল: জুলাই ২০২৬' : 'Billing Cycle: July 2026'}
            </span>
          </div>
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Rent Collected Card */}
        <div className="glass-panel glass-card-hover rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">চলতি মাসের ভাড়া আদায়</span>
            <h3 className="text-xl font-extrabold tracking-tight text-emerald-500">৳ {currentMonthCollected.toLocaleString()}</h3>
            <span className="text-[10px] text-emerald-500 font-bold">
              {lang === 'bn'
                ? `${currentMonthReceivable > 0 ? Math.round((currentMonthCollected / currentMonthReceivable) * 100) : 0}% আদায় হয়েছে`
                : `${currentMonthReceivable > 0 ? Math.round((currentMonthCollected / currentMonthReceivable) * 100) : 0}% Collected`}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Rent Due Card */}
        <div className="glass-panel glass-card-hover rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">চলতি মাসের বকেয়া ভাড়া</span>
            <h3 className="text-xl font-extrabold tracking-tight text-rose-500">৳ {currentMonthDue.toLocaleString()}</h3>
            <span className="text-[10px] text-rose-500 font-medium">
              {lang === 'bn' ? 'তাত্ক্ষণিক তাগাদা প্রয়োজন' : 'Action needed'}
            </span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <AlertCircle className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Properties & Units Stats */}
        <div className="glass-panel glass-card-hover rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">মোট প্রোপার্টি ও ফ্ল্যাট</span>
            <h3 className="text-xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">{properties.length} টি প্রোপার্টি</h3>
            <span className="text-[10px] text-slate-500 font-bold">
              সর্বমোট ফ্ল্যাট/ইউনিট: {totalUnitsCount} টি
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Flat Occupancy Rate */}
        <div className="glass-panel glass-card-hover rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">ফ্ল্যাট অকুপেন্সি রেট</span>
            <h3 className="text-xl font-extrabold tracking-tight text-teal-600 dark:text-teal-400">{occupancyRate}%</h3>
            <span className="text-[10px] text-slate-500 font-bold">
              ভাড়া হয়েছে: {occupiedUnitsCount} / {totalUnitsCount} টি ফ্ল্যাট
            </span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Active Tenants */}
        <div className="glass-panel glass-card-hover rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">সক্রিয় ভাড়াটিয়া সংখ্যা</span>
            <h3 className="text-xl font-extrabold tracking-tight text-cyan-600 dark:text-cyan-400">{activeTenantsCount} জন</h3>
            <span className="text-[10px] text-slate-500 font-medium">
              সক্রিয় কন্ট্যাক্ট চুক্তির সংখ্যা
            </span>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-550 dark:text-cyan-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
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
                  {lang === 'bn' ? 'আয়: ' : 'Income: '}৳{(d.val * 1000).toLocaleString()}
                </div>
                {/* Bar Value Label */}
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 select-none">
                  ৳{d.val}k
                </span>
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
                  {lang === 'bn' ? 'ব্যয়: ' : 'Expense: '}৳{(d.val * 1000).toLocaleString()}
                </div>
                {/* Bar Value Label */}
                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 mb-1 select-none">
                  ৳{d.val}k
                </span>
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
