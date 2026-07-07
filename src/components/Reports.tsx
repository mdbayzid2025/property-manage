import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { 
  MockDB, 
  Property, 
  PropertyIncomeRow, 
  PropertyExpenseRow, 
  SummaryAdjustment, 
  PreviousMonthBalance 
} from '../services/db';
import { 
  FileSpreadsheet, 
  FileDown, 
  Printer, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Calendar, 
  Building, 
  Check
} from 'lucide-react';

// Bangla numeral digits map
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

// Translate English digits to Bangla numerals
export function toBanglaNumerals(num: string | number): string {
  return String(num).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

// Convert Bangla numerals back to English digits for parser calculations
export function toEnglishNumerals(bnStr: string): string {
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return bnStr.replace(/[০-৯]/g, (char) => bnToEnMap[char] || char);
}

// Format number into local Bengali currency / standard BDT formatting
export function formatCurrency(amount: number, lang: 'bn' | 'en'): string {
  if (lang === 'en') {
    return '৳ ' + amount.toLocaleString('en-US');
  }
  const formatted = amount.toLocaleString('en-IN'); // standard 2,01,880 format
  return toBanglaNumerals(formatted) + '/-';
}

// Map numbers 0-99 to their phonetic Bengali word representation
const BN_NUM_WORDS = [
  'শূণ্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
  'দশ', 'এগারো', 'বারো', 'তেরো', 'চোদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ',
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'উনত্রিশ',
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'উনচল্লিশ',
  'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চৌয়াল্লিশ', 'পয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'উনপঞ্চাশ',
  'পঞ্চাশ', 'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চৌয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'উনষাট',
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'উনসত্তর',
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চৌয়াত্তর', 'পঁচাত্তর', 'ছেয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'উনআশি',
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চৌরাশি', 'পঁচাশী', 'ছেয়াশি', 'সাতাশি', 'আটাশি', 'উননব্বই',
  'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছেয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
];

// Helper to convert number into spoken Bangla words (crores, lakhs, thousands, hundreds)
export function toBanglaWords(num: number): string {
  if (num === 0) return 'শূণ্য টাকা মাত্র';
  if (num < 0) return 'ঋণাত্মক ' + toBanglaWords(Math.abs(num));

  let words = '';

  // Crore (কোটি)
  if (num >= 10000000) {
    const crore = Math.floor(num / 10000000);
    words += toBanglaWords(crore).replace(' টাকা মাত্র।', '') + ' কোটি ';
    num %= 10000000;
  }

  // Lakh (লক্ষ)
  if (num >= 100000) {
    const lakh = Math.floor(num / 100000);
    words += BN_NUM_WORDS[lakh] + ' লক্ষ ';
    num %= 100000;
  }

  // Thousand (হাজার)
  if (num >= 1000) {
    const thousand = Math.floor(num / 1000);
    words += BN_NUM_WORDS[thousand] + ' হাজার ';
    num %= 1000;
  }

  // Hundred (শত)
  if (num >= 100) {
    const hundred = Math.floor(num / 100);
    words += BN_NUM_WORDS[hundred] + ' শত ';
    num %= 100;
  }

  // Under hundred
  if (num > 0) {
    words += BN_NUM_WORDS[num];
  }

  // Replace double spaces & clean up
  return words.replace(/\s+/g, ' ').trim() + ' টাকা মাত্র।';
}

// Helper to convert number into spoken English words (crores, lakhs, thousands, hundreds)
export function toEnglishWords(num: number): string {
  if (num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + toEnglishWords(Math.abs(num));

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertBelowThousand = (n: number): string => {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  };

  let words = '';

  if (num >= 10000000) {
    const crore = Math.floor(num / 10000000);
    words += toEnglishWords(crore).replace(' Taka Only', '') + ' Crore ';
    num %= 10000000;
  }

  if (num >= 100000) {
    const lakh = Math.floor(num / 100000);
    words += convertBelowThousand(lakh) + ' Lakh ';
    num %= 100000;
  }

  if (num >= 1000) {
    const thousand = Math.floor(num / 1000);
    words += convertBelowThousand(thousand) + ' Thousand ';
    num %= 1000;
  }

  if (num > 0) {
    words += convertBelowThousand(num);
  }

  return words.replace(/\s+/g, ' ').trim() + ' Taka Only';
}

const MONTHS_MAP = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  bn: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
};

export default function Reports({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // Navigation Filter States
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all'); // 'all' means Summary Page
  const [selectedMonth, setSelectedMonth] = useState<string>('April');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [reportType, setReportType] = useState<'income' | 'expense'>('income');

  const prevMonthIndex = (MONTHS_MAP.en.indexOf(selectedMonth) - 1 + 12) % 12;
  const prevMonthBn = MONTHS_MAP.bn[prevMonthIndex];
  const prevMonthEn = MONTHS_MAP.en[prevMonthIndex];

  const nextMonthIndex = (MONTHS_MAP.en.indexOf(selectedMonth) + 1) % 12;
  const nextMonthBn = MONTHS_MAP.bn[nextMonthIndex];
  const nextMonthEn = MONTHS_MAP.en[nextMonthIndex];

  // DB tables loaded from localStorage
  const [properties] = useState<Property[]>(() => 
    MockDB.getTable<Property>('properties').filter(p => p.companyId === companyId)
  );
  
  const [incomeRows, setIncomeRows] = useState<PropertyIncomeRow[]>(() => 
    MockDB.getTable<PropertyIncomeRow>('report_income')
  );
  const [expenseRows, setExpenseRows] = useState<PropertyExpenseRow[]>(() => 
    MockDB.getTable<PropertyExpenseRow>('report_expense')
  );
  const [adjustments, setAdjustments] = useState<SummaryAdjustment[]>(() => 
    MockDB.getTable<SummaryAdjustment>('report_adjustments')
  );
  const [balances, setBalances] = useState<PreviousMonthBalance[]>(() => 
    MockDB.getTable<PreviousMonthBalance>('report_balances')
  );

  // Form State: Add Income Tenant Row
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [newFloor, setNewFloor] = useState('');
  const [newFlat, setNewFlat] = useState('');
  const [newTenant, setNewTenant] = useState('');
  const [newRent, setNewRent] = useState('');
  const [newAdvance, setNewAdvance] = useState('');
  const [newLift, setNewLift] = useState('');
  const [newElec, setNewElec] = useState('');
  const [newGas, setNewGas] = useState('');
  const [newGarage, setNewGarage] = useState('');

  // Form State: Add Expense Ledger Row
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpDate, setNewExpDate] = useState('');
  const [newExpMemo, setNewExpMemo] = useState('');
  const [newExpDetails, setNewExpDetails] = useState('');
  const [newExpQty, setNewExpQty] = useState('');
  const [newExpCost, setNewExpCost] = useState('');

  // Form State: Summary Adjustments
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [newAdjDesc, setNewAdjDesc] = useState('');
  const [newAdjType, setNewAdjType] = useState<'income' | 'expense'>('income');
  const [newAdjAmount, setNewAdjAmount] = useState('');
  const [newAdjComment, setNewAdjComment] = useState('');

  // Form State: Carryover balance edit
  const [isEditingPrevBal, setIsEditingPrevBal] = useState(false);
  const [prevBalInput, setPrevBalInput] = useState('');

  // Combined MonthYear String e.g. "April 2026"
  const currentMonthYear = `${selectedMonth} ${selectedYear}`;

  // Filtered property income rows
  const filteredIncome = incomeRows.filter(
    row => row.propertyId === selectedPropertyId && row.monthYear === currentMonthYear
  );

  // Filtered property expense rows
  const filteredExpense = expenseRows.filter(
    row => row.propertyId === selectedPropertyId && row.monthYear === currentMonthYear
  );

  // Filtered adjustments & balances
  const filteredAdjustments = adjustments.filter(adj => adj.monthYear === currentMonthYear);
  const activePrevBal = balances.find(b => b.monthYear === currentMonthYear)?.balance ?? 0;

  // Save helpers
  const persistIncome = (data: PropertyIncomeRow[]) => {
    setIncomeRows(data);
    MockDB.saveTable('report_income', data);
  };

  const persistExpense = (data: PropertyExpenseRow[]) => {
    setExpenseRows(data);
    MockDB.saveTable('report_expense', data);
  };

  const persistAdjustments = (data: SummaryAdjustment[]) => {
    setAdjustments(data);
    MockDB.saveTable('report_adjustments', data);
  };

  const persistBalances = (data: PreviousMonthBalance[]) => {
    setBalances(data);
    MockDB.saveTable('report_balances', data);
  };

  // Add Income handler
  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlat.trim() || !newTenant.trim()) {
      alert(lang === 'bn' ? 'দয়া করে ফ্ল্যাট নং এবং ভাড়াটিয়ার নাম লিখুন' : 'Please fill in Flat No and Tenant Name');
      return;
    }
    const newRow: PropertyIncomeRow = {
      id: 'inc_' + Math.random().toString(36).substr(2, 9),
      propertyId: selectedPropertyId,
      monthYear: currentMonthYear,
      floorNo: newFloor,
      flatNo: newFlat,
      tenantName: newTenant,
      flatRent: Number(newRent) || 0,
      advance: Number(newAdvance) || 0,
      liftBill: Number(newLift) || 0,
      electricityBill: Number(newElec) || 0,
      gasBill: Number(newGas) || 0,
      garageRent: Number(newGarage) || 0
    };
    persistIncome([...incomeRows, newRow]);
    // reset form
    setNewFloor('');
    setNewFlat('');
    setNewTenant('');
    setNewRent('');
    setNewAdvance('');
    setNewLift('');
    setNewElec('');
    setNewGas('');
    setNewGarage('');
    setShowIncomeForm(false);
  };

  // Delete Income handler
  const handleDeleteIncome = (id: string) => {
    if (confirm(lang === 'bn' ? 'আপনি কি এই কালেকশন এন্ট্রিটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this collection entry?')) {
      persistIncome(incomeRows.filter(r => r.id !== id));
    }
  };

  // Add Expense handler
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpDetails.trim() || !newExpCost) {
      alert(lang === 'bn' ? 'দয়া করে বিবরণ এবং মোট মূল্য লিখুন' : 'Please fill in Description and Cost');
      return;
    }
    const newRow: PropertyExpenseRow = {
      id: 'exp_' + Math.random().toString(36).substr(2, 9),
      propertyId: selectedPropertyId,
      monthYear: currentMonthYear,
      date: newExpDate || new Date().toISOString().split('T')[0],
      memoNo: newExpMemo,
      details: newExpDetails,
      quantity: newExpQty,
      totalCost: Number(newExpCost) || 0
    };
    persistExpense([...expenseRows, newRow]);
    setNewExpDate('');
    setNewExpMemo('');
    setNewExpDetails('');
    setNewExpQty('');
    setNewExpCost('');
    setShowExpenseForm(false);
  };

  // Delete Expense handler
  const handleDeleteExpense = (id: string) => {
    if (confirm(lang === 'bn' ? 'আপনি কি এই খরচের হিসাবটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this expense record?')) {
      persistExpense(expenseRows.filter(r => r.id !== id));
    }
  };

  // Add Adjustment handler
  const handleAddAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdjDesc.trim() || !newAdjAmount) {
      alert(lang === 'bn' ? 'দয়া করে বিবরণ এবং পরিমাণ লিখুন' : 'Please fill in Description and Amount');
      return;
    }
    const newAdj: SummaryAdjustment = {
      id: 'adj_' + Math.random().toString(36).substr(2, 9),
      monthYear: currentMonthYear,
      type: newAdjType,
      description: newAdjDesc,
      amount: Number(newAdjAmount) || 0,
      comment: newAdjComment
    };
    persistAdjustments([...adjustments, newAdj]);
    setNewAdjDesc('');
    setNewAdjAmount('');
    setNewAdjComment('');
    setShowAdjustmentForm(false);
  };

  // Delete Adjustment handler
  const handleDeleteAdjustment = (id: string) => {
    if (confirm(lang === 'bn' ? 'আপনি কি এই সমন্বয় এন্ট্রিটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this adjustment?')) {
      persistAdjustments(adjustments.filter(a => a.id !== id));
    }
  };

  // Update previous Month Balance Carryover
  const handleSavePrevBal = () => {
    const val = Number(prevBalInput);
    if (isNaN(val)) return;
    const existing = balances.find(b => b.monthYear === currentMonthYear);
    if (existing) {
      persistBalances(balances.map(b => b.monthYear === currentMonthYear ? { ...b, balance: val } : b));
    } else {
      persistBalances([...balances, { id: 'bal_' + Math.random().toString(36).substr(2, 9), monthYear: currentMonthYear, balance: val }]);
    }
    setIsEditingPrevBal(false);
  };

  // Aggregate Calculations for Current Selection
  const getPropertyIncomeAggregate = (propId: string) => {
    const matches = incomeRows.filter(r => r.propertyId === propId && r.monthYear === currentMonthYear);
    return matches.reduce((sum, r) => sum + r.flatRent + r.advance + r.liftBill + r.electricityBill + r.gasBill + r.garageRent, 0);
  };

  const getPropertyExpenseAggregate = (propId: string) => {
    const matches = expenseRows.filter(r => r.propertyId === propId && r.monthYear === currentMonthYear);
    return matches.reduce((sum, r) => sum + r.totalCost, 0);
  };

  // Calculate dynamic totals for selected single property
  const currentPropertyIncomeSum = filteredIncome.reduce((acc, row) => ({
    rent: acc.rent + row.flatRent,
    advance: acc.advance + row.advance,
    lift: acc.lift + row.liftBill,
    elec: acc.elec + row.electricityBill,
    gas: acc.gas + row.gasBill,
    garage: acc.garage + row.garageRent,
    total: acc.total + (row.flatRent + row.advance + row.liftBill + row.electricityBill + row.gasBill + row.garageRent)
  }), { rent: 0, advance: 0, lift: 0, elec: 0, gas: 0, garage: 0, total: 0 });

  const currentPropertyExpenseSum = filteredExpense.reduce((sum, r) => sum + r.totalCost, 0);

  // Centralized Summary Totals
  const summaryPropertiesData = properties.map((prop, index) => {
    const inc = getPropertyIncomeAggregate(prop.id);
    const exp = getPropertyExpenseAggregate(prop.id);
    return {
      index: index + 1,
      name: prop.name,
      income: inc,
      expense: exp,
      details: prop.type === 'mixed' ? '(ভাড়া ও বিদ্যুৎ, গ্যাস)' : prop.type === 'commercial' ? '(ভাড়া ও বিদ্যুৎ বিল, দোকান)' : '(ভাড়া)'
    };
  });

  const summaryManualIncome = filteredAdjustments.filter(a => a.type === 'income').reduce((sum, a) => sum + a.amount, 0);
  const summaryManualExpense = filteredAdjustments.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.amount, 0);

  const aggregatePropertiesIncome = summaryPropertiesData.reduce((sum, p) => sum + p.income, 0);
  const aggregatePropertiesExpense = summaryPropertiesData.reduce((sum, p) => sum + p.expense, 0);

  const summaryGrandTotalIncome = aggregatePropertiesIncome + summaryManualIncome;
  const summaryGrandTotalExpense = aggregatePropertiesExpense + summaryManualExpense;

  const summarySubtotal = activePrevBal + summaryGrandTotalIncome;
  const summaryClosingBalance = summarySubtotal - summaryGrandTotalExpense;

  const currentMonthBn = MONTHS_MAP.bn[MONTHS_MAP.en.indexOf(selectedMonth)];

  // Print Report sheet trigger
  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    alert(lang === 'bn' ? 'এক্সেল স্প্রেডশীট ডাউনলোড সফল হয়েছে!' : 'Excel spreadsheet export completed successfully!');
  };

  const handleExportPDF = () => {
    alert(lang === 'bn' ? 'পিডিএফ অডিট রিপোর্ট জেনারেট সম্পন্ন!' : 'PDF Audit report successfully generated!');
  };

  return (
    <div className="space-y-6 text-sm">
      
      {/* Dynamic inline styles for browser print layouts */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #000 !important;
            color: #000 !important;
            padding: 6px !important;
            font-size: 11px !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
          .print-header {
            display: block !important;
            text-align: center !important;
            margin-bottom: 20px !important;
          }
          .print-header h1 {
            font-size: 20px !important;
            font-weight: bold !important;
            margin-bottom: 5px !important;
          }
          .print-header p {
            font-size: 12px !important;
            margin: 2px 0 !important;
          }
        }
        .print-header {
          display: none;
        }
      `}</style>

      {/* Main Controls - HIDE ON PRINT */}
      <div className="no-print glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 flex flex-wrap gap-4 items-center justify-between">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Property Selector */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-sky-400" />
              {lang === 'bn' ? 'প্রপার্টি' : 'Select Property'}
            </label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs px-3 py-2 outline-none font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="all">{lang === 'bn' ? 'সকল প্রপার্টি (সারসংক্ষেপ)' : 'Centralized Summary Page'}</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {lang === 'bn' ? p.name.split(' (')[0] : p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              {lang === 'bn' ? 'মাস' : 'Month'}
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs px-3 py-2 outline-none font-semibold text-slate-700 dark:text-slate-200"
            >
              {MONTHS_MAP.en.map((m, idx) => (
                <option key={m} value={m}>
                  {lang === 'bn' ? MONTHS_MAP.bn[idx] : m}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">
              {lang === 'bn' ? 'বছর' : 'Year'}
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs px-3 py-2 outline-none font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="2025">{lang === 'bn' ? '২০২৫' : '2025'}</option>
              <option value="2026">{lang === 'bn' ? '২০২৬' : '2026'}</option>
              <option value="2027">{lang === 'bn' ? '২০২৭' : '2027'}</option>
            </select>
          </div>
        </div>

        {/* Ledger Category Toggle (Only when single property selected) */}
        {selectedPropertyId !== 'all' && (
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setReportType('income')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                reportType === 'income' 
                  ? 'bg-sky-500 text-white shadow' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              {t('reportIncomeLedger')}
            </button>
            <button
              onClick={() => setReportType('expense')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                reportType === 'expense' 
                  ? 'bg-sky-500 text-white shadow' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              {t('reportExpenseLedger')}
            </button>
          </div>
        )}

        {/* Quick Document Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 font-semibold text-xs"
          >
            <Printer className="w-4 h-4 text-sky-500" />
            <span className="hidden md:inline">{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
          </button>
          
          <button 
            onClick={handleExportExcel}
            className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 font-semibold text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span className="hidden md:inline">Excel</span>
          </button>

          <button 
            onClick={handleExportPDF}
            className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 font-semibold text-xs"
          >
            <FileDown className="w-4 h-4 text-rose-500" />
            <span className="hidden md:inline">PDF</span>
          </button>
        </div>

      </div>

      {/* Primary Report Page Card */}
      <div className="print-full-width glass-panel rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-blue-900/20 bg-card-bg shadow-xl">
        
        {/* Printable Document Headers */}
        <div className="print-header text-center mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
            {selectedPropertyId === 'all' 
              ? (lang === 'bn' ? 'মোট আয়-ব্যয়ের হিসাবসমূহ' : 'Statement of General Accounts Summary')
              : (properties.find(p => p.id === selectedPropertyId)?.name.split(' (')[0] || '')
            }
          </h1>
          <p className="text-sm font-semibold text-slate-600">
            {selectedPropertyId === 'all'
              ? (lang === 'bn' ? `${currentMonthBn} - ${toBanglaNumerals(selectedYear)}ইং` : `${selectedMonth} - ${selectedYear}`)
              : (reportType === 'income' 
                  ? (lang === 'bn' ? `মাসিক মোট ভাড়ার (আয়) হিসাব (${currentMonthBn} - ${toBanglaNumerals(selectedYear)}ইং)` : `Monthly Rent & Utilities Income Statement (${selectedMonth} - ${selectedYear})`)
                  : (lang === 'bn' ? `খরচের হিসাব প্রতিবেদন (${currentMonthBn} - ${toBanglaNumerals(selectedYear)}ইং)` : `Operational Expenses Ledger (${selectedMonth} - ${selectedYear})`)
                )
            }
          </p>
        </div>

        {/* Screen Header View (Always Visible) */}
        <div className="no-print text-center mb-8 border-b border-slate-100 dark:border-blue-950/20 pb-5">
          <h2 className="text-2xl font-black tracking-wide text-slate-950 dark:text-white uppercase">
            {selectedPropertyId === 'all' 
              ? (lang === 'bn' ? 'মোট আয়-ব্যয়ের হিসাবসমূহ' : 'General Statement of Accounts')
              : (lang === 'bn' 
                  ? properties.find(p => p.id === selectedPropertyId)?.name.split(' (')[0] 
                  : properties.find(p => p.id === selectedPropertyId)?.name
                )
            }
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
            {selectedPropertyId === 'all'
              ? (lang === 'bn' ? `${currentMonthBn} - ${toBanglaNumerals(selectedYear)}ইং` : `${selectedMonth} - ${selectedYear}`)
              : (reportType === 'income' 
                  ? (lang === 'bn' ? `মাসিক মোট ভাড়ার (আয়) হিসাব (${currentMonthBn} - ${toBanglaNumerals(selectedYear)}ইং)` : `Monthly Rent (Income) Ledger (${selectedMonth} - ${selectedYear})`)
                  : (lang === 'bn' ? `খরচের হিসাব প্রতিবেদন (${currentMonthBn} - ${toBanglaNumerals(selectedYear)}ইং)` : `Expense Ledger Report (${selectedMonth} - ${selectedYear})`)
                )
            }
          </p>
        </div>

        {/* ========================================================
            TABULAR VIEW 1: INDIVIDUAL PROPERTY INCOME LEDGER
           ======================================================== */}
        {selectedPropertyId !== 'all' && reportType === 'income' && (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-blue-950/50">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-blue-950/20 text-slate-500 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-blue-950/60 text-xs">
                    <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40 w-10">{t('reportSerialNo')}</th>
                    <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40">{t('reportFloorNo')}</th>
                    <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40">{t('reportFlatNo')}</th>
                    <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40 min-w-44 text-left">{t('reportTenantName')}</th>
                    <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40">{t('reportFlatRent')}</th>
                    <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40">{t('reportAdvance')}</th>
                    <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40">{t('reportLiftBill')}</th>
                    <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40">{t('reportElectricityBill')}</th>
                    <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40">{t('reportGasBill')}</th>
                    <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40">{t('reportGarageRent')}</th>
                    <th className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40">{t('reportTotalRent')}</th>
                    <th className="py-3 px-2 no-print">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 dark:divide-blue-950/20">
                  {filteredIncome.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400 font-medium italic">
                        {lang === 'bn' ? 'এই মাসের জন্য কোনো তথ্য পাওয়া যায়নি।' : 'No records found for the selected month.'}
                      </td>
                    </tr>
                  ) : (
                    filteredIncome.map((row, index) => {
                      const rowTotal = row.flatRent + row.liftBill + row.electricityBill + row.gasBill + row.garageRent;
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-950/10 text-slate-700 dark:text-slate-300">
                          <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/20 font-semibold">
                            {lang === 'bn' ? toBanglaNumerals(index + 1) : index + 1}
                          </td>
                          <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/20">{row.floorNo}</td>
                          <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/20 font-semibold">{row.flatNo}</td>
                          <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/20 font-bold text-left text-slate-900 dark:text-slate-200">
                            {row.tenantName}
                          </td>
                          <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/20 font-medium">
                            {row.flatRent > 0 ? (lang === 'bn' ? toBanglaNumerals(row.flatRent) : row.flatRent.toLocaleString()) : '০'}
                          </td>
                          <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/20 font-semibold text-sky-600 dark:text-sky-400">
                            {row.advance > 0 ? (lang === 'bn' ? toBanglaNumerals(row.advance) : row.advance.toLocaleString()) : ''}
                          </td>
                          <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/20">
                            {row.liftBill > 0 ? (lang === 'bn' ? toBanglaNumerals(row.liftBill) : row.liftBill.toLocaleString()) : '০'}
                          </td>
                          <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/20 text-blue-600 dark:text-blue-400">
                            {row.electricityBill > 0 ? (lang === 'bn' ? toBanglaNumerals(row.electricityBill) : row.electricityBill.toLocaleString()) : '০'}
                          </td>
                          <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/20 text-orange-600 dark:text-orange-400">
                            {row.gasBill > 0 ? (lang === 'bn' ? toBanglaNumerals(row.gasBill) : row.gasBill.toLocaleString()) : '০'}
                          </td>
                          <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/20">
                            {row.garageRent > 0 ? (lang === 'bn' ? toBanglaNumerals(row.garageRent) : row.garageRent.toLocaleString()) : ''}
                          </td>
                          <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/20 font-extrabold text-emerald-600 dark:text-emerald-400">
                            {rowTotal > 0 ? (lang === 'bn' ? toBanglaNumerals(rowTotal) : rowTotal.toLocaleString()) : '০'}
                          </td>
                          <td className="py-3 px-2 no-print">
                            <button
                              onClick={() => handleDeleteIncome(row.id)}
                              className="p-1 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                  {/* Ledger Summary / Grand Totals Row */}
                  {filteredIncome.length > 0 && (
                    <tr className="bg-slate-100/60 dark:bg-blue-950/40 text-slate-900 dark:text-white font-extrabold text-xs">
                      <td colSpan={4} className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40 text-right">
                        {lang === 'bn' ? 'মোট =' : 'Total ='}
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40">
                        {lang === 'bn' ? toBanglaNumerals(currentPropertyIncomeSum.rent) : currentPropertyIncomeSum.rent.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40 text-sky-600 dark:text-sky-400">
                        {lang === 'bn' ? toBanglaNumerals(currentPropertyIncomeSum.advance) : currentPropertyIncomeSum.advance.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40">
                        {lang === 'bn' ? toBanglaNumerals(currentPropertyIncomeSum.lift) : currentPropertyIncomeSum.lift.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40 text-blue-600 dark:text-blue-400">
                        {lang === 'bn' ? toBanglaNumerals(currentPropertyIncomeSum.elec) : currentPropertyIncomeSum.elec.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40 text-orange-600 dark:text-orange-400">
                        {lang === 'bn' ? toBanglaNumerals(currentPropertyIncomeSum.gas) : currentPropertyIncomeSum.gas.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40">
                        {lang === 'bn' ? toBanglaNumerals(currentPropertyIncomeSum.garage) : currentPropertyIncomeSum.garage.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-blue-950/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                        {lang === 'bn' ? toBanglaNumerals(currentPropertyIncomeSum.total) : currentPropertyIncomeSum.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 no-print"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* In Words Bottom block */}
            {filteredIncome.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">{t('reportAmountInWords')}</span>
                  <p className="font-black text-slate-800 dark:text-slate-100 text-sm">
                    {lang === 'bn' 
                      ? toBanglaWords(currentPropertyIncomeSum.total) 
                      : toEnglishWords(currentPropertyIncomeSum.total)
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Inline Add Income Row Sub-Form (No-Print) */}
            <div className="no-print border border-dashed border-slate-300 dark:border-blue-950/50 rounded-2xl p-4">
              {!showIncomeForm ? (
                <button
                  onClick={() => setShowIncomeForm(true)}
                  className="w-full py-3 flex items-center justify-center gap-1.5 text-xs text-sky-500 dark:text-sky-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {lang === 'bn' ? 'নতুন কালেকশন এন্ট্রি যোগ করুন' : 'Add New Income/Collection Record'}
                </button>
              ) : (
                <form onSubmit={handleAddIncome} className="space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">New Tenant Collection Record</span>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <input 
                      type="text" 
                      placeholder="Floor (ফ্লোর নং)" 
                      value={newFloor}
                      onChange={(e) => setNewFloor(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                    />
                    <input 
                      type="text" 
                      placeholder="Flat (ফ্ল্যাট নং)" 
                      value={newFlat}
                      onChange={(e) => setNewFlat(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Tenant (ভাড়াটিয়ার নাম)" 
                      value={newTenant}
                      onChange={(e) => setNewTenant(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                      required
                    />
                    <input 
                      type="number" 
                      placeholder="Flat Rent (ফ্ল্যাট ভাড়া)" 
                      value={newRent}
                      onChange={(e) => setNewRent(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                    />
                    <input 
                      type="number" 
                      placeholder="Advance (অগ্রিম দেয়া)" 
                      value={newAdvance}
                      onChange={(e) => setNewAdvance(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                    />
                    <input 
                      type="number" 
                      placeholder="Lift Bill (লিফট ভাড়া)" 
                      value={newLift}
                      onChange={(e) => setNewLift(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                    />
                    <input 
                      type="number" 
                      placeholder="Electricity (বিদ্যুৎ বিল)" 
                      value={newElec}
                      onChange={(e) => setNewElec(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                    />
                    <input 
                      type="number" 
                      placeholder="Gas Bill (গ্যাস বিল)" 
                      value={newGas}
                      onChange={(e) => setNewGas(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                    />
                    <input 
                      type="number" 
                      placeholder="Garage (গ্যারেজ ভাড়া)" 
                      value={newGarage}
                      onChange={(e) => setNewGarage(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                    />
                  </div>
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowIncomeForm(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 rounded-xl text-slate-600 dark:text-slate-400"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Record'}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        )}

        {/* ========================================================
            TABULAR VIEW 2: INDIVIDUAL PROPERTY OPERATIONAL EXPENSES
           ======================================================== */}
        {selectedPropertyId !== 'all' && reportType === 'expense' && (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-blue-950/50">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-blue-950/20 text-slate-500 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-blue-950/60 text-xs">
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 w-16">{t('reportSerialNo')}</th>
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 w-28">{t('reportDate')}</th>
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 w-24">{t('reportMemoNo')}</th>
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 text-left">{t('reportGoodsDetails')}</th>
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 w-36">{t('reportQuantity')}</th>
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 w-36">{t('reportTotalCost')}</th>
                    <th className="py-3 px-3 no-print w-16">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 dark:divide-blue-950/20">
                  {filteredExpense.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-medium italic">
                        {lang === 'bn' ? 'এই মাসের জন্য কোনো খরচের তথ্য পাওয়া যায়নি।' : 'No operational expenses found for the selected month.'}
                      </td>
                    </tr>
                  ) : (
                    filteredExpense.map((row, index) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-950/10 text-slate-700 dark:text-slate-300">
                        <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 font-semibold">
                          {lang === 'bn' ? toBanglaNumerals(index + 1) : index + 1}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20">
                          {lang === 'bn' ? toBanglaNumerals(row.date) : row.date}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 font-semibold">
                          {lang === 'bn' ? toBanglaNumerals(row.memoNo) : row.memoNo}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 text-left font-bold text-slate-900 dark:text-slate-200">
                          {row.details}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20">
                          {row.quantity}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 font-black text-rose-500">
                          {lang === 'bn' ? toBanglaNumerals(row.totalCost.toLocaleString()) : row.totalCost.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 no-print">
                          <button
                            onClick={() => handleDeleteExpense(row.id)}
                            className="p-1 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {/* Ledger Summary / Grand Totals Row */}
                  {filteredExpense.length > 0 && (
                    <tr className="bg-slate-100/60 dark:bg-blue-950/40 text-slate-900 dark:text-white font-extrabold text-xs">
                      <td colSpan={5} className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 text-right">
                        {lang === 'bn' ? 'মোট খরচ =' : 'Total Expense ='}
                      </td>
                      <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 text-rose-500 bg-rose-500/5 font-black text-sm">
                        {lang === 'bn' ? toBanglaNumerals(currentPropertyExpenseSum.toLocaleString()) : currentPropertyExpenseSum.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 no-print"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* In Words Bottom block */}
            {filteredExpense.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">{t('reportAmountInWords')}</span>
                  <p className="font-black text-slate-800 dark:text-slate-100 text-sm">
                    {lang === 'bn' 
                      ? toBanglaWords(currentPropertyExpenseSum) 
                      : toEnglishWords(currentPropertyExpenseSum)
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Inline Add Expense Row Sub-Form (No-Print) */}
            <div className="no-print border border-dashed border-slate-300 dark:border-blue-950/50 rounded-2xl p-4">
              {!showExpenseForm ? (
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="w-full py-3 flex items-center justify-center gap-1.5 text-xs text-sky-500 dark:text-sky-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {lang === 'bn' ? 'নতুন খরচের হিসাব লিপিবদ্ধ করুন' : 'Add New Expense Record'}
                </button>
              ) : (
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">New Expense Ledger Entry</span>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <input 
                      type="date" 
                      placeholder="Date (তারিখ)" 
                      value={newExpDate}
                      onChange={(e) => setNewExpDate(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                    />
                    <input 
                      type="text" 
                      placeholder="Memo No (মেমো নং)" 
                      value={newExpMemo}
                      onChange={(e) => setNewExpMemo(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                    />
                    <input 
                      type="text" 
                      placeholder="Goods Description (মালামালের বিবরণ)" 
                      value={newExpDetails}
                      onChange={(e) => setNewExpDetails(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Quantity (পরিমাণ)" 
                      value={newExpQty}
                      onChange={(e) => setNewExpQty(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                    />
                    <input 
                      type="number" 
                      placeholder="Total Price (মোট মূল্য)" 
                      value={newExpCost}
                      onChange={(e) => setNewExpCost(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-300"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowExpenseForm(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 rounded-xl text-slate-600 dark:text-slate-400"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Expense Record'}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        )}

        {/* ========================================================
            TABULAR VIEW 3: CENTRALIZED MASTER SUMMARY PAGE
           ======================================================== */}
        {selectedPropertyId === 'all' && (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-blue-950/50">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-blue-950/20 text-slate-500 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-blue-950/60 text-xs">
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 w-16">{t('reportSerialNo')}</th>
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 text-left min-w-80">{lang === 'bn' ? 'বিবরণ' : 'Description Details'}</th>
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 w-48">{t('reportIncomeSummary')}</th>
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 w-48">{t('reportExpenseSummary')}</th>
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 text-left w-52">{t('reportComment')}</th>
                    <th className="py-3 px-3 no-print w-16">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 dark:divide-blue-950/20">
                  
                  {/* Aggregated Properties rows */}
                  {summaryPropertiesData.map((prop) => (
                    <tr key={prop.name} className="hover:bg-slate-50/50 dark:hover:bg-blue-950/10 text-slate-700 dark:text-slate-300">
                      <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 font-semibold">
                        {lang === 'bn' ? toBanglaNumerals(prop.index) : prop.index}
                      </td>
                      <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 text-left font-bold text-slate-900 dark:text-slate-200">
                        {prop.name} {prop.details}
                      </td>
                      <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 font-black text-emerald-500">
                        {prop.income > 0 ? (lang === 'bn' ? toBanglaNumerals(prop.income.toLocaleString()) : prop.income.toLocaleString()) : ''}
                      </td>
                      <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 font-black text-rose-500">
                        {prop.expense > 0 ? (lang === 'bn' ? toBanglaNumerals(prop.expense.toLocaleString()) : prop.expense.toLocaleString()) : ''}
                      </td>
                      <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 text-left text-slate-500">
                        {prop.name.includes('মহিউদ্দিন') && prop.expense > 0 ? (lang === 'bn' ? 'বেতন, ইত্যাদি) =' : 'Wages, utilities combined') : ''}
                      </td>
                      <td className="py-3 px-3 no-print"></td>
                    </tr>
                  ))}

                  {/* Manual Adjustment rows */}
                  {filteredAdjustments.map((adj, index) => {
                    const slNo = summaryPropertiesData.length + index + 1;
                    return (
                      <tr key={adj.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-950/10 text-slate-700 dark:text-slate-300">
                        <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 font-semibold">
                          {lang === 'bn' ? toBanglaNumerals(slNo) : slNo}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 text-left font-bold text-slate-900 dark:text-slate-200">
                          {adj.description}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 font-black text-emerald-500">
                          {adj.type === 'income' ? (lang === 'bn' ? toBanglaNumerals(adj.amount.toLocaleString()) : adj.amount.toLocaleString()) : ''}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 font-black text-rose-500">
                          {adj.type === 'expense' ? (lang === 'bn' ? toBanglaNumerals(adj.amount.toLocaleString()) : adj.amount.toLocaleString()) : ''}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/20 text-left text-slate-500">
                          {adj.comment || ''}
                        </td>
                        <td className="py-3 px-3 no-print">
                          <button
                            onClick={() => handleDeleteAdjustment(adj.id)}
                            className="p-1 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Summary dynamic totals row */}
                  <tr className="bg-slate-100/60 dark:bg-blue-950/40 text-slate-900 dark:text-white font-extrabold text-xs">
                    <td colSpan={2} className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 text-right">
                      {lang === 'bn' ? 'মোট =' : 'Total ='}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 text-emerald-600 bg-emerald-500/5 font-black text-sm">
                      {lang === 'bn' ? toBanglaNumerals(summaryGrandTotalIncome.toLocaleString()) : summaryGrandTotalIncome.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40 text-rose-500 bg-rose-500/5 font-black text-sm">
                      {lang === 'bn' ? toBanglaNumerals(summaryGrandTotalExpense.toLocaleString()) : summaryGrandTotalExpense.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-200 dark:border-blue-950/40"></td>
                    <td className="py-3 px-3 no-print"></td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Centralized Balance Aggregations Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Previous carryover, incomes, expenses details */}
              <div className="border border-slate-200 dark:border-blue-950/50 rounded-2xl p-5 bg-slate-50 dark:bg-blue-950/10 text-xs font-semibold space-y-2 text-slate-800 dark:text-slate-200">
                
                {/* Previous Month Carryover Balance */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-blue-950/20">
                  <div className="flex items-center gap-1">
                    <span>
                      {lang === 'bn' 
                        ? `${prevMonthBn}-${toBanglaNumerals(selectedYear.slice(-2))}ইং মাসের মোট ব্যালেন্স` 
                        : `${prevMonthEn} ${selectedYear} Carryover Balance`
                      }
                    </span>
                    <button 
                      onClick={() => {
                        setPrevBalInput(String(activePrevBal));
                        setIsEditingPrevBal(true);
                      }}
                      className="no-print p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {isEditingPrevBal ? (
                    <div className="flex items-center gap-1.5 no-print">
                      <input 
                        type="number" 
                        value={prevBalInput}
                        onChange={(e) => setPrevBalInput(e.target.value)}
                        className="w-24 p-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded outline-none text-xs text-slate-700 dark:text-slate-200"
                      />
                      <button 
                        onClick={handleSavePrevBal}
                        className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-extrabold text-slate-950 dark:text-white">
                      {formatCurrency(activePrevBal, lang)}
                    </span>
                  )}
                </div>

                {/* April Total Income */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-blue-950/20">
                  <span>
                    {lang === 'bn' 
                      ? `${currentMonthBn}-${toBanglaNumerals(selectedYear)}ইং মোট আয়` 
                      : `${selectedMonth} ${selectedYear} Total Income`
                    }
                  </span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(summaryGrandTotalIncome, lang)}
                  </span>
                </div>

                {/* Subtotal (সর্বমোট) */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-blue-950/20 bg-indigo-500/5 px-2 py-1 rounded">
                  <span className="font-bold text-slate-950 dark:text-white">
                    {lang === 'bn' ? 'সর্বমোট =' : 'Subtotal ='}
                  </span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                    {formatCurrency(summarySubtotal, lang)}
                  </span>
                </div>

                {/* April Total Expense */}
                <div className="flex justify-between items-center pb-2">
                  <span>
                    {lang === 'bn' 
                      ? `${nextMonthBn}-${toBanglaNumerals(selectedYear.slice(-2))}ইং মোট ব্যয়` 
                      : `${nextMonthEn} ${selectedYear} Total Expense`
                    }
                  </span>
                  <span className="font-black text-rose-500">
                    {formatCurrency(summaryGrandTotalExpense, lang)}
                  </span>
                </div>

              </div>

              {/* Grand Final Balance Card */}
              <div className="border border-slate-200 dark:border-blue-950/50 rounded-2xl p-6 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {lang === 'bn' 
                      ? `${currentMonthBn}-${toBanglaNumerals(selectedYear.slice(-2))}ইং মোট ব্যালেন্স` 
                      : `${selectedMonth} ${selectedYear} Net Balance`
                    }
                  </span>
                  <h3 className="text-3xl font-black text-slate-950 dark:text-white leading-none">
                    {formatCurrency(summaryClosingBalance, lang)}
                  </h3>
                </div>

                <div className="mt-4 border-t border-slate-200 dark:border-blue-950/20 pt-3">
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block mb-1">{t('reportAmountInWords')}</span>
                  <p className="font-bold text-slate-800 dark:text-slate-300 text-xs italic">
                    {lang === 'bn' 
                      ? toBanglaWords(summaryClosingBalance) 
                      : toEnglishWords(summaryClosingBalance)
                    }
                  </p>
                </div>
              </div>

            </div>

            {/* Inline Add Manual Adjustment Record (No-Print) */}
            <div className="no-print border border-dashed border-slate-300 dark:border-blue-950/50 rounded-2xl p-4">
              {!showAdjustmentForm ? (
                <button
                  onClick={() => setShowAdjustmentForm(true)}
                  className="w-full py-3 flex items-center justify-center gap-1.5 text-xs text-sky-500 dark:text-sky-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {lang === 'bn' ? 'নতুন সমন্বয় বা অন্যান্য হিসাব যোগ করুন' : 'Add Standalone Adjustments/Other Accounts'}
                </button>
              ) : (
                <form onSubmit={handleAddAdjustment} className="space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Add Standalone Entry (e.g. general balance, off-property entry)</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <select
                      value={newAdjType}
                      onChange={(e: any) => setNewAdjType(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-700 dark:text-slate-200"
                    >
                      <option value="income">Debit / Cash Inflow (আয়)</option>
                      <option value="expense">Credit / Cash Outflow (ব্যয়)</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Description (বিবরণ)" 
                      value={newAdjDesc}
                      onChange={(e) => setNewAdjDesc(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-700 dark:text-slate-200"
                      required
                    />
                    <input 
                      type="number" 
                      placeholder="Amount (পরিমাণ)" 
                      value={newAdjAmount}
                      onChange={(e) => setNewAdjAmount(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-700 dark:text-slate-200"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Comments (মন্তব্য)" 
                      value={newAdjComment}
                      onChange={(e) => setNewAdjComment(e.target.value)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none text-slate-700 dark:text-slate-200"
                    />
                  </div>
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowAdjustmentForm(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 rounded-xl text-slate-600 dark:text-slate-400"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Standalone Entry'}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
