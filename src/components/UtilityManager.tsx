import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Unit, Property, Tenant, Invoice } from '../services/db';
import { Zap, Plus, Trash2, Calendar, User, ShieldCheck, X } from 'lucide-react';

export default function UtilityManager({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // Load DB tables
  const [properties] = useState<Property[]>(() => 
    MockDB.getTable<Property>('properties').filter(p => p.companyId === companyId)
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || '');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('July 2026');

  const [utilities, setUtilities] = useState<any[]>(() => MockDB.getTable<any>('utilities'));
  const [units] = useState<Unit[]>(() => MockDB.getTable<Unit>('units'));
  const [tenants] = useState<Tenant[]>(() => MockDB.getTable<Tenant>('tenants'));
  const [invoices, setInvoices] = useState<Invoice[]>(() => MockDB.getTable<Invoice>('invoices'));

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [billingMonth, setBillingMonth] = useState('July 2026');

  // Electricity
  const [elecPrev, setElecPrev] = useState('');
  const [elecCurr, setElecCurr] = useState('');
  const [elecRate, setElecRate] = useState('12');

  // Gas
  const [gasType, setGasType] = useState<'fixed' | 'measured'>('fixed');
  const [gasFixed, setGasFixed] = useState('1080');
  const [gasPrev, setGasPrev] = useState('');
  const [gasCurr, setGasCurr] = useState('');
  const [gasRate, setGasRate] = useState('45');

  // Garage & Water
  const [garageBill, setGarageBill] = useState('0');
  const [waterBill, setWaterBill] = useState('500');

  // Selected Unit Info for Real-Time Onscreen Tenant Binding
  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const activeTenant = selectedUnit ? tenants.find(t => t.unitId === selectedUnit.id && t.status === 'active') : null;

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId) {
      alert('অনুগ্রহ করে একটি ফ্ল্যাট/ইউনিট নির্বাচন করুন!');
      return;
    }

    // Parse Electricity Readings
    const ep = Number(elecPrev);
    const ec = Number(elecCurr);
    const er = Number(elecRate);
    if (isNaN(ep) || isNaN(ec) || isNaN(er) || ec < ep) {
      alert('বিদ্যুৎ মিটারের পূর্ববর্তী ও বর্তমান রিডিং সঠিক নয়!');
      return;
    }
    const elecBillAmount = (ec - ep) * er;

    // Parse Gas Readings / Fixed Amount
    let gasBillAmount = 0;
    let gp: number | undefined;
    let gc: number | undefined;
    let gr: number | undefined;

    if (gasType === 'fixed') {
      gasBillAmount = Number(gasFixed) || 0;
    } else {
      gp = Number(gasPrev);
      gc = Number(gasCurr);
      gr = Number(gasRate);
      if (isNaN(gp) || isNaN(gc) || isNaN(gr) || gc < gp) {
        alert('গ্যাস মিটারের পূর্ববর্তী ও বর্তমান রিডিং সঠিক নয়!');
        return;
      }
      gasBillAmount = (gc - gp) * gr;
    }

    // Garage & Water
    const garage = Number(garageBill) || 0;
    const water = Number(waterBill) || 0;

    // Calculated utility bill total
    const totalUtility = elecBillAmount + gasBillAmount + garage + water;

    // Construct extended utility bill record
    const newBill = {
      id: 'ut_' + Math.random().toString(36).substr(2, 9),
      unitId: selectedUnitId,
      propertyId: selectedPropertyId,
      billingMonth,
      
      electricityPrev: ep,
      electricityCurr: ec,
      electricityRate: er,
      electricityBill: elecBillAmount,
      
      gasType,
      gasPrev: gp,
      gasCurr: gc,
      gasRate: gr,
      gasBill: gasBillAmount,
      
      garageBill: garage,
      waterBill: water,
      
      calculatedBill: totalUtility,
      status: 'billed'
    };

    // Save to MockDB
    MockDB.insert('utilities', newBill);

    // Auto Rent-Invoice Integration
    if (activeTenant) {
      const baseRent = selectedUnit?.rentAmount || 0;
      const serviceCharge = selectedUnit?.serviceCharge || 0;

      // Query if an invoice already exists for this tenant for this month
      const existingInvoice = invoices.find(i => 
        i.tenantId === activeTenant.id && 
        i.billingMonth === billingMonth && 
        i.invoiceType === 'rent'
      );

      // Generate invoice description details
      const electricityText = `বিদ্যুৎ বিল (${ec - ep} ইউনিট): ৳${elecBillAmount}`;
      const gasText = gasType === 'fixed' ? `গ্যাস বিল: ৳${gasBillAmount}` : `গ্যাস বিল (${gc! - gp!} ইউনিট): ৳${gasBillAmount}`;
      const garageText = garage > 0 ? `, গ্যারেজ/পার্কিং: ৳${garage}` : '';
      const waterText = water > 0 ? `, পানি বিল: ৳${water}` : '';
      const billDetails = `${electricityText}, ${gasText}${garageText}${waterText}`;

      if (existingInvoice) {
        // Update existing invoice amount & details
        const updatedAmount = baseRent + serviceCharge + totalUtility;
        const updatedDetails = `ভাড়া: ৳${baseRent}, সার্ভিস চার্জ: ৳${serviceCharge}, ইউটিলিটি: ৳${totalUtility} (${billDetails})`;

        MockDB.update<Invoice>('invoices', existingInvoice.id, {
          amount: updatedAmount,
          details: updatedDetails
        });
      } else {
        // Create new invoice incorporating rent + service charge + utilities
        const totalAmount = baseRent + serviceCharge + totalUtility;
        const invoiceDetails = `ভাড়া: ৳${baseRent}, সার্ভিস চার্জ: ৳${serviceCharge}, ইউটিলিটি: ৳${totalUtility} (${billDetails})`;

        MockDB.insert<Invoice>('invoices', {
          id: 'inv_' + Math.random().toString(36).substr(2, 9),
          companyId,
          unitId: selectedUnitId,
          tenantId: activeTenant.id,
          invoiceType: 'rent',
          amount: totalAmount,
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days expiry
          billingMonth,
          status: 'pending',
          paidAmount: 0,
          details: invoiceDetails
        });
      }
    }

    // Refresh lists
    setUtilities(MockDB.getTable<any>('utilities'));
    setInvoices(MockDB.getTable<Invoice>('invoices'));

    // Reset fields
    setSelectedUnitId('');
    setElecPrev('');
    setElecCurr('');
    setGasPrev('');
    setGasCurr('');
    setGarageBill('0');
    setWaterBill('500');
    setShowAddForm(false);

    alert('ইউটিলিটি বিল তৈরি সম্পন্ন হয়েছে এবং উক্ত ভাড়াটিয়ার ভাড়া চালানের সাথে যুক্ত হয়েছে!');
  };

  const handleDeleteBill = (bill: any) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই ইউটিলিটি বিলটি মুছে ফেলতে চান? এটি উক্ত ভাড়াটিয়ার মাসিক চালান থেকে বাদ দেওয়া হবে।')) return;

    MockDB.delete('utilities', bill.id);

    // Rollback invoice updates
    const linkedTenant = tenants.find(t => t.unitId === bill.unitId && t.status === 'active');
    if (linkedTenant) {
      const unitDetails = units.find(u => u.id === bill.unitId);
      const baseRent = unitDetails?.rentAmount || 0;
      const serviceCharge = unitDetails?.serviceCharge || 0;

      const existingInvoice = invoices.find(i => 
        i.tenantId === linkedTenant.id && 
        i.billingMonth === bill.billingMonth && 
        i.invoiceType === 'rent'
      );

      if (existingInvoice) {
        // Reset to base rent + service charge only
        const newAmount = baseRent + serviceCharge;
        const newDetails = `ভাড়া: ৳${baseRent}, সার্ভিস চার্জ: ৳${serviceCharge} (ইউটিলিটি বিল বাতিল করা হয়েছে)`;

        MockDB.update<Invoice>('invoices', existingInvoice.id, {
          amount: newAmount,
          details: newDetails
        });
      }
    }

    setUtilities(MockDB.getTable<any>('utilities'));
    setInvoices(MockDB.getTable<Invoice>('invoices'));
    alert('ইউটিলিটি বিল মুছে ফেলা হয়েছে এবং ভাড়া চালানের মোট হিসাব আপডেট হয়েছে!');
  };

  // Filter units belonging to selected property
  const propertyUnits = units.filter(u => u.propertyId === selectedPropertyId);

  // Filter utility logs based on selected property & billing month
  const filteredUtilities = utilities.filter(ut => {
    const unit = units.find(u => u.id === ut.unitId);
    if (!unit || unit.propertyId !== selectedPropertyId) return false;
    return ut.billingMonth === selectedMonthFilter;
  });

  return (
    <div className="space-y-6 text-sm">
      
      {/* Header & Controls Panel */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 dark:border-blue-955/40 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('utilityMgmt')}</h2>
            <p className="text-xs text-slate-400">Manage, calculate, and add monthly utilities directly to rent invoices</p>
          </div>
        </div>

        {/* Global Selectors */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <select
            value={selectedPropertyId}
            onChange={(e) => {
              setSelectedPropertyId(e.target.value);
              setShowAddForm(false);
            }}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none transition-all focus:border-sky-500/50"
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none transition-all focus:border-sky-500/50"
          >
            <option value="June 2026">June 2026</option>
            <option value="July 2026">July 2026</option>
            <option value="August 2026">August 2026</option>
            <option value="September 2026">September 2026</option>
          </select>

          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/10 transition-all ml-auto lg:ml-0"
          >
            <Plus className="w-4 h-4" />
            Record Utility Bill
          </button>
        </div>
      </div>

      {/* Record Utility Bill Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-slide-in my-8">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-850 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  নতুন ইউটিলিটি বিল তৈরি করুন (Record Utility Bill)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateBill} className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unit Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-455 block mb-1">ইউনিট নির্বাচন *</label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-95 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-350"
                    required
                  >
                    <option value="">-- Choose Unit --</option>
                    {propertyUnits.map(u => (
                      <option key={u.id} value={u.id}>{u.number} ({u.type.toUpperCase()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-455 block mb-1">বিলিং মাস</label>
                  <input 
                    type="text" 
                    value={billingMonth}
                    onChange={(e) => setBillingMonth(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-95 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
              </div>

              {/* Real-time tenant info display */}
              {activeTenant && (
                <div className="p-3.5 bg-sky-500/5 border border-sky-500/10 rounded-2xl flex justify-between items-center text-xs animate-slide-in">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-extrabold text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3" /> বর্তমান ভাড়াটিয়া তথ্য
                    </span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm">{activeTenant.name}</strong>
                    <p className="text-slate-500 text-[10px]">মোবাইল: {activeTenant.phone} • পেশা: {activeTenant.occupation || 'N/A'}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">মাসিক ফ্ল্যাট ভাড়া</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm">৳ {selectedUnit?.rentAmount.toLocaleString()}</strong>
                    <p className="text-slate-500 text-[10px]">সার্ভিস চার্জ: ৳ {selectedUnit?.serviceCharge.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Electricity section */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-95/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-3">
                  <span className="font-extrabold text-amber-500 uppercase tracking-wide block border-b border-slate-100 dark:border-slate-800/60 pb-1.5 font-bold">১. বিদ্যুৎ বিল (Electricity Meter)</span>
                  <div>
                    <label className="text-[10px] text-slate-550 block mb-1">পূর্ববর্তী রিডিং (Previous Reading)</label>
                    <input 
                      type="number" 
                      value={elecPrev}
                      onChange={(e) => setElecPrev(e.target.value)}
                      placeholder="e.g. 12450"
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-550 block mb-1">বর্তমান রিডিং (Current Reading)</label>
                    <input 
                      type="number" 
                      value={elecCurr}
                      onChange={(e) => setElecCurr(e.target.value)}
                      placeholder="e.g. 12790"
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-550 block mb-1">ইউনিট প্রতি মূল্য (৳ Rate per Unit)</label>
                    <input 
                      type="number" 
                      value={elecRate}
                      onChange={(e) => setElecRate(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                </div>

                {/* Gas billing section */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-95/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-3">
                  <span className="font-extrabold text-sky-500 uppercase tracking-wide block border-b border-slate-100 dark:border-slate-800/60 pb-1.5 font-bold">২. গ্যাস বিল (Gas Billing)</span>
                  <div>
                    <label className="text-[10px] text-slate-550 block mb-1">গ্যাস বিলের ধরন</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setGasType('fixed')}
                        className={`w-1/2 p-2 rounded-xl text-[10px] font-bold border transition-all ${
                          gasType === 'fixed' 
                            ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 bg-white dark:bg-slate-900'
                        }`}
                      >
                        ফিক্সড রেট (Fixed)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGasType('measured')}
                        className={`w-1/2 p-2 rounded-xl text-[10px] font-bold border transition-all ${
                          gasType === 'measured' 
                            ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 bg-white dark:bg-slate-900'
                        }`}
                      >
                        মিটার ইউনিট
                      </button>
                    </div>
                  </div>

                  {gasType === 'fixed' ? (
                    <div>
                      <label className="text-[10px] text-slate-550 block mb-1">গ্যাস বিলের পরিমাণ (৳ Fixed Rate)</label>
                      <input 
                        type="number" 
                        value={gasFixed}
                        onChange={(e) => setGasFixed(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 animate-slide-in">
                      <div>
                        <label className="text-[10px] text-slate-550 block mb-1">গ্যাস পূর্ববর্তী রিডিং</label>
                        <input 
                          type="number" 
                          value={gasPrev}
                          onChange={(e) => setGasPrev(e.target.value)}
                          placeholder="e.g. 480"
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-550 block mb-1">গ্যাস বর্তমান রিডিং</label>
                        <input 
                          type="number" 
                          value={gasCurr}
                          onChange={(e) => setGasCurr(e.target.value)}
                          placeholder="e.g. 510"
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-550 block mb-1">ইউনিট প্রতি মূল্য (৳ Rate per Unit)</label>
                        <input 
                          type="number" 
                          value={gasRate}
                          onChange={(e) => setGasRate(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Garage & water section */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-95/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-3">
                  <span className="font-extrabold text-purple-500 uppercase tracking-wide block border-b border-slate-100 dark:border-slate-800/60 pb-1.5 font-bold">৩. অন্যান্য বিল (Others)</span>
                  <div>
                    <label className="text-[10px] text-slate-550 block mb-1">গ্যারেজ / পার্কিং ফি (৳ Optional)</label>
                    <input 
                      type="number" 
                      value={garageBill}
                      onChange={(e) => setGarageBill(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-550 block mb-1">পানি বিল (৳ Water Bill)</label>
                    <input 
                      type="number" 
                      value={waterBill}
                      onChange={(e) => setWaterBill(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all"
                >
                  বাতিল (Cancel)
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-md shadow-emerald-500/10 transition-all"
                >
                  বিল প্রস্তুত করুন (Process)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extended Utilities Table */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-200 dark:border-blue-900/30">
        <div className="flex justify-between items-center mb-4">
          <span className="font-extrabold text-sm text-slate-850 dark:text-slate-150 font-extrabold">Meters Billing Register (ইউটিলিটি বিলের তালিকা)</span>
          <span className="text-xs text-slate-400">{filteredUtilities.length} Records found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-blue-950/40 text-slate-455 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 font-bold">ফ্ল্যাট / ইউনিট</th>
                <th className="py-3 font-bold">ভাড়াটিয়া</th>
                <th className="py-3 font-bold">১. বিদ্যুৎ বিল (ইলেকট্রিসিটি)</th>
                <th className="py-3 font-bold">২. গ্যাস বিল (গ্যাস)</th>
                <th className="py-3 font-bold">৩. পার্কিং / পানি</th>
                <th className="py-3 font-bold">ইউটিলিটি মোট</th>
                <th className="py-3 font-bold text-center">ভাড়ার সাথে সংযুক্ত চালান</th>
                <th className="py-3 text-right font-bold">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-950/30 text-slate-700 dark:text-slate-350">
              {filteredUtilities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    এই মাস এবং প্রপার্টির জন্য কোনো ইউটিলিটি বিল রেকর্ড করা হয়নি।
                  </td>
                </tr>
              ) : (
                filteredUtilities.map((ut) => {
                  const unit = units.find(u => u.id === ut.unitId);
                  const tenant = tenants.find(t => t.unitId === ut.unitId && t.status === 'active');
                  
                  // Retrieve invoice details to check payment state
                  const linkedInvoice = invoices.find(i => 
                    i.tenantId === (tenant?.id || '') && 
                    i.billingMonth === ut.billingMonth && 
                    i.invoiceType === 'rent'
                  );

                  // Safe rendering for legacy schema
                  const isExtended = ut.electricityPrev !== undefined;
                  
                  return (
                    <tr key={ut.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-955/10">
                      
                      {/* Unit number */}
                      <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100">
                        {unit?.number || 'N/A'}
                      </td>

                      {/* Current Tenant */}
                      <td className="py-3.5">
                        {tenant ? (
                          <div>
                            <strong className="text-slate-800 dark:text-slate-200 block font-bold">{tenant.name}</strong>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{tenant.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-450 dark:text-slate-600">ভাড়াটিয়া নেই</span>
                        )}
                      </td>

                      {/* Electricity Breakdown */}
                      <td className="py-3.5">
                        {isExtended ? (
                          <div>
                            <span className="text-slate-800 dark:text-slate-200 block font-bold">৳ {ut.electricityBill.toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block">
                              {ut.electricityCurr - ut.electricityPrev} U @ ৳{ut.electricityRate}
                            </span>
                          </div>
                        ) : (
                          ut.utilityType === 'electricity' ? `৳ ${ut.calculatedBill.toLocaleString()} (Legacy)` : '-'
                        )}
                      </td>

                      {/* Gas Breakdown */}
                      <td className="py-3.5 font-medium">
                        {isExtended ? (
                          <div>
                            <span className="text-slate-800 dark:text-slate-200 block font-bold">৳ {ut.gasBill.toLocaleString()}</span>
                            {ut.gasType === 'measured' ? (
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block">
                                {ut.gasCurr! - ut.gasPrev!} U @ ৳{ut.gasRate}
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block">Fixed Rate</span>
                            )}
                          </div>
                        ) : (
                          ut.utilityType === 'gas' ? `৳ ${ut.calculatedBill.toLocaleString()} (Legacy)` : '-'
                        )}
                      </td>

                      {/* Garage & Water */}
                      <td className="py-3.5">
                        {isExtended ? (
                          <div className="space-y-0.5">
                            {ut.waterBill > 0 && <span className="block">পানি: ৳{ut.waterBill}</span>}
                            {ut.garageBill > 0 && <span className="block text-sky-600 dark:text-sky-400 font-bold">গ্যারেজ: ৳{ut.garageBill}</span>}
                            {ut.waterBill === 0 && ut.garageBill === 0 && <span>-</span>}
                          </div>
                        ) : (
                          ut.utilityType === 'water' ? `৳ ${ut.calculatedBill.toLocaleString()} (Legacy)` : '-'
                        )}
                      </td>

                      {/* Total Utility Bill */}
                      <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100">
                        ৳ {ut.calculatedBill.toLocaleString()}
                      </td>

                      {/* Combined Rent Invoice Status */}
                      <td className="py-3.5 text-center">
                        {linkedInvoice ? (
                          <div className="inline-flex flex-col items-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                              linkedInvoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }`}>
                              {linkedInvoice.status}
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-1">৳ {linkedInvoice.amount.toLocaleString()} Total</span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">No Invoice</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteBill(ut)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors border border-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
