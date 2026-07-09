import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Invoice, Receipt, Tenant, Unit, AccountTransaction, Property } from '../services/db';
import { FileText, Printer, Plus, Search, Check, ChevronDown, Landmark, Trash2, X } from 'lucide-react';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
function toBanglaNumerals(num: string | number): string {
  return String(num).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

const MONTH_OPTIONS = [
  { en: 'January', bn: 'জানুয়ারি' },
  { en: 'February', bn: 'ফেব্রুয়ারি' },
  { en: 'March', bn: 'মার্চ' },
  { en: 'April', bn: 'এপ্রিল' },
  { en: 'May', bn: 'মে' },
  { en: 'June', bn: 'জুন' },
  { en: 'July', bn: 'জুলাই' },
  { en: 'August', bn: 'আগস্ট' },
  { en: 'September', bn: 'সেপ্টেম্বর' },
  { en: 'October', bn: 'অক্টোবর' },
  { en: 'November', bn: 'নভেম্বর' },
  { en: 'December', bn: 'ডিসেম্বর' }
];

export default function RentManager({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // Load state from DB
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    MockDB.getTable<Invoice>('invoices').filter(i => i.companyId === companyId)
  );
  const [receipts, setReceipts] = useState<Receipt[]>(() => MockDB.getTable<Receipt>('receipts'));
  const [tenants] = useState<Tenant[]>(() => MockDB.getTable<Tenant>('tenants'));
  const [units] = useState<Unit[]>(() => MockDB.getTable<Unit>('units'));
  const [properties] = useState<Property[]>(() =>
    MockDB.getTable<Property>('properties').filter(p => p.companyId === companyId)
  );

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('July');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Modals & Single Print
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [isPrintingAll, setIsPrintingAll] = useState(false);
  const [printTemplate, setPrintTemplate] = useState<'a4' | 'thermal80'>('a4');

  // Input states for Manual Rent Invoice
  const [tenantId, setTenantId] = useState('');
  const [amount, setAmount] = useState('');
  const [billingMonth, setBillingMonth] = useState('July 2026');
  const [details, setDetails] = useState('');

  const handleTenantSelect = (id: string) => {
    setTenantId(id);
    const tenant = tenants.find(t => t.id === id);
    const unit = units.find(u => u.id === tenant?.unitId);
    if (unit) {
      setAmount(String(unit.rentAmount + 3000)); // Rent + Utilities default
      setDetails(`ভাড়া: ${unit.rentAmount.toLocaleString()}৳, ইউটিলিটি: ৩,০০০৳`);
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!tenantId || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    const newInvoice = MockDB.insert<Invoice>('invoices', {
      id: 'inv_' + Math.random().toString(36).substr(2, 9),
      companyId,
      unitId: tenant.unitId,
      tenantId,
      invoiceType: 'rent',
      amount: parsedAmount,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      billingMonth,
      status: 'pending',
      paidAmount: 0,
      details: details || 'ভাড়া এবং ইউটিলিটি বিলিং'
    });

    setInvoices(prev => [...prev, newInvoice]);
    setTenantId('');
    setAmount('');
    setDetails('');
    setShowAddForm(false);
  };

  const markAsPaidManually = (inv: Invoice) => {
    const method = prompt('Payment Method? (Cash / Bank / Cheque)', 'Cash');
    if (!method) return;

    MockDB.update<Invoice>('invoices', inv.id, {
      status: 'paid',
      paidAmount: inv.amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: method
    });

    const nextRcptNo = 'MR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    MockDB.insert<Receipt>('receipts', {
      id: 'rcpt_' + Math.random().toString(36).substr(2, 9),
      invoiceId: inv.id,
      receiptNumber: nextRcptNo,
      receivedAmount: inv.amount,
      receivedDate: new Date().toISOString().split('T')[0],
      receivedBy: 'Manager Accounts',
      paymentMethod: method,
      remarks: 'পরিশোধিত ক্যাশ কাউন্টার'
    });

    MockDB.insert<AccountTransaction>('transactions', {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      companyId: inv.companyId,
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: 'Rent Revenue',
      account: method === 'Cash' ? 'Cashbook' : 'Bank Account',
      amount: inv.amount,
      description: `ভাড়া আদায়: ${tenants.find(t => t.id === inv.tenantId)?.name || ''}`
    });

    setInvoices(MockDB.getTable<Invoice>('invoices').filter(i => i.companyId === companyId));
    setReceipts(MockDB.getTable<Receipt>('receipts'));
    alert('Bill Marked as Paid & Receipt Created!');
  };

  const handleDeleteInvoice = (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    MockDB.delete('invoices', id);
    setInvoices(MockDB.getTable<Invoice>('invoices').filter(i => i.companyId === companyId));
  };

  // Filter Logic
  const filteredInvoices = invoices.filter(inv => {
    const tenant = tenants.find(t => t.id === inv.tenantId);
    const unit = units.find(u => u.id === inv.unitId);

    // Search by Name or Mobile
    const matchesSearch = tenant
      ? (tenant.name.toLowerCase().includes(search.toLowerCase()) || tenant.phone.includes(search))
      : false;

    // Filter by Property
    const matchesProperty = !selectedPropertyId || (unit && unit.propertyId === selectedPropertyId);

    // Filter by Month & Year (formatted like "July 2026")
    const matchesMonthYear = inv.billingMonth === `${selectedMonth} ${selectedYear}`;

    return matchesSearch && matchesProperty && matchesMonthYear;
  });

  // Totals calculations
  const totalReceivable = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCollected = filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalDues = filteredInvoices.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

  const selectedMonthBn = MONTH_OPTIONS.find(m => m.en === selectedMonth)?.bn || selectedMonth;

  return (
    <div className="space-y-6 text-sm">
      
      {/* Header Bar */}
      <div className="no-print flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('rentMgmt')}</h2>
            <p className="text-xs text-slate-400">Generate rent ledgers, auto invoices, collect cash and print money receipts</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsPrintingAll(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-880 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4 text-sky-500" />
            {lang === 'bn' ? 'সকল বিল প্রিন্ট করুন' : 'Print All Receipts'}
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            নতুন বিল যোগ করুন
          </button>
        </div>
      </div>

      {/* Manual Invoice Entry Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto no-print">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-in my-8">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-850 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  নতুন বিল যোগ করুন (Create Rent Invoice)
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
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Select Tenant *</label>
                  <select
                    value={tenantId}
                    onChange={(e) => handleTenantSelect(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-90/60 border border-slate-200 dark:border-slate-80 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-350"
                    required
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100">-- Choose Active Tenant --</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-100">
                        {t.name} ({units.find(u => u.id === t.unitId)?.number})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Billing Month *</label>
                  <input
                    type="text"
                    value={billingMonth}
                    onChange={(e) => setBillingMonth(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-90/60 border border-slate-200 dark:border-slate-80 rounded-xl text-xs outline-none text-slate-850 dark:text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Amount (BDT) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-90/60 border border-slate-200 dark:border-slate-80 rounded-xl text-xs outline-none text-slate-855 dark:text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Breakdown & Details</label>
                  <input
                    type="text"
                    placeholder="ভাড়া: ২০০০০৳, সার্ভিস: ৩০০০৳"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-90/60 border border-slate-200 dark:border-slate-80 rounded-xl text-xs outline-none text-slate-855 dark:text-slate-100"
                  />
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
                  চালান ইস্যু করুন (Issue Invoice)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="no-print glass-panel rounded-2xl p-4 border border-slate-200 dark:border-blue-900/30 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'ভাড়াটিয়ার নাম বা মোবাইল নম্বর দিয়ে সার্চ...' : 'Search by tenant name or mobile...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-955/40 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 md:w-1/2">
          {/* Property Filter */}
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-955/40 rounded-xl text-xs outline-none text-slate-850 dark:text-slate-200"
          >
            <option value="">{lang === 'bn' ? 'সকল প্রোপার্টি' : 'All Properties'}</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-955/40 rounded-xl text-xs outline-none text-slate-850 dark:text-slate-200"
          >
            {MONTH_OPTIONS.map(m => (
              <option key={m.en} value={m.en}>{lang === 'bn' ? m.bn : m.en}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-955/40 rounded-xl text-xs outline-none text-slate-855 dark:text-slate-200"
          >
            <option value="2024">২০২৪</option>
            <option value="2025">২০২৫</option>
            <option value="2026">২০২৬</option>
            <option value="2027">২০২৭</option>
          </select>
        </div>
      </div>

      {/* Main Single Data Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-sm block text-slate-800 dark:text-slate-200">
            {lang === 'bn' ? `ভাড়া কালেকশন রেজিস্টার (${selectedMonthBn} - ${toBanglaNumerals(selectedYear)})` : `Rent Collection Register (${selectedMonth} ${selectedYear})`}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-blue-955/50">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-blue-955/20 text-slate-500 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-blue-955/60 text-xs">
                <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/40 w-12">ক্র. নং</th>
                <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/40 text-left">বিল্ডিং ও ফ্ল্যাট</th>
                <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/40 text-left">ভাড়াটিয়ার বিবরণ (নাম ও মোবাইল)</th>
                <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/40 text-left">মাসিক ভাড়া ও ইউটিলিটি বিবরণী</th>
                <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/40">বিলিং মাস</th>
                <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/40">আদায়কৃত টাকা</th>
                <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/40">বকেয়া টাকা</th>
                <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/40">স্ট্যাটাস</th>
                <th className="py-3 px-2 no-print">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 dark:divide-blue-955/20">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-medium italic">
                    {lang === 'bn' ? 'কোনো ডাটা পাওয়া যায়নি।' : 'No records found for current filters.'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, index) => {
                  const tenant = tenants.find(t => t.id === inv.tenantId);
                  const unit = units.find(u => u.id === inv.unitId);
                  const property = properties.find(p => p.id === unit?.propertyId);
                  const due = inv.amount - inv.paidAmount;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-955/10 text-slate-700 dark:text-slate-350">
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/20 font-semibold">
                        {lang === 'bn' ? toBanglaNumerals(index + 1) : index + 1}
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/20 text-left">
                        <span className="font-bold block text-slate-800 dark:text-slate-100">{property?.name.split(' (')[0]}</span>
                        <span className="text-[10px] text-slate-400 block">Flat: {unit?.number}</span>
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/20 text-left">
                        <span className="font-bold block text-slate-900 dark:text-slate-100">{tenant?.name}</span>
                        <span className="text-[10px] text-slate-500 block">{tenant?.phone}</span>
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/20 text-left">
                        <span className="font-bold text-slate-800 dark:text-slate-200">৳ {inv.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 block italic">{inv.details}</span>
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/20 font-medium">
                        {inv.billingMonth}
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/20 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                        ৳ {inv.paidAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/20 font-bold text-rose-500 bg-rose-500/5">
                        ৳ {due.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-955/20">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                          inv.status === 'due' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-2 no-print space-x-1.5 whitespace-nowrap">
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => markAsPaidManually(inv)}
                            className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-955 font-bold rounded-lg text-[10px]"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => setActiveInvoice(inv)}
                          className="px-2 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 font-semibold rounded-lg text-[10px]"
                        >
                          রিসিপ্ট
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv.id)}
                          className="p-1 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all inline-block align-middle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Bottom Grand Totals Row */}
              {filteredInvoices.length > 0 && (
                <tr className="bg-indigo-50/80 dark:bg-indigo-950/50 text-slate-900 dark:text-white font-extrabold text-xs border-t-2 border-b-2 border-indigo-200 dark:border-indigo-900/60 shadow-sm">
                  <td colSpan={3} className="py-3.5 px-2 border-r border-slate-200 dark:border-blue-955/40 text-right">
                    {lang === 'bn' ? 'সর্বমোট প্রদেয় ভাড়া এবং বকেয়া =' : 'Grand Total Dues & Collected ='}
                  </td>
                  <td className="py-3.5 px-2 border-r border-slate-200 dark:border-blue-955/40 font-black text-sm text-indigo-600 dark:text-indigo-400">
                    ৳ {totalReceivable.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-2 border-r border-slate-200 dark:border-blue-955/40"></td>
                  <td className="py-3.5 px-2 border-r border-slate-200 dark:border-blue-955/40 font-black text-emerald-600 bg-emerald-500/10 text-sm">
                    ৳ {totalCollected.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-2 border-r border-slate-200 dark:border-blue-955/40 font-black text-rose-500 bg-rose-500/10 text-sm">
                    ৳ {totalDues.toLocaleString()}
                  </td>
                  <td colSpan={2} className="py-3.5 px-2"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details / Printing Modal Overlay */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto no-print">
          <div className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl glass-panel border border-slate-200 dark:border-blue-900/30 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setPrintTemplate('a4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${printTemplate === 'a4' ? 'bg-sky-500 text-white' : 'text-slate-655'}`}
                >
                  A4 Invoice Copy
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 text-slate-955 font-bold rounded-lg text-xs flex items-center gap-1"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Print Area Preview */}
            <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-950 print-area">
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-extrabold text-sky-600 tracking-wide uppercase">বঙ্গ প্রপার্টি ইআরপি</h2>
                    <p className="text-[10px] text-slate-500 mt-1">মডেল কোয়ালিটি রসিদ বিবরণী</p>
                    <p className="text-[10px] text-slate-500">হটলাইন: ০১৭২৪-৫৬১৬৭০</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-700 block">মাসিক ভাড়া ও ইউটিলিটি রশিদ</span>
                    <span className="text-xs text-slate-400">Invoice No: MR-2026-{activeInvoice.id.substr(0,4).toUpperCase()}</span>
                  </div>
                </div>

                <hr className="border-slate-200" />

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold">ভাড়াটিয়ার বিবরণ (Tenant Details):</span>
                    <p className="font-bold text-slate-800 mt-1">{tenants.find(t => t.id === activeInvoice.tenantId)?.name}</p>
                    <p className="text-slate-650">Unit: {units.find(u => u.id === activeInvoice.unitId)?.number}</p>
                    <p className="text-slate-655">Phone: {tenants.find(t => t.id === activeInvoice.tenantId)?.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block uppercase font-bold">পেমেন্ট স্ট্যাটাস (Status):</span>
                    <p className="font-bold text-emerald-600 mt-1 uppercase text-sm">{activeInvoice.status}</p>
                    <p className="text-slate-650">পরিশোধের মাধ্যম: {activeInvoice.paymentMethod || 'Cash'}</p>
                    <p className="text-slate-655">তারিখ: {activeInvoice.paymentDate || 'N/A'}</p>
                  </div>
                </div>

                <table className="w-full text-left text-xs border border-slate-200 divide-y divide-slate-200 mt-6">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 font-semibold text-slate-700">বিবরণ (Description)</th>
                      <th className="p-3 text-right font-semibold text-slate-700">পরিমাণ (Amount)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 text-slate-800 font-medium">
                        {activeInvoice.billingMonth} Rent + Service & Utilities Combined
                        <span className="text-[10px] text-slate-400 block mt-1">{activeInvoice.details}</span>
                      </td>
                      <td className="p-3 text-right text-slate-800 font-bold">৳ {activeInvoice.amount.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-800">
                      <td className="p-3 text-right">আদায়কৃত টাকা (Received Amount):</td>
                      <td className="p-3 text-right text-sky-600">৳ {activeInvoice.paidAmount.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-rose-50 font-bold text-rose-800">
                      <td className="p-3 text-right">অবশিষ্ট বকেয়া (Dues Outstanding):</td>
                      <td className="p-3 text-right">৳ {(activeInvoice.amount - activeInvoice.paidAmount).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALL RECEIPTS PRINT PREVIEW MODAL */}
      {isPrintingAll && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto no-print">
          <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl glass-panel border border-slate-200 dark:border-blue-900/30 flex flex-col max-h-[95vh]">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">সকল ভাড়াটিয়ার রসিদ প্রিন্ট প্রিভিউ</h3>
                <p className="text-xs text-slate-400">মোট {filteredInvoices.length}টি রশিদ প্রিন্ট করা হবে</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-955 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  প্রিন্ট করুন
                </button>
                <button
                  onClick={() => setIsPrintingAll(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-xl text-xs font-bold"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-950 print-area space-y-12">
              {filteredInvoices.map((inv, idx) => {
                const tenant = tenants.find(t => t.id === inv.tenantId);
                const unit = units.find(u => u.id === inv.unitId);
                const property = properties.find(p => p.id === unit?.propertyId);
                const due = inv.amount - inv.paidAmount;

                return (
                  <div key={inv.id} className="pb-8 border-b-2 border-dashed border-slate-300 last:border-0" style={{ pageBreakAfter: 'always' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-black text-sky-600 uppercase">বঙ্গ প্রপার্টি ইআরপি ({property?.name.split(' (')[0]})</h2>
                        <p className="text-[10px] text-slate-500">ডিজিটাল ভাড়া ও ইউটিলিটি বিলিং রসিদপত্র</p>
                        <p className="text-[10px] text-slate-500">হটলাইন: ০১৭২৪-৫৬১৬৭০</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg inline-block">রসিদপত্র নং: MR-{selectedYear}-{inv.id.substr(0,4).toUpperCase()}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">বিলিং মাস: {inv.billingMonth}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs mt-4 bg-slate-50 p-3 rounded-xl border border-slate-150">
                      <div>
                        <span className="text-slate-400 block uppercase font-bold text-[9px]">ভাড়াটিয়া (Tenant):</span>
                        <p className="font-bold text-slate-800 text-xs mt-0.5">{tenant?.name}</p>
                        <p className="text-slate-655 text-[10px]">ফ্ল্যাট/ইউনিট: {unit?.number}</p>
                        <p className="text-slate-655 text-[10px]">মোবাইল: {tenant?.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block uppercase font-bold text-[9px]">বিলিং স্ট্যাটাস (Status):</span>
                        <p className="font-extrabold text-rose-600 mt-0.5 uppercase text-xs">{inv.status}</p>
                        <p className="text-slate-655 text-[10px]">প্রদেয় শেষ তারিখ: {inv.dueDate}</p>
                      </div>
                    </div>

                    <table className="w-full text-left text-xs border border-slate-200 divide-y divide-slate-200 mt-4">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="p-2.5 font-semibold text-slate-700">ভাড়ার বিবরণী</th>
                          <th className="p-2.5 text-right font-semibold text-slate-700">টাকার পরিমাণ (BDT)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        <tr>
                          <td className="p-2.5 text-slate-800 font-medium">
                            মাসিক ভাড়া ও ইউটিলিটি বিল
                            <span className="text-[10px] text-slate-400 block mt-0.5 italic">{inv.details}</span>
                          </td>
                          <td className="p-2.5 text-right text-slate-800 font-bold">৳ {inv.amount.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold text-slate-800">
                          <td className="p-2.5 text-right">আদায়কৃত (Total Paid):</td>
                          <td className="p-2.5 text-right text-emerald-600">৳ {inv.paidAmount.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-rose-50 font-extrabold text-rose-900">
                          <td className="p-2.5 text-right">বকেয়া পাওনা (Total Dues):</td>
                          <td className="p-2.5 text-right text-rose-600">৳ {due.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex justify-between items-end pt-6 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">তৈরি করেছেন: বঙ্গ প্রপার্টি সিস্টেম</span>
                      </div>
                      <div className="text-center">
                        <div className="border-b border-slate-400 pb-0.5 px-6 font-bold text-slate-700">স্বাক্ষর</div>
                        <span className="text-[8px] text-slate-400 block mt-0.5">ম্যানেজার / হিসাবরক্ষক</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
