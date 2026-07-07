import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Booking, Installment, Unit, AccountTransaction } from '../services/db';
import { BadgeDollarSign, Plus, HelpCircle, Phone, Calendar, ArrowRight, UserCheck } from 'lucide-react';

export default function SalesBooking({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // DB tables
  const [bookings, setBookings] = useState<Booking[]>(() => MockDB.getTable<Booking>('bookings'));
  const [installments, setInstallments] = useState<Installment[]>(() => MockDB.getTable<Installment>('installments'));
  const [units] = useState<Unit[]>(() => MockDB.getTable<Unit>('units'));

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(bookings[0] || null);

  // Form State
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custNid, setCustNid] = useState('');
  const [targetUnit, setTargetUnit] = useState('');
  const [totalVal, setTotalVal] = useState('');
  const [bookingAmt, setBookingAmt] = useState('');
  const [downPay, setDownPay] = useState('');
  const [instCount, setInstCount] = useState('12');

  const availableUnits = units.filter(u => u.status === 'vacant');

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(totalVal);
    const bkAmt = Number(bookingAmt);
    const down = Number(downPay);
    const counts = Number(instCount);

    if (!custName.trim() || !targetUnit || isNaN(total) || isNaN(bkAmt)) return;

    // Create Booking
    const newBooking = MockDB.insert<Booking>('bookings', {
      id: 'bk_' + Math.random().toString(36).substr(2, 9),
      companyId,
      unitId: targetUnit,
      customerName: custName,
      customerPhone: custPhone,
      customerNid: custNid,
      bookingAmount: bkAmt,
      totalPrice: total,
      bookingDate: new Date().toISOString().split('T')[0],
      status: 'active',
      downPayment: down,
      installmentsCount: counts
    });

    // Create Installments list
    const remaining = total - bkAmt - down;
    const instAmt = Math.round(remaining / counts);
    for (let idx = 1; idx <= counts; idx++) {
      MockDB.insert<Installment>('installments', {
        id: `inst_${newBooking.id}_${idx}`,
        bookingId: newBooking.id,
        installmentNo: idx,
        dueDate: new Date(Date.now() + idx * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: instAmt,
        paidAmount: 0,
        status: 'pending'
      });
    }

    // Set Unit to Reserved
    MockDB.update<Unit>('units', targetUnit, { status: 'reserved' });

    setBookings(MockDB.getTable<Booking>('bookings'));
    setInstallments(MockDB.getTable<Installment>('installments'));
    setSelectedBooking(newBooking);
    
    // Clear forms
    setCustName('');
    setCustPhone('');
    setTargetUnit('');
    setTotalVal('');
    setBookingAmt('');
    setDownPay('');
    setShowBookingForm(false);
    alert('Booking installment schedule created!');
  };

  const handlePayInstallment = (inst: Installment) => {
    MockDB.update<Installment>('installments', inst.id, {
      status: 'paid',
      paidAmount: inst.amount,
      paymentDate: new Date().toISOString().split('T')[0]
    });

    // Log transaction
    if (selectedBooking) {
      MockDB.insert<AccountTransaction>('transactions', {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        companyId,
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: 'Booking Revenue',
        account: 'Bank Account',
        amount: inst.amount,
        description: `কিস্তি আদায়: কিস্তি নং ${inst.installmentNo} - ${selectedBooking.customerName}`
      });
    }

    setInstallments(MockDB.getTable<Installment>('installments'));
    alert('EMI Installment paid successfully!');
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
            <BadgeDollarSign className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('salesBooking')} & CRM</h2>
            <p className="text-xs text-slate-400">Manage real estate booking sales, Down Payments and dynamic monthly EMI installments</p>
          </div>
        </div>

        <button 
          onClick={() => setShowBookingForm(!showBookingForm)}
          className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Unit Booking
        </button>
      </div>

      {showBookingForm && (
        <form onSubmit={handleCreateBooking} className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-in">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Customer Name</label>
            <input 
              type="text" 
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-300 outline-none"
              placeholder="e.g. মোঃ মাহাবুব"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Customer Phone</label>
            <input 
              type="text" 
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-300 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Select Flat / Shop</label>
            <select
              value={targetUnit}
              onChange={(e) => setTargetUnit(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-300 outline-none"
              required
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">-- Choose Unit --</option>
              {availableUnits.map(u => (
                <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{u.number} ({u.type.toUpperCase()})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Pricing (BDT)</label>
            <input 
              type="number" 
              value={totalVal}
              onChange={(e) => setTotalVal(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-300 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Token Booking Money</label>
            <input 
              type="number" 
              value={bookingAmt}
              onChange={(e) => setBookingAmt(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-300 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Down Payment (BDT)</label>
            <input 
              type="number" 
              value={downPay}
              onChange={(e) => setDownPay(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-300 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Installment Count (Months)</label>
            <input 
              type="number" 
              value={instCount}
              onChange={(e) => setInstCount(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-300 outline-none"
              required
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
            >
              Generate Booking Contract
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Customer Leads / Bookings Sidebar list */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 space-y-4">
          <span className="font-bold text-sm block">Active Sales Bookings</span>
          <div className="space-y-2">
            {bookings.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                  selectedBooking?.id === b.id 
                    ? 'border-sky-500 bg-sky-500/10' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/20'
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-300">{b.customerName}</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Total Value: ৳{b.totalPrice.toLocaleString()}</p>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">Active</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Booking EMI Ledger */}
        {selectedBooking && (
          <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 space-y-4 animate-slide-in">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{selectedBooking.customerName} (Client)</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Phone: {selectedBooking.customerPhone} • Unit: {units.find(u => u.id === selectedBooking.unitId)?.number}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-600 dark:text-slate-400">Total Price: ৳{selectedBooking.totalPrice.toLocaleString()}</span>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">Token: ৳{selectedBooking.bookingAmount.toLocaleString()} paid</p>
              </div>
            </div>

            {/* Installments Ledger list */}
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-300 block mb-3">Installment schedule (EMI Ledger)</span>
              
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {installments.filter(i => i.bookingId === selectedBooking.id).map((inst) => (
                  <div key={inst.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-300">Installment #{inst.installmentNo}</span>
                      <p className="text-[9px] text-slate-500 mt-0.5">Due: {inst.dueDate}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-800 dark:text-slate-300">৳ {inst.amount.toLocaleString()}</span>
                      
                      {inst.status === 'paid' ? (
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold rounded-lg text-[10px]">Paid</span>
                      ) : (
                        <button
                          onClick={() => handlePayInstallment(inst)}
                          className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-[10px] font-bold shadow-md shadow-sky-500/10"
                        >
                          Collect Cash
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
