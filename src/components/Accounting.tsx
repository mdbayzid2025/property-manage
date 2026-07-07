import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, AccountTransaction } from '../services/db';
import { BookOpen, Plus, Landmark, ArrowUpRight, ArrowDownRight, Printer } from 'lucide-react';

export default function Accounting({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // DB tables
  const [txs, setTxs] = useState<AccountTransaction[]>(() => 
    MockDB.getTable<AccountTransaction>('transactions').filter(t => t.companyId === companyId)
  );

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Rent Revenue');
  const [account, setAccount] = useState('Cashbook');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Calculations
  const revenue = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const profit = revenue - expense;

  // Chart of accounts summary map
  const accountsMap = txs.reduce((acc, tx) => {
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
      date: new Date().toISOString().split('T')[0],
      type: txType,
      category,
      account,
      amount: val,
      description
    });

    setTxs(prev => [newTx, ...prev]);
    setAmount('');
    setDescription('');
    setShowAddForm(false);
    alert('Accounting transaction recorded!');
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('accountingSystem')}</h2>
            <p className="text-xs text-slate-400">Chart of accounts, general cashbook ledger, double entry journals and profit-loss statements</p>
          </div>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          Petty Cash Entry
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateTx} className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-in">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Transaction Type</label>
            <select
              value={txType}
              onChange={(e: any) => {
                setTxType(e.target.value);
                setCategory(e.target.value === 'income' ? 'Rent Revenue' : 'Salary Expense');
              }}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none"
            >
              <option value="income">Debit - Cash Inflow (আয়)</option>
              <option value="expense">Credit - Cash Outflow (ব্যয়)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Accounting Ledger Code</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none text-slate-300"
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
            <label className="text-xs text-slate-400 block mb-1">Payment Channel</label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none text-slate-300"
            >
              <option value="Cashbook">Petty Cashbook (নগদ ক্যাশ)</option>
              <option value="Bank Account">Bank Current Account (ব্যাংক হিসাব)</option>
              <option value="bKash Merchant">bKash Wallet Merchant</option>
              <option value="Nagad Merchant">Nagad Wallet Merchant</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Transaction Value (BDT)</label>
            <input 
              type="number" 
              placeholder="e.g. 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 block mb-1">Memo Narration</label>
            <input 
              type="text" 
              placeholder="e.g. অফিস পেপার ও চা নাস্তা ক্রয়"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none"
              required
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button 
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
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
            <p className="text-xl font-black text-emerald-400">৳ {revenue.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total Expenses</span>
            <p className="text-xl font-black text-rose-400">৳ {expense.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Net Operating Profit</span>
            <p className="text-xl font-black text-sky-400">৳ {profit.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
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
                  <th className="py-2.5 font-medium">Account / Ledger</th>
                  <th className="py-2.5 font-medium">Narration Description</th>
                  <th className="py-2.5 text-right font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-950/30">
                {txs.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-950/10">
                    <td className="py-3 text-slate-400">{t.date}</td>
                    <td className="py-3 font-semibold">
                      {t.category}
                      <span className="text-[9px] text-slate-500 block">via {t.account}</span>
                    </td>
                    <td className="py-3 text-slate-400">{t.description}</td>
                    <td className={`py-3 text-right font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'} ৳{t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trial Balance Chart of Accounts ledger overview */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 space-y-4">
          <span className="font-bold text-sm block">Chart of Accounts Trial Balance</span>
          
          <div className="space-y-3.5">
            {Object.entries(accountsMap).map(([accountName, bal]) => (
              <div key={accountName} className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                <div>
                  <span className="font-semibold text-slate-300">{accountName}</span>
                  <p className="text-[9px] text-slate-500">General Ledger Account</p>
                </div>
                <span className={`font-bold ${bal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ৳ {bal.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
