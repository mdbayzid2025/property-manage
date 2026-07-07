import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Invoice, Receipt, Tenant, Unit, AccountTransaction } from '../services/db';
import { FileText, Printer, DollarSign, Plus, Eye, Send, Share2, ShieldCheck } from 'lucide-react';

export default function RentManager({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // DB tables
  const [invoices, setInvoices] = useState<Invoice[]>(() => 
    MockDB.getTable<Invoice>('invoices').filter(i => i.companyId === companyId)
  );
  const [receipts, setReceipts] = useState<Receipt[]>(() => MockDB.getTable<Receipt>('receipts'));
  const [tenants] = useState<Tenant[]>(() => MockDB.getTable<Tenant>('tenants'));
  const [units] = useState<Unit[]>(() => MockDB.getTable<Unit>('units'));

  // Modals / Prints State
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [printTemplate, setPrintTemplate] = useState<'a4' | 'thermal80' | 'thermal58'>('a4');

  // Input states for Manual Rent Invoice creation
  const [tenantId, setTenantId] = useState('');
  const [amount, setAmount] = useState('');
  const [billingMonth, setBillingMonth] = useState('July 2026');
  const [details, setDetails] = useState('');

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!tenantId || isNaN(parsedAmount) || parsedAmount <= 0) return;

    // Find tenant unit
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    const newInvoice = MockDB.insert<Invoice>('invoices', {
      id: 'inv_' + Math.random().toString(36).substr(2, 9),
      companyId,
      unitId: tenant.unitId,
      tenantId,
      invoiceType: 'rent',
      amount: parsedAmount,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days expiry
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

    // Update DB
    MockDB.update<Invoice>('invoices', inv.id, {
      status: 'paid',
      paidAmount: inv.amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: method
    });

    const nextRcptNo = 'MR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newRcpt = MockDB.insert<Receipt>('receipts', {
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

  return (
    <div className="space-y-6 text-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('rentMgmt')}</h2>
            <p className="text-xs text-slate-400">Generate rent ledgers, auto invoices, collect cash and print money receipts</p>
          </div>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Rent Invoice
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateInvoice} className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-in">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Select Tenant</label>
            <select 
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-300"
              required
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">-- Choose Active Tenant --</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{t.name} ({units.find(u => u.id === t.unitId)?.number})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Billing Month</label>
            <input 
              type="text" 
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Amount (BDT)</label>
            <input 
              type="number" 
              placeholder="e.g. 25000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-100"
              required
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/10"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      )}

      {/* Invoice Ledger Tables */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
        <span className="font-bold text-sm block mb-4">Rent Ledger & Payments Index</span>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-blue-950/40 text-slate-400">
                <th className="py-3 font-medium">Tenant & Flat</th>
                <th className="py-3 font-medium">Cycle</th>
                <th className="py-3 font-medium">Dues / Total</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-950/30">
              {invoices.map((inv) => {
                const tenant = tenants.find(t => t.id === inv.tenantId);
                const unit = units.find(u => u.id === inv.unitId);
                const rcpt = receipts.find(r => r.invoiceId === inv.id);
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-950/10">
                    <td className="py-3 font-semibold text-slate-300">
                      {tenant?.name}
                      <span className="text-[10px] text-slate-500 block">Unit: {unit?.number} • {tenant?.phone}</span>
                    </td>
                    <td className="py-3 font-medium">{inv.billingMonth}</td>
                    <td className="py-3">
                      <span className="font-semibold block text-slate-800 dark:text-slate-300">৳ {inv.amount.toLocaleString()}</span>
                      {inv.status !== 'paid' && (
                        <span className="text-[9px] text-rose-500 dark:text-rose-400 block">Dues BDT: {(inv.amount - inv.paidAmount).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                        inv.status === 'due' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      {inv.status !== 'paid' && (
                        <button 
                          onClick={() => markAsPaidManually(inv)}
                          className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-[10px]"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button 
                        onClick={() => setActiveInvoice(inv)}
                        className="px-2 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 font-semibold rounded-lg text-[10px]"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details / Printing Modal Overlay */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto no-print">
          <div className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl glass-panel border border-slate-200 dark:border-blue-900/30 flex flex-col max-h-[90vh]">
            
            {/* Header Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex gap-2">
                <button 
                  onClick={() => setPrintTemplate('a4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${printTemplate === 'a4' ? 'bg-sky-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250'}`}
                >
                  A4 Corporate
                </button>
                <button 
                  onClick={() => setPrintTemplate('thermal80')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${printTemplate === 'thermal80' ? 'bg-sky-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250'}`}
                >
                  Thermal (80mm)
                </button>
                <button 
                  onClick={() => setPrintTemplate('thermal58')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${printTemplate === 'thermal58' ? 'bg-sky-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250'}`}
                >
                  Thermal (58mm)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button 
                  onClick={() => setActiveInvoice(null)}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-400 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Print Area Preview */}
            <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-white text-slate-950 font-sans print-area">
              
              {printTemplate === 'a4' ? (
                /* A4 Corporate Layout */
                <div className="space-y-8 max-w-2xl mx-auto">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-extrabold text-sky-600 tracking-wide uppercase">বঙ্গ প্রপার্টি ইআরপি</h2>
                      <p className="text-[10px] text-slate-500 mt-1">মডেল কোয়ালিটি রিসিপ্ট অ্যান্ড পেমেন্ট</p>
                      <p className="text-[10px] text-slate-500">হটলাইন: ০১৭২৪-৫৬১৬৭০</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-700 block">টাকা প্রাপ্তির মানি রিসিট</span>
                      <span className="text-xs text-slate-400">Receipt No: MR-2026-{activeInvoice.id.substr(0,4).toUpperCase()}</span>
                    </div>
                  </div>

                  <hr className="border-slate-200" />

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block uppercase">ভাড়াটিয়ার বিবরণ (Tenant Details):</span>
                      <p className="font-bold text-slate-800 mt-1">{tenants.find(t => t.id === activeInvoice.tenantId)?.name}</p>
                      <p className="text-slate-600">Unit: {units.find(u => u.id === activeInvoice.unitId)?.number}</p>
                      <p className="text-slate-600">Phone: {tenants.find(t => t.id === activeInvoice.tenantId)?.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block uppercase">পেমেন্ট স্ট্যাটাস (Status):</span>
                      <p className="font-bold text-emerald-600 mt-1 uppercase text-sm">{activeInvoice.status}</p>
                      <p className="text-slate-600">পেমেন্ট মেথড: {activeInvoice.paymentMethod || 'Cash'}</p>
                      <p className="text-slate-600">পরিশোধের তারিখ: {activeInvoice.paymentDate || 'N/A'}</p>
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
                        <td className="p-3 text-slate-800 font-medium">{activeInvoice.billingMonth} Rent & Utilities Billing</td>
                        <td className="p-3 text-right text-slate-800 font-bold">৳ {activeInvoice.amount.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-800">
                        <td className="p-3 text-right">সর্বমোট (Total Received):</td>
                        <td className="p-3 text-right text-sky-600 text-sm">৳ {activeInvoice.paidAmount.toLocaleString()} BDT</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Seals & Signatures */}
                  <div className="flex justify-between items-end pt-12 text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-sky-50 border border-sky-200 rounded-lg flex items-center justify-center text-center text-[10px] text-sky-600 font-semibold p-1">
                        <ShieldCheck className="w-6 h-6 mr-1" />
                        ERP VERIFIED
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">QR Code Secure Seal</span>
                    </div>

                    <div className="text-center">
                      <div className="italic font-serif font-bold text-slate-700 text-xs border-b border-slate-400 pb-1 px-4">Software Point</div>
                      <span className="text-[9px] text-slate-400 block mt-1">Authorized Accountant Signature</span>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 text-center pt-8 border-t border-slate-100">
                    Made by Software Point (https://www.softwarepointbd.com/) • Thank you for choosing Bongo Property ERP.
                  </p>
                </div>
              ) : (
                /* Thermal 58mm / 80mm Layouts */
                <div className={`mx-auto bg-slate-50 p-4 border border-dashed border-slate-400 font-mono text-[10px] text-slate-900 leading-normal ${printTemplate === 'thermal80' ? 'w-80' : 'w-64'}`}>
                  <div className="text-center space-y-1">
                    <h3 className="font-extrabold text-xs">Bongo Property ERP</h3>
                    <p>ধানমন্ডি, ঢাকা • ০১৭২৪-৫৬১৬৭০</p>
                    <p>-------------------------</p>
                    <p className="font-bold">MONEY RECEIPT / রসিদ</p>
                    <p>-------------------------</p>
                  </div>

                  <div className="space-y-1 mt-4">
                    <p>Receipt No: MR-2026-{activeInvoice.id.substr(0,4).toUpperCase()}</p>
                    <p>Date: {activeInvoice.paymentDate || 'N/A'}</p>
                    <p>Tenant: {tenants.find(t => t.id === activeInvoice.tenantId)?.name}</p>
                    <p>Unit: {units.find(u => u.id === activeInvoice.unitId)?.number}</p>
                    <p>Method: {activeInvoice.paymentMethod || 'Cash'}</p>
                  </div>

                  <p className="my-2">-------------------------</p>

                  <div className="flex justify-between font-bold">
                    <span>Rent {activeInvoice.billingMonth}</span>
                    <span>৳{activeInvoice.amount.toLocaleString()}</span>
                  </div>

                  <p className="my-2">-------------------------</p>

                  <div className="flex justify-between font-extrabold text-xs">
                    <span>PAID TOTAL:</span>
                    <span>৳{activeInvoice.paidAmount.toLocaleString()}</span>
                  </div>

                  <div className="text-center mt-6 space-y-2">
                    <p className="text-[8px]">Secured ERP Digitally Signed Receipt</p>
                    <p className="text-[8px] font-bold text-emerald-700">*** PAID ***</p>
                    <p className="text-[8px]">Thank you for your timely payment!</p>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
