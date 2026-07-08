import { useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

const translations = {
  bn: {
    // Brand & Meta
    appName: 'বঙ্গ প্রপার্টি ইআরপি',
    footerMadeBy: 'মেড বাই সফটওয়্যার পয়েন্ট',
    hotline: 'হটলাইন: ০১৭২৪-৫৬১৬৭০',
    slogan: 'আধুনিক প্রপার্টি ম্যানেজমেন্ট সফটওয়্যার',

    // Sidebar / Navigation
    dashboard: 'ড্যাশবোর্ড',
    propertyMgmt: 'প্রপার্টি ম্যানেজমেন্ট',
    tenantMgmt: 'ভাড়াটিয়া তথ্য',
    rentMgmt: 'ভাড়া কালেকশন',
    receiptMgmt: 'মানি রিসিট',
    utilityMgmt: 'ইউটিলিটি বিল',
    maintenanceMgmt: 'রক্ষণাবেক্ষণ',
    visitorMgmt: 'ভিজিটর রেজিস্টার',
    parkingMgmt: 'পার্কিং বরাদ্দ',
    employeeMgmt: 'কর্মচারী তালিকা',
    salesBooking: 'সেলস ও বুকিং',
    installmentMgmt: 'কিস্তি ট্র্যাকিং',
    accountingSystem: 'হিসাববিজ্ঞান',
    crmModule: 'গ্রাহক সিআরএম',
    documentMgmt: 'ডকুমেন্টস',
    noticeBoard: 'নোটিশ বোর্ড',
    reports: 'রিপোর্ট সমূহ',
    superAdmin: 'সুপার এডমিন',
    tenantPortal: 'ভাড়াটিয়া পোর্টাল',

    // Quick Controls
    selectOrg: 'প্রতিষ্ঠান নির্বাচন',
    selectRole: 'রোল নির্বাচন',
    toggleTheme: 'থিম পরিবর্তন',
    langName: 'English',
    notifications: 'নোটিফিকেশন',

    // Dashboard Metrics
    todayCollection: 'আজকের কালেকশন',
    monthlyRent: 'চলতি মাসের ভাড়া',
    pendingRent: 'বকেয়া ভাড়া',
    currentMonthReceivableRent: 'চলতি মাসের প্রাপ্য ভাড়া',
    rentCollected: 'ভাড়া আদায়',
    rentDue: 'ভাড়া বকেয়া',
    advanceBalance: 'অগ্রিম ব্যালেন্স',
    dueSummary: 'মোট বকেয়া বিবরণী',
    occupancyRate: 'ভাড়ার হার (Occupancy)',
    vacantFlats: 'ফাঁকা ফ্ল্যাট',
    vacantShops: 'ফাঁকা দোকান',
    maintenanceCollection: 'রক্ষণাবেক্ষণ ফান্ড',
    utilityCollection: 'ইউটিলিটি সংগ্রহ',
    recentPayments: 'সাম্প্রতিক পেমেন্ট',
    recentTenants: 'নতুন ভাড়াটিয়া',
    upcomingRent: 'আসন্ন ভাড়া',
    leaseExpiry: 'চুক্তি মেয়াদ শেষ',
    maintenanceRequests: 'রক্ষণাবেক্ষণ অনুরোধ',
    topProperties: 'শীর্ষ প্রপার্টি',
    revenueAnalytics: 'রাজস্ব বিশ্লেষণ',
    expenseAnalytics: 'ব্যয় বিশ্লেষণ',
    cashFlow: 'ক্যাশ ফ্লো',
    bankBalance: 'ব্যাংক ব্যালেন্স',
    projectStatus: 'প্রজেক্টের অবস্থা',
    salesSummary: 'বিক্রয় সামারি',
    bookingSummary: 'বুকিং বিবরণী',
    customerSummary: 'গ্রাহক সংখ্যা',

    // Common Actions
    add: 'যোগ করুন',
    edit: 'সম্পাদনা',
    delete: 'ডিলিট',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    search: 'খুঁজুন...',
    filter: 'ফিল্টার',
    print: 'প্রিন্ট করুন',
    download: 'ডাউনলোড',
    actions: 'অ্যাকশন',
    status: 'অবস্থা',
    active: 'সক্রিয়',
    inactive: 'নিষ্ক্রিয়',
    underConstruction: 'চলমান কাজ',
    completed: 'সম্পন্ন',
    sold: 'বিক্রিত',
    rented: 'ভাড়া হয়েছে',
    reserved: 'বুকড',
    maintenance: 'রক্ষণাবেক্ষণাধীন',
    vacant: 'ফাঁকা',
    occupied: 'ভাড়াটিয়া আছে',

    // Property Modules
    propertyName: 'প্রপার্টির নাম',
    propertyType: 'প্রপার্টির ধরন',
    totalFloors: 'মোট তলা',
    totalUnits: 'মোট ইউনিট',
    location: 'ঠিকানা',
    sqft: 'বর্গফুট',
    rentAmount: 'ভাড়ার পরিমাণ',
    serviceCharge: 'সার্ভিস চার্জ',
    securityDeposit: 'সিকিউরিটি ডিপোজিট',
    bedrooms: 'বেডরুম',
    bathrooms: 'বাথরুম',
    balcony: 'বারান্দা',
    facing: 'দিক',
    meterNumber: 'মিটার নম্বর',

    // Tenant Fields
    tenantName: 'ভাড়াটিয়ার নাম',
    phone: 'মোবাইল নম্বর',
    nid: 'এনআইডি নম্বর',
    occupation: 'পেশা',
    emergencyContact: 'জরুরি যোগাযোগ',
    moveInDate: 'ভাড়ার তারিখ',
    agreementDoc: 'চুক্তিপত্র ফাইল',

    // Invoice / Payments
    invoiceNumber: 'ইনভয়েস নং',
    receiptNumber: 'রিসিট নং',
    issueDate: 'ইস্যুর তারিখ',
    dueDate: 'পরিশোধের তারিখ',
    paymentMethod: 'পেমেন্টের মাধ্যম',
    amountPaid: 'পরিশোধিত টাকা',
    mfsCheckout: 'বিকাশ / নগদ পেমেন্ট উইন্ডো',
    verifyQR: 'কিউআর কোড ভেরিফিকেশন',
    digitalSignature: 'ডিজিটাল স্বাক্ষর',
    cash: 'নগদ ক্যাশ',
    bkash: 'বিকাশ',
    nagad: 'নগদ',
    rocket: 'রকেট',
    bank: 'ব্যাংক ট্রান্সফার',
    cheque: 'চেক',

    // Utilities
    electricity: 'বিদ্যুৎ বিল',
    gas: 'গ্যাস বিল',
    water: 'পানি বিল',
    generator: 'জেনারেটর বিল',
    lift: 'লিফট চার্জ',
    garbage: 'ময়লা বিল',
    security: 'নিরাপত্তা গার্ড বিল',
    cleaning: 'পরিচ্ছন্নতা বিল',
    prevReading: 'পূর্ববর্তী রিডিং',
    currReading: 'বর্তমান রিডিং',
    unitPrice: 'ইউনিট প্রতি মূল্য',

    // Maintenance
    issueTitle: 'সমস্যার বিবরণ',
    technicianName: 'টেকনিশিয়ানের নাম',
    priority: 'জরুরিতা',
    cost: 'ব্যয়',
    assignedTo: 'দায়িত্বপ্রাপ্ত',
    high: 'উচ্চ',
    medium: 'মাঝারি',
    low: 'নিম্ন',

    // AI Assistant
    aiSmartTitle: 'এআই স্মার্ট প্রেডিকশন ও ফোরকাস্ট',
    aiVacancyPredict: 'এআই ফাঁকা হওয়ার পূর্বাভাস',
    aiRentSuggest: 'এআই ভাড়া নির্ধারণ সাজেশন',
    aiRiskScore: 'ভাড়াটিয়া পেমেন্ট রিস্ক স্কোর',
    aiForecastRevenue: 'পরবর্তী ৬ মাসের রাজস্ব ফোরকাস্ট',
    aiChatAssistant: 'এআই ইআরপি চ্যাট অ্যাসিস্ট্যান্ট',
    aiChatPlaceholder: 'প্রপার্টি বা হিসাব নিয়ে প্রশ্ন করুন...',
    aiResponseLabel: 'এআই উত্তর',

    // Accounting
    chartOfAccounts: 'চার্ট অফ অ্যাকাউন্টস',
    debit: 'ডেবিট',
    credit: 'ক্রেডিট',
    balance: 'ব্যালেন্স',
    income: 'আয়',
    expense: 'ব্যয়',
    journalEntry: 'জার্নাল এন্ট্রি',
    pettyCash: 'খুচরা ক্যাশ',
    profitAndLoss: 'লাভ-ক্ষতি হিসাব',

    // Visitor & Parking
    visitorName: 'ভিজিটরের নাম',
    whomToVisit: 'যার সাথে সাক্ষাৎ করবেন',
    entryTime: 'প্রবেশের সময়',
    exitTime: 'বাহির হওয়ার সময়',
    passCode: 'পাস কোড',
    parkingNo: 'পার্কিং স্পেস নং',

    // Reports Additions
    reportFloorNo: 'ফ্লোর নং',
    reportFlatNo: 'ফ্ল্যাট নং',
    reportTenantName: 'ভাড়াটিয়া নাম',
    reportFlatRent: 'ফ্ল্যাট ভাড়া',
    reportAdvance: 'অগ্রিম দেয়া',
    reportLiftBill: 'লিফট ভাড়া',
    reportElectricityBill: 'বিদ্যুৎ বিল',
    reportGasBill: 'গ্যাস বিল',
    reportGarageRent: 'গ্যারেজ ভাড়া',
    reportTotalRent: 'মোট ভাড়া',
    reportGrandTotal: 'সর্বমোট =',
    reportAmountInWords: 'কথায় :',
    reportMemoNo: 'মেমো নং',
    reportGoodsDetails: 'মালামালের বিবরণ',
    reportQuantity: 'পরিমাণ',
    reportTotalCost: 'মোট মূল্য',
    reportSerialNo: 'ক্রমিক নং',
    reportDate: 'তারিখ',
    reportSummaryTitle: 'মোট আয়-ব্যয়ের হিসাবসমূহ',
    reportPrevBalance: 'পূর্ববর্তী মাসের ব্যালেন্স',
    reportFinalBalance: 'চূড়ান্ত ব্যালেন্স',
    reportIncomeLedger: 'আয় হিসাব',
    reportExpenseLedger: 'ব্যয় হিসাব',
    reportIncomeSummary: 'মোট আয়',
    reportExpenseSummary: 'মোট ব্যয়',
    reportComment: 'মন্তব্য'
  },
  en: {
    // Brand & Meta
    appName: 'Bongo Property ERP',
    footerMadeBy: 'Made by Software Point',
    hotline: 'Hotline: 01724-561670',
    slogan: 'Modern Property Management ERP',

    // Sidebar / Navigation
    dashboard: 'Dashboard',
    propertyMgmt: 'Property Management',
    tenantMgmt: 'Tenant CRM',
    rentMgmt: 'Rent Management',
    receiptMgmt: 'Money Receipt',
    utilityMgmt: 'Utility Billing',
    maintenanceMgmt: 'Maintenance Logs',
    visitorMgmt: 'Visitor Management',
    parkingMgmt: 'Parking Allocation',
    employeeMgmt: 'Employee List',
    salesBooking: 'Sales & Booking',
    installmentMgmt: 'Installments Tracker',
    accountingSystem: 'Accounting System',
    crmModule: 'Customer CRM',
    documentMgmt: 'Documents',
    noticeBoard: 'Notice Board',
    reports: 'Reports Dashboard',
    superAdmin: 'Super Admin Panel',
    tenantPortal: 'Tenant Portal',

    // Quick Controls
    selectOrg: 'Switch Company',
    selectRole: 'Switch Role',
    toggleTheme: 'Toggle Theme',
    langName: 'বাংলা',
    notifications: 'Notifications',

    // Dashboard Metrics
    todayCollection: "Today's Collection",
    monthlyRent: 'Monthly Rent Billing',
    pendingRent: 'Pending Rent',
    currentMonthReceivableRent: "Current Month's Receivable Rent",
    rentCollected: 'Rent Collected',
    rentDue: 'Rent Outstanding',
    advanceBalance: 'Advance Balance',
    dueSummary: 'Total Due Summary',
    occupancyRate: 'Occupancy Rate',
    vacantFlats: 'Vacant Flats',
    vacantShops: 'Vacant Shops',
    maintenanceCollection: 'Maintenance Fund',
    utilityCollection: 'Utility Collection',
    recentPayments: 'Recent Payments',
    recentTenants: 'Recent Tenants',
    upcomingRent: 'Upcoming Rent',
    leaseExpiry: 'Lease Contract Expiry',
    maintenanceRequests: 'Maintenance Requests',
    topProperties: 'Top Properties',
    revenueAnalytics: 'Revenue Analytics',
    expenseAnalytics: 'Expense Analytics',
    cashFlow: 'Cash Flow',
    bankBalance: 'Bank Balance',
    projectStatus: 'Project Status',
    salesSummary: 'Sales Summary',
    bookingSummary: 'Booking Summary',
    customerSummary: 'Total Customers',

    // Common Actions
    add: 'Add New',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save Changes',
    cancel: 'Cancel',
    search: 'Search...',
    filter: 'Filter',
    print: 'Print',
    download: 'Download PDF',
    actions: 'Actions',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    underConstruction: 'Under Construction',
    completed: 'Completed',
    sold: 'Sold',
    rented: 'Rented',
    reserved: 'Reserved',
    maintenance: 'Maintenance',
    vacant: 'Vacant',
    occupied: 'Occupied',

    // Property Modules
    propertyName: 'Property Name',
    propertyType: 'Property Type',
    totalFloors: 'Total Floors',
    totalUnits: 'Total Units',
    location: 'Location Address',
    sqft: 'Size (Sqft)',
    rentAmount: 'Rent Amount',
    serviceCharge: 'Service Charge',
    securityDeposit: 'Security Deposit',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    balcony: 'Balcony',
    facing: 'Facing Direction',
    meterNumber: 'Meter Number',

    // Tenant Fields
    tenantName: 'Tenant Name',
    phone: 'Mobile Phone',
    nid: 'NID Number',
    occupation: 'Occupation',
    emergencyContact: 'Emergency Contact',
    moveInDate: 'Move In Date',
    agreementDoc: 'Agreement PDF',

    // Invoice / Payments
    invoiceNumber: 'Invoice No',
    receiptNumber: 'Receipt No',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    paymentMethod: 'Payment Method',
    amountPaid: 'Amount Paid',
    mfsCheckout: 'MFS Gateway (bKash/Nagad)',
    verifyQR: 'QR Verification Code',
    digitalSignature: 'Digital Signature',
    cash: 'Cash Payment',
    bkash: 'bKash Wallet',
    nagad: 'Nagad Wallet',
    rocket: 'Rocket Wallet',
    bank: 'Bank Transfer',
    cheque: 'Cheque Payment',

    // Utilities
    electricity: 'Electricity Bill',
    gas: 'Gas Bill',
    water: 'Water Bill',
    generator: 'Generator Bill',
    lift: 'Lift Charge',
    garbage: 'Garbage Charge',
    security: 'Security Fee',
    cleaning: 'Cleaning Fee',
    prevReading: 'Previous Meter Reading',
    currReading: 'Current Meter Reading',
    unitPrice: 'Unit Unit Price',

    // Maintenance
    issueTitle: 'Maintenance Description',
    technicianName: 'Technician Name',
    priority: 'Priority Level',
    cost: 'Repair Cost',
    assignedTo: 'Assigned Specialist',
    high: 'High',
    medium: 'Medium',
    low: 'Low',

    // AI Assistant
    aiSmartTitle: 'AI Smart Forecasting & Insights',
    aiVacancyPredict: 'AI Vacancy Prediction',
    aiRentSuggest: 'AI Rent Estimator',
    aiRiskScore: 'Tenant Credit Risk Score',
    aiForecastRevenue: 'Revenue Forecast (6 Months)',
    aiChatAssistant: 'AI ERP Chat Assistant',
    aiChatPlaceholder: 'Ask something about accounts, rents or leases...',
    aiResponseLabel: 'AI Response',

    // Accounting
    chartOfAccounts: 'Chart of Accounts',
    debit: 'Debit',
    credit: 'Credit',
    balance: 'Ledger Balance',
    income: 'Total Income',
    expense: 'Total Expense',
    journalEntry: 'Journal Ledger',
    pettyCash: 'Petty Cash Log',
    profitAndLoss: 'Profit & Loss Statement',

    // Visitor & Parking
    visitorName: 'Visitor Full Name',
    whomToVisit: 'Host/Unit to Visit',
    entryTime: 'Check-In Time',
    exitTime: 'Check-Out Time',
    passCode: 'Entry Code',
    parkingNo: 'Parking Bay No',

    // Reports Additions
    reportFloorNo: 'Floor No',
    reportFlatNo: 'Flat No',
    reportTenantName: 'Tenant Name',
    reportFlatRent: 'Flat Rent',
    reportAdvance: 'Advance Deposit',
    reportLiftBill: 'Lift Charge',
    reportElectricityBill: 'Electricity Bill',
    reportGasBill: 'Gas Bill',
    reportGarageRent: 'Garage Rent',
    reportTotalRent: 'Total Rent',
    reportGrandTotal: 'Grand Total =',
    reportAmountInWords: 'In Words:',
    reportMemoNo: 'Memo No',
    reportGoodsDetails: 'Description of Goods',
    reportQuantity: 'Quantity',
    reportTotalCost: 'Total Cost',
    reportSerialNo: 'S.No',
    reportDate: 'Date',
    reportSummaryTitle: 'Income & Expense Statement Summary',
    reportPrevBalance: 'Previous Month Balance Carryover',
    reportFinalBalance: 'Monthly Closing Balance',
    reportIncomeLedger: 'Income Ledger',
    reportExpenseLedger: 'Expense Ledger',
    reportIncomeSummary: 'Total Income',
    reportExpenseSummary: 'Total Expense',
    reportComment: 'Remarks'
  }
};

export function useTranslation() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('bongo_erp_lang');
    return (saved === 'en' || saved === 'bn') ? (saved as Language) : 'bn'; // Default Bangla
  });

  useEffect(() => {
    const handleLangChange = () => {
      const saved = localStorage.getItem('bongo_erp_lang');
      if (saved === 'en' || saved === 'bn') {
        setLang(saved as Language);
      }
    };
    window.addEventListener('storage', handleLangChange);
    window.addEventListener('bongo_lang_change', handleLangChange);
    return () => {
      window.removeEventListener('storage', handleLangChange);
      window.removeEventListener('bongo_lang_change', handleLangChange);
    };
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'bn' ? 'en' : 'bn';
    setLang(nextLang);
    localStorage.setItem('bongo_erp_lang', nextLang);
    window.dispatchEvent(new Event('bongo_lang_change'));
  };

  const t = (key: keyof typeof translations['en']): string => {
    return translations[lang][key] || translations['en'][key] || String(key);
  };

  return { lang, setLang, toggleLanguage, t };
}
