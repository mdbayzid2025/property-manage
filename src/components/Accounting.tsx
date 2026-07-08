import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, AccountTransaction, Property } from '../services/db';
import { BookOpen, Plus, Landmark, ArrowUpRight, ArrowDownRight, Calendar, FileText, Clipboard, Filter } from 'lucide-react';

export default function Accounting({ companyId }: { companyId: string }) {
  const { t } = useTranslation();

  // DB tables
  const [txs, setTxs] = useState<AccountTransaction[]>(() => 
    MockDB.getTable<AccountTransaction>('transactions').filter(t => t.companyId === companyId)
  );

  const [properties] = useState<Property[]>(() => 
    MockDB.getTable<Property>('properties').filter(p => p.companyId === companyId)
  );

  // Property filtering state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Rent Revenue');
  const [account, setAccount] = useState('Cashbook');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [note, setNote] = useState('');

  // Filter transactions based on selected property filter
  const filteredTxs = selectedPropertyId 
    ? txs.filter(t => t.propertyId === selectedPropertyId)
    : txs;

  // Calculations
  const revenue = filteredTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = filteredTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const profit = revenue - expense;

  // Chart of accounts summary map
  const accountsMap = filteredTxs.reduce((acc, tx) => {
    if (!acc[tx.category]) acc[tx.category] = 0;
    acc[tx.category] += tx.type === 'income' ? tx.amount : -tx.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (isNaN(val) || val <= 0 || !description.trim()) return;

    const newTx = MockDB.insert<AccountTransaction>('transactions', {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      companyId,
      date,
      type: txType,
      category,
      account,
      amount: val,
      description,
      propertyId,
      invoiceNo: invoiceNo.trim() || undefined,
      note: note.trim() || undefined
    });

    setTxs(prev => [newTx, ...prev]);
    setAmount('');
    setDescription('');
    setInvoiceNo('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
    alert('Accounting transaction recorded!');
  };

  const getPropertyName = (pId?: string) => {
    if (!pId) return 'General (সাধারণ)';
    const prop = properties.find(p => p.id === pId);
    return prop ? prop.name : 'General (সাধারণ)';
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('accountingSystem')}</h2>
            <p className="text-xs text-slate-400">Chart of accounts, general cashbook ledger, double entry journals and profit-loss statements</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Property Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-slate-600">Property:</span>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-900 cursor-pointer"
            >
              <option value="">All Properties (সব প্রোপার্টি)</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Petty Cash Entry
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateTx} className="bg-white/95 rounded-2xl p-6 border border-slate-200/80 shadow-xl shadow-indigo-950/5 grid grid-cols-1 md:grid-cols-3 gap-5 animate-slide-in border-t-4 border-t-indigo-500">
          <div className="md:col-span-3 flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Add Petty Cash Transaction (নতুন ক্যাশ লেনদেন)
            </h3>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Property Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Property (প্রোপার্টি) *</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              required
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Transaction Type</label>
            <select
              value={txType}
              onChange={(e: any) => {
                setTxType(e.target.value);
                setCategory(e.target.value === 'income' ? 'Rent Revenue' : 'Salary Expense');
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
            >
              <option value="income">Debit - Cash Inflow (আয়)</option>
              <option value="expense">Credit - Cash Outflow (ব্যয়)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Accounting Ledger Code</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
            >
              {txType === 'income' ? (
                <>
                  <option value="Rent Revenue">Rent Revenue (ভাড়া বাবদ আয়)</option>
                  <option value="Booking Revenue">Booking Revenue (বুকিং বাবদ আয়)</option>
                  <option value="Other Income">Other Income (অন্যান্য আয়)</option>
                </>
              ) : (
                <>
                  <option value="Salary Expense">Salary Expense (কর্মচারী বেতন)</option>
                  <option value="Maintenance Cost">Maintenance Cost (রক্ষণাবেক্ষণ ব্যয়)</option>
                  <option value="Utility Expense">Utility Expense (ইউটিলিটি বিল)</option>
                  <option value="Office Rent">Office Rent / General Expense</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Payment Channel</label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
            >
              <option value="Cashbook">Petty Cashbook (নগদ ক্যাশ)</option>
              <option value="Bank Account">Bank Current Account (ব্যাংক হিসাব)</option>
              <option value="bKash Merchant">bKash Wallet Merchant</option>
              <option value="Nagad Merchant">Nagad Wallet Merchant</option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date (তারিখ) *
            </label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              required
            />
          </div>

          {/* Invoice No */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Invoice / Memo No (ইনভয়েস নং)
            </label>
            <input 
              type="text" 
              placeholder="e.g. INV-2026-001"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Transaction Value (BDT) *</label>
            <input 
              type="number" 
              placeholder="e.g. 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Memo Narration *</label>
            <input 
              type="text" 
              placeholder="e.g. অফিস পেপার ও চা নাস্তা ক্রয়"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              required
            />
          </div>

          {/* Note Field */}
          <div className="md:col-span-3">
            <label className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center gap-1">
              <Clipboard className="w-3.5 h-3.5 text-slate-400" />
              Note / Comments (অতিরিক্ত মন্তব্য)
            </label>
            <textarea 
              placeholder="Enter details or comments about this transaction..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium resize-none"
            />
          </div>

          <div className="md:col-span-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/15 hover:shadow-lg transition-all cursor-pointer"
            >
              Record Journal Double Entry
            </button>
          </div>
        </form>
      )}

      {/* Financial Statement Summaries (Profit & Loss / Cash Flow) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total Revenue</span>
            <p className="text-xl font-black text-emerald-500">৳ {revenue.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total Expenses</span>
            <p className="text-xl font-black text-rose-500">৳ {expense.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Net Operating Profit</span>
            <p className="text-xl font-black text-indigo-500 dark:text-indigo-400">৳ {profit.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cashbook Ledger list */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 space-y-4">
          <span className="font-bold text-sm block">Journal Book ledger</span>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-blue-950/40 text-slate-400">
                  <th className="py-2.5 font-medium">Date</th>
                  <th className="py-2.5 font-medium">Property / Ledger</th>
                  <th className="py-2.5 font-medium font-bold text-slate-500">Invoice No</th>
                  <th className="py-2.5 font-medium">Narration Description</th>
                  <th className="py-2.5 text-right font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-950/30">
                {filteredTxs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">No transactions recorded for this selection.</td>
                  </tr>
                ) : (
                  filteredTxs.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-950/10">
                      <td className="py-3 text-slate-400">{t.date}</td>
                      <td className="py-3 font-semibold">
                        <span className="text-xs block text-slate-800 dark:text-slate-200">{getPropertyName(t.propertyId)}</span>
                        <span className="text-[10px] text-slate-500 block font-normal">{t.category} via {t.account}</span>
                      </td>
                      <td className="py-3 text-slate-500 font-semibold">{t.invoiceNo || '-'}</td>
                      <td className="py-3 text-slate-400">
                        <div>{t.description}</div>
                        {t.note && <div className="text-[10px] text-slate-500 italic mt-0.5">Note: {t.note}</div>}
                      </td>
                      <td className={`py-3 text-right font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === 'income' ? '+' : '-'} ৳{t.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trial Balance Chart of Accounts ledger overview */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 space-y-4">
          <span className="font-bold text-sm block">Chart of Accounts Trial Balance</span>
          
          <div className="space-y-3.5">
            {Object.keys(accountsMap).length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No accounts data.</p>
            ) : (
              Object.entries(accountsMap).map(([accountName, bal]) => (
                <div key={accountName} className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-blue-950/30">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{accountName}</span>
                    <p className="text-[9px] text-slate-500">General Ledger Account</p>
                  </div>
                  <span className={`font-bold ${bal >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    ৳ {bal.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
