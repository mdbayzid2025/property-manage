import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Invoice, Receipt, MaintenanceRequest, Unit, AccountTransaction } from '../services/db';
import { CreditCard, FileText, Wrench, Megaphone, Smartphone, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function TenantPortal({ tenantId }: { tenantId: string }) {
  const { t, lang } = useTranslation();
  
  // States
  const [invoices, setInvoices] = useState<Invoice[]>(() => 
    MockDB.getTable<Invoice>('invoices').filter(i => i.tenantId === tenantId)
  );
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>(() => 
    MockDB.getTable<MaintenanceRequest>('maintenance').filter(m => m.tenantId === tenantId)
  );
  
  // Checkout simulator states
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [mfsGateway, setMfsGateway] = useState<'bkash' | 'nagad' | null>(null);
  const [mfsPhone, setMfsPhone] = useState('');
  const [mfsPin, setMfsPin] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'phone' | 'pin' | 'processing' | 'success'>('phone');
  
  // Issue submission states
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issuePriority, setIssuePriority] = useState<'low' | 'medium' | 'high'>('medium');

  const openPayment = (inv: Invoice) => {
    setActiveInvoice(inv);
    setMfsGateway('bkash');
    setCheckoutStep('phone');
    setMfsPhone('');
    setMfsPin('');
  };

  const handleMfsSubmit = () => {
    if (checkoutStep === 'phone') {
      if (mfsPhone.length < 11) {
        alert(lang === 'bn' ? 'অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন' : 'Please input a valid 11-digit mobile number');
        return;
      }
      setCheckoutStep('pin');
    } else if (checkoutStep === 'pin') {
      if (mfsPin.length < 4) {
        alert(lang === 'bn' ? 'অনুগ্রহ করে সঠিক পিন কোড দিন' : 'Please input a valid PIN');
        return;
      }
      setCheckoutStep('processing');
      
      // Complete transaction dynamically in DB
      setTimeout(() => {
        if (!activeInvoice) return;
        const method = mfsGateway === 'bkash' ? 'bKash' : 'Nagad';
        
        // 1. Update Invoice Status
        MockDB.update<Invoice>('invoices', activeInvoice.id, {
          status: 'paid',
          paidAmount: activeInvoice.amount,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: method
        });

        // 2. Add Money Receipt
        const nextRcptNo = 'MR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
        MockDB.insert<Receipt>('receipts', {
          id: 'rcpt_' + Math.random().toString(36).substr(2, 9),
          invoiceId: activeInvoice.id,
          receiptNumber: nextRcptNo,
          receivedAmount: activeInvoice.amount,
          receivedDate: new Date().toISOString().split('T')[0],
          receivedBy: 'MFS System Gateway',
          paymentMethod: method,
          remarks: 'পরিশোধিত অনলাইন পোর্টাল'
        });

        // 3. Log Financial Transaction
        MockDB.insert<AccountTransaction>('transactions', {
          id: 'tx_' + Math.random().toString(36).substr(2, 9),
          companyId: activeInvoice.companyId,
          date: new Date().toISOString().split('T')[0],
          type: 'income',
          category: 'Rent Revenue',
          account: method + ' Merchant',
          amount: activeInvoice.amount,
          description: `ভাড়াটিয়া পোর্টাল পেমেন্ট (Invoice: ${activeInvoice.id})`
        });

        // Refresh invoices local list
        setInvoices(MockDB.getTable<Invoice>('invoices').filter(i => i.tenantId === tenantId));
        setCheckoutStep('success');
      }, 1500);
    }
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle.trim() || !issueDesc.trim()) return;

    // Fetch unit for tenant
    const tenants = MockDB.getTable<any>('tenants');
    const tenant = tenants.find((t: any) => t.id === tenantId);
    if (!tenant) return;

    const newIssue = MockDB.insert<MaintenanceRequest>('maintenance', {
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      propertyId: 'p1', // Default property
      unitId: tenant.unitId,
      tenantId: tenantId,
      title: issueTitle,
      description: issueDesc,
      priority: issuePriority,
      status: 'pending',
      materialCost: 0,
      laborCost: 0,
      createdAt: new Date().toISOString().split('T')[0]
    });

    setMaintenance(prev => [...prev, newIssue]);
    setIssueTitle('');
    setIssueDesc('');
    alert(lang === 'bn' ? 'রক্ষণাবেক্ষণের অনুরোধ পাঠানো হয়েছে!' : 'Maintenance request submitted successfully!');
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t('tenantPortal')}</h2>
          <p className="text-xs text-slate-400">Manage invoices, make payments and report facility complaints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Lists & Payment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
            <span className="font-bold text-sm flex items-center gap-2 mb-4 text-emerald-400">
              <CreditCard className="w-4 h-4" />
              Rents & Bills Ledger
            </span>

            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-4 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-blue-950/40 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-xs text-slate-800 dark:text-slate-300">{inv.billingMonth} Rent & Utilities</h3>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">{inv.details}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Due: {inv.dueDate}</span>
                      {inv.paymentMethod && <span className="text-[10px] text-sky-600 dark:text-sky-400">via {inv.paymentMethod}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-300">৳ {inv.amount.toLocaleString()}</span>
                    {inv.status === 'paid' ? (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg font-bold">Paid (পরিশোধিত)</span>
                    ) : (
                      <button 
                        onClick={() => openPayment(inv)}
                        className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white text-xs rounded-lg font-bold shadow-md shadow-sky-500/20 transition-all"
                      >
                        Pay Bill
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submissions of Maintenance */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
            <span className="font-bold text-sm flex items-center gap-2 mb-4 text-amber-400">
              <Wrench className="w-4 h-4" />
              File Maintenance Complaints
            </span>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Issue / সমস্যা</label>
                  <input
                    type="text"
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    placeholder="e.g. পানির ফিল্টার নষ্ট বা লাইট ফিউজ"
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl outline-none focus:border-amber-500 text-xs text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Priority / জরুরী অবস্থা</label>
                  <select
                    value={issuePriority}
                    onChange={(e: any) => setIssuePriority(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl outline-none focus:border-amber-500 text-xs text-slate-800 dark:text-slate-300"
                  >
                    <option value="low" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Low (সাধারণ)</option>
                    <option value="medium" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Medium (জরুরী)</option>
                    <option value="high" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">High (উচ্চ জরুরী)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Description / বিবরণ</label>
                <textarea
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="বিস্তারিত সমস্যাটি এখানে লিখুন যেন টেকনিশিয়ানের বুঝতে সুবিধা হয়..."
                  className="w-full h-24 p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl outline-none focus:border-amber-500 text-xs text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <button 
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/10 transition-all text-xs"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </div>

        {/* Notice Board and Status list */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
            <span className="font-bold text-sm flex items-center gap-2 mb-4 text-purple-400">
              <Megaphone className="w-4 h-4" />
              Property Notices
            </span>

            <div className="space-y-3">
              <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold block">July 06, 2026</span>
                <h4 className="text-xs font-bold mt-1 text-slate-800 dark:text-slate-200">লিফট সাময়িক বন্ধ থাকবে (Lift Under AMC)</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  রক্ষণাবেক্ষণ কাজের জন্য আগামী ৭ই জুলাই সকাল ১০:০০ থেকে দুপুর ১২:০০ পর্যন্ত লিফট বন্ধ থাকবে। সাময়িক অসুবিধার জন্য দুঃখিত।
                </p>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-900/40 rounded-xl">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">June 28, 2026</span>
                <h4 className="text-xs font-bold mt-1 text-slate-800 dark:text-slate-200">জেনারেটর ব্যাকআপ চার্জ বন্টন</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  বিদ্যুৎ সংকটের কারণে জেনারেটর সার্ভিস বাড়ানোর সিদ্ধান্ত নেওয়া হয়েছে। সবার নিজ নিজ মিটারে অতিরিক্ত ২৫০৳ জেনারেটর চার্জ যুক্ত হবে।
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
            <span className="font-bold text-sm flex items-center gap-2 mb-3 text-sky-400">
              <Wrench className="w-4 h-4" />
              Ticket Activity History
            </span>

            <div className="space-y-3">
              {maintenance.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No active tickets submitted yet</p>
              ) : (
                maintenance.map((m) => (
                  <div key={m.id} className="flex justify-between items-center p-2.5 bg-slate-100 dark:bg-slate-900/20 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-300">{m.title}</span>
                      <p className="text-[9px] text-slate-500">Submitted: {m.createdAt}</p>
                    </div>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                      m.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                      m.status === 'in_progress' ? 'bg-sky-500/10 text-sky-400' :
                      m.status === 'assigned' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {m.status.toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MFS Checkout Dialog Simulator */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl glass-panel border border-slate-200 dark:border-blue-900/30 animate-slide-in">
            {/* Brands Selection */}
            <div className="p-6 text-center space-y-4">
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => { setMfsGateway('bkash'); setCheckoutStep('phone'); }}
                  className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center text-xs font-bold transition-all ${
                    mfsGateway === 'bkash' 
                      ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  bKash (বিকাশ)
                </button>
                <button 
                  onClick={() => { setMfsGateway('nagad'); setCheckoutStep('phone'); }}
                  className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center text-xs font-bold transition-all ${
                    mfsGateway === 'nagad' 
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Nagad (নগদ)
                </button>
              </div>

              {checkoutStep === 'phone' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {mfsGateway === 'bkash' ? 'bKash Merchant Payment' : 'Nagad Pay Checkout'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Payable amount: <span className="font-bold text-sky-600 dark:text-sky-400">৳ {activeInvoice.amount.toLocaleString()}</span></p>
                  <div>
                    <input 
                      type="text" 
                      placeholder="e.g. 017XXXXXXXX"
                      value={mfsPhone}
                      onChange={(e) => setMfsPhone(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-sky-500 text-center text-sm tracking-wider text-slate-800 dark:text-slate-300"
                    />
                  </div>
                </div>
              )}

              {checkoutStep === 'pin' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Enter Account PIN</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Verification code & PIN is encrypted & secure</p>
                  <div>
                    <input 
                      type="password" 
                      placeholder="••••"
                      value={mfsPin}
                      maxLength={4}
                      onChange={(e) => setMfsPin(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-sky-500 text-center text-lg tracking-[1em] text-slate-800 dark:text-slate-300"
                    />
                  </div>
                </div>
              )}

              {checkoutStep === 'processing' && (
                <div className="py-8 flex flex-col items-center space-y-4">
                  <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Validating transaction with bank API...</p>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="py-6 flex flex-col items-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                  <div className="text-center">
                    <p className="text-xs text-emerald-400 font-bold">Payment Completed Successfully</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Invoice cleared. Receipt generated.</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {checkoutStep !== 'processing' && (
                <div className="flex gap-2 pt-4">
                  {checkoutStep === 'success' ? (
                    <button 
                      onClick={() => setActiveInvoice(null)}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      Close Gateway
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => setActiveInvoice(null)}
                        className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleMfsSubmit}
                        className="w-1/2 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/20"
                      >
                        Confirm
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
