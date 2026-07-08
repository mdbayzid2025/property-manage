export interface Company {
  id: string;
  name: string;
  type: string;
  address: string;
  plan: 'Basic' | 'Standard' | 'Enterprise';
  expiryDate: string;
  suspended: boolean;
}

export interface Property {
  id: string;
  companyId: string;
  name: string;
  type: 'residential' | 'commercial' | 'shopping' | 'office' | 'land' | 'mixed';
  address: string;
  floors: number;
  totalUnits: number;
  status: 'active' | 'inactive' | 'construction';
}

export interface Unit {
  id: string;
  propertyId: string;
  number: string;
  floor: number;
  type: 'flat' | 'shop' | 'office' | 'parking';
  sizeSqft: number;
  rentAmount: number;
  serviceCharge: number;
  securityDeposit: number;
  status: 'vacant' | 'occupied' | 'reserved' | 'sold' | 'maintenance';
  bedrooms?: number;
  bathrooms?: number;
  meterNumber?: string;
}

export interface Tenant {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  nid?: string;
  email?: string;
  occupation: string;
  unitId: string;
  moveInDate: string;
  moveOutDate?: string;
  emergencyContact: string;
  status: 'active' | 'blacklisted' | 'moved_out';
  agreementDoc?: string;
  documents?: TenantDoc[];
}

export interface Invoice {
  id: string;
  companyId: string;
  unitId: string;
  tenantId: string;
  invoiceType: 'rent' | 'utility' | 'maintenance' | 'booking' | 'installment';
  amount: number;
  dueDate: string;
  billingMonth: string; // e.g. "July 2026"
  status: 'paid' | 'pending' | 'due' | 'partial';
  paidAmount: number;
  paymentDate?: string;
  paymentMethod?: string;
  details: string; // JSON or desc
}

export interface Receipt {
  id: string;
  invoiceId: string;
  receiptNumber: string;
  receivedAmount: number;
  receivedDate: string;
  receivedBy: string;
  paymentMethod: string;
  remarks?: string;
}

export interface UtilityReading {
  id: string;
  unitId: string;
  utilityType: 'electricity' | 'gas' | 'water';
  billingMonth: string;
  prevReading: number;
  currReading: number;
  ratePerUnit: number;
  calculatedBill: number;
  status: 'billed' | 'pending';
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved';
  technicianName?: string;
  materialCost: number;
  laborCost: number;
  createdAt: string;
}

export interface Visitor {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  nid?: string;
  unitId: string;
  purpose: string;
  entryTime: string;
  exitTime?: string;
  passCode: string;
}

export interface ParkingSpace {
  id: string;
  propertyId: string;
  slotNumber: string;
  allocatedTo?: string; // unitId
  vehiclePlate?: string;
  rentAmount: number;
  status: 'vacant' | 'occupied';
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  role: string;
  department?: string;
  salary: number;
  joinDate: string;
  attendanceDays?: number;
  address?: string;
  propertyId?: string;
  status?: 'active' | 'former';
  documents?: TenantDoc[];
}

export interface Booking {
  id: string;
  companyId: string;
  unitId: string;
  customerName: string;
  customerPhone: string;
  customerNid: string;
  bookingAmount: number;
  totalPrice: number;
  bookingDate: string;
  status: 'active' | 'completed' | 'cancelled';
  downPayment: number;
  installmentsCount: number;
}

export interface Installment {
  id: string;
  bookingId: string;
  installmentNo: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'paid' | 'due' | 'pending';
  paymentDate?: string;
}

export interface AccountTransaction {
  id: string;
  companyId: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  account: string; // e.g. "Cashbook", "Bank Account", "Bkash Merchant"
  amount: number;
  description: string;
  propertyId?: string;
  invoiceNo?: string;
  note?: string;
}

// Global Demo Data Seeds
const DEMO_COMPANIES: Company[] = [
  { id: 'c1', name: 'বঙ্গ প্রোপার্টি হোল্ডিংস লিমিটেড (Bongo Holdings)', type: 'Real Estate Developer', address: 'ধানমন্ডি, ঢাকা', plan: 'Enterprise', expiryDate: '2027-12-31', suspended: false },
  { id: 'c2', name: 'অনন্যা হাইটস কমার্শিয়াল (Anannya Plaza)', type: 'Commercial Shopping Complex', address: 'গুলশান-২, ঢাকা', plan: 'Standard', expiryDate: '2026-12-31', suspended: false },
  { id: 'c3', name: 'আমান গ্রিন ভ্যালি (Aman Land Projects)', type: 'Housing & Land Developers', address: 'পূর্বাচল, ঢাকা', plan: 'Basic', expiryDate: '2026-09-30', suspended: false }
];

const DEMO_PROPERTIES: Property[] = [
  { id: 'p1', companyId: 'c1', name: 'বঙ্গ টাওয়ার (Dhanmondi)', type: 'mixed', address: 'রোড ৮/এ, ধানমন্ডি, ঢাকা', floors: 10, totalUnits: 15, status: 'active' },
  { id: 'p2', companyId: 'c2', name: 'অনন্যা প্লাজা (Gulshan)', type: 'commercial', address: 'গুলশান সার্কেল ২, ঢাকা', floors: 5, totalUnits: 5, status: 'active' },
  { id: 'p3', companyId: 'c3', name: 'আমান ভ্যালি ফেজ-১', type: 'land', address: 'সেক্টর ৪, পূর্বাচল, ঢাকা', floors: 0, totalUnits: 20, status: 'construction' }
];

const DEMO_UNITS: Unit[] = [
  // Bongo Tower
  { id: 'u1', propertyId: 'p1', number: 'Flat A1', floor: 1, type: 'flat', sizeSqft: 1800, rentAmount: 32000, serviceCharge: 5000, securityDeposit: 64000, status: 'occupied', bedrooms: 3, bathrooms: 3, meterNumber: 'E-882711' },
  { id: 'u2', propertyId: 'p1', number: 'Flat A2', floor: 1, type: 'flat', sizeSqft: 1800, rentAmount: 32000, serviceCharge: 5000, securityDeposit: 64000, status: 'vacant', bedrooms: 3, bathrooms: 3, meterNumber: 'E-882712' },
  { id: 'u3', propertyId: 'p1', number: 'Flat B1', floor: 2, type: 'flat', sizeSqft: 1500, rentAmount: 26000, serviceCharge: 4000, securityDeposit: 52000, status: 'occupied', bedrooms: 3, bathrooms: 2, meterNumber: 'E-882721' },
  { id: 'u4', propertyId: 'p1', number: 'Flat B2', floor: 2, type: 'flat', sizeSqft: 1500, rentAmount: 26000, serviceCharge: 4000, securityDeposit: 52000, status: 'maintenance', bedrooms: 3, bathrooms: 2, meterNumber: 'E-882722' },
  { id: 'u5', propertyId: 'p1', number: 'Shop 101', floor: 0, type: 'shop', sizeSqft: 450, rentAmount: 45000, serviceCharge: 8000, securityDeposit: 90000, status: 'occupied', meterNumber: 'E-900101' },
  { id: 'u6', propertyId: 'p1', number: 'Shop 102', floor: 0, type: 'shop', sizeSqft: 600, rentAmount: 60000, serviceCharge: 10000, securityDeposit: 120000, status: 'reserved', meterNumber: 'E-900102' },
  
  // Anannya Plaza
  { id: 'u7', propertyId: 'p2', number: 'Office 201', floor: 2, type: 'office', sizeSqft: 3500, rentAmount: 120000, serviceCharge: 25000, securityDeposit: 240000, status: 'occupied', meterNumber: 'E-700201' },
  { id: 'u8', propertyId: 'p2', number: 'Office 301', floor: 3, type: 'office', sizeSqft: 3500, rentAmount: 120000, serviceCharge: 25000, securityDeposit: 240000, status: 'vacant', meterNumber: 'E-700301' },
  
  // Aman Valley
  { id: 'u9', propertyId: 'p3', number: 'Plot A-5', floor: 0, type: 'parking', sizeSqft: 21780, rentAmount: 0, serviceCharge: 2000, securityDeposit: 0, status: 'sold' },
  { id: 'u10', propertyId: 'p3', number: 'Plot A-6', floor: 0, type: 'parking', sizeSqft: 21780, rentAmount: 0, serviceCharge: 2000, securityDeposit: 0, status: 'reserved' }
];

export interface TenantDoc {
  name: string;
  size: string;
  type: string;
  previewUrl?: string; // base64 or mock preview path
}

const DEMO_TENANTS: Tenant[] = [
  { 
    id: 't1', 
    companyId: 'c1', 
    name: 'কামরুল হাসান চৌধুরী', 
    phone: '01712-345678', 
    nid: '3829102938210', 
    email: 'kamrul.hasan@gmail.com', 
    occupation: 'উচ্চপদস্থ সরকারি কর্মকর্তা', 
    unitId: 'u1', 
    moveInDate: '2025-01-01', 
    emergencyContact: '০১৮১২-৯৯০৯৯০ (স্ত্রী)', 
    status: 'active',
    documents: [
      { name: 'NID Card Copy.pdf', size: '142 KB', type: 'application/pdf' },
      { name: 'Rental Agreement Deed.pdf', size: '1.2 MB', type: 'application/pdf' }
    ]
  },
  { 
    id: 't2', 
    companyId: 'c1', 
    name: 'রনি ইলেকট্রনিক্স (মালিক: রফিকুল আলম)', 
    phone: '01911-887766', 
    nid: '8827162534210', 
    email: 'rony.electronics@yahoo.com', 
    occupation: 'ব্যবসা', 
    unitId: 'u5', 
    moveInDate: '2024-05-15', 
    emergencyContact: '০১৭৫৫-৬৬৭৭৮৮ (ম্যানেজার)', 
    status: 'active',
    documents: [
      { name: 'Trade License Copy.pdf', size: '350 KB', type: 'application/pdf' }
    ]
  },
  { 
    id: 't3', 
    companyId: 'c2', 
    name: 'সফটওয়্যার পয়েন্ট বিডি (মালিক: মইনুল ইসলাম)', 
    phone: '01724-561670', 
    nid: '1928374650123', 
    email: 'info@softwarepointbd.com', 
    occupation: 'আইটি কোম্পানি', 
    unitId: 'u7', 
    moveInDate: '2023-11-01', 
    emergencyContact: '০১৮১৬-২১২১২১ (অপারেশন্স ম্যানেজার)', 
    status: 'active',
    documents: [
      { name: 'Office Rent Agreement.pdf', size: '2.1 MB', type: 'application/pdf' }
    ]
  }
];

const DEMO_INVOICES: Invoice[] = [
  // Kamrul Hasan (Flat A1) - Rents (c1)
  { id: 'inv1', companyId: 'c1', unitId: 'u1', tenantId: 't1', invoiceType: 'rent', amount: 37000, dueDate: '2026-06-10', billingMonth: 'June 2026', status: 'paid', paidAmount: 37000, paymentDate: '2026-06-08', paymentMethod: 'bKash', details: 'ভাড়া: ৩২,০০০৳, সার্ভিস চার্জ: ৫,০০০৳' },
  { id: 'inv2', companyId: 'c1', unitId: 'u1', tenantId: 't1', invoiceType: 'rent', amount: 37000, dueDate: '2026-07-10', billingMonth: 'July 2026', status: 'due', paidAmount: 0, details: 'ভাড়া: ৩২,০০০৳, সার্ভিস চার্জ: ৫,০০০৳' },
  
  // Rony Electronics (Shop 101) - Rents (c1)
  { id: 'inv3', companyId: 'c1', unitId: 'u5', tenantId: 't2', invoiceType: 'rent', amount: 53000, dueDate: '2026-06-10', billingMonth: 'June 2026', status: 'paid', paidAmount: 53000, paymentDate: '2026-06-09', paymentMethod: 'Cash', details: 'দোকান ভাড়া: ৪৫,০০০৳, সার্ভিস চার্জ: ৮,০০০৳' },
  { id: 'inv4', companyId: 'c1', unitId: 'u5', tenantId: 't2', invoiceType: 'rent', amount: 53000, dueDate: '2026-07-10', billingMonth: 'July 2026', status: 'pending', paidAmount: 20000, paymentDate: '2026-07-04', paymentMethod: 'Nagad', details: 'দোকান ভাড়া: ৪৫,০০০৳, সার্ভিস চার্জ: ৮,০০০৳ (আংশিক পরিশোধ)' },

  // Software Point (Office 201) (c2)
  { id: 'inv5', companyId: 'c2', unitId: 'u7', tenantId: 't3', invoiceType: 'rent', amount: 145000, dueDate: '2026-07-05', billingMonth: 'July 2026', status: 'paid', paidAmount: 145000, paymentDate: '2026-07-04', paymentMethod: 'Bank Transfer', details: 'অফিস ভাড়া: ১,২০,০০০৳, সার্ভিস চার্জ: ২৫,০০০৳' }
];

const DEMO_RECEIPTS: Receipt[] = [
  { id: 'rcpt1', invoiceId: 'inv1', receiptNumber: 'MR-2026-0001', receivedAmount: 37000, receivedDate: '2026-06-08', receivedBy: 'ক্যাশিয়ার রফিক', paymentMethod: 'bKash', remarks: 'মোবাইল ব্যাংকিং পেমেন্ট সম্পন্ন' },
  { id: 'rcpt2', invoiceId: 'inv3', receiptNumber: 'MR-2026-0002', receivedAmount: 53000, receivedDate: '2026-06-09', receivedBy: 'ক্যাশিয়ার রফিক', paymentMethod: 'Cash', remarks: 'নগদ ক্যাশ গ্রহণ' },
  { id: 'rcpt3', invoiceId: 'inv5', receiptNumber: 'MR-2026-0003', receivedAmount: 145000, receivedDate: '2026-07-04', receivedBy: 'অ্যাকাউন্ট্যান্ট শফিক', paymentMethod: 'Bank Transfer', remarks: 'ব্যাংক জমা চেক নং ৮৮৭২১৯২' }
];

const DEMO_UTILITIES: UtilityReading[] = [
  { id: 'ut1', unitId: 'u1', utilityType: 'electricity', billingMonth: 'June 2026', prevReading: 12450, currReading: 12790, ratePerUnit: 12, calculatedBill: 4080, status: 'billed' },
  { id: 'ut2', unitId: 'u1', utilityType: 'water', billingMonth: 'June 2026', prevReading: 480, currReading: 510, ratePerUnit: 40, calculatedBill: 1200, status: 'billed' },
  { id: 'ut3', unitId: 'u5', utilityType: 'electricity', billingMonth: 'June 2026', prevReading: 34100, currReading: 34950, ratePerUnit: 14, calculatedBill: 11900, status: 'billed' }
];

const DEMO_MAINTENANCE: MaintenanceRequest[] = [
  { id: 'm1', propertyId: 'p1', unitId: 'u1', tenantId: 't1', title: 'বাথরুম ট্যাপ লিক', description: 'মাস্টার বেডরুমের সংযুক্ত বাথরুমে পানির কল থেকে অবিরাম পানি ঝড়ছে। দ্রুত কল পরিবর্তন প্রয়োজন।', priority: 'medium', status: 'resolved', technicianName: 'রহমান প্লাম্বার', materialCost: 450, laborCost: 300, createdAt: '2026-07-01' },
  { id: 'm2', propertyId: 'p1', unitId: 'u5', tenantId: 't2', title: 'পাওয়ার সার্কিট ব্রেকার ট্রিপ', description: 'দোকানের ভেতরের প্রধান এমডিবি বোর্ডের একটি ব্রেকার গরম হয়ে ট্রিপ করছে। লোড টেস্ট করা দরকার।', priority: 'high', status: 'assigned', technicianName: 'সোহেল ইলেকট্রিশিয়ান', materialCost: 1500, laborCost: 500, createdAt: '2026-07-05' },
  { id: 'm3', propertyId: 'p1', unitId: 'u4', title: 'ফাঁকা ফ্ল্যাট রঙ ও ক্লিনিং', description: 'নতুন ভাড়াটিয়া আসার আগে বি২ ফ্ল্যাটে সিলিং ও ড্যাম্প দেয়ালে নতুন করে ডিস্টেম্পার রঙ ও ডিপ ক্লিনিং করা প্রয়োজন।', priority: 'low', status: 'pending', materialCost: 8000, laborCost: 4000, createdAt: '2026-07-06' }
];

const DEMO_VISITORS: Visitor[] = [
  { id: 'v1', companyId: 'c1', name: 'মোঃ হাসিবুর রহমান', phone: '01815-554433', unitId: 'u1', purpose: 'পারিবারিক সাক্ষাৎ', entryTime: '2026-07-06T15:20:00', exitTime: '2026-07-06T18:10:00', passCode: 'VST-9902' },
  { id: 'v2', companyId: 'c1', name: 'আব্দুল্লাহ কুরিয়ার সার্ভিস', phone: '01511-223344', unitId: 'u3', purpose: 'পার্সেল ডেলিভারি', entryTime: '2026-07-06T19:10:00', passCode: 'VST-2819' }
];

const DEMO_PARKING: ParkingSpace[] = [
  { id: 'pk1', propertyId: 'p1', slotNumber: 'Parking P1-A', allocatedTo: 'u1', vehiclePlate: 'Dhaka Metro G-11-2233', rentAmount: 2500, status: 'occupied' },
  { id: 'pk2', propertyId: 'p1', slotNumber: 'Parking P1-B', allocatedTo: 'u3', vehiclePlate: 'Dhaka Metro Ka-44-5566', rentAmount: 2500, status: 'occupied' },
  { id: 'pk3', propertyId: 'p1', slotNumber: 'Parking P1-C', rentAmount: 2500, status: 'vacant' }
];

const DEMO_EMPLOYEES: Employee[] = [
  { id: 'e1', companyId: 'c1', name: 'মোঃ রফিকুল ইসলাম', phone: '01711-229988', role: 'ম্যানেজার', department: 'অপারেশন্স', salary: 35000, joinDate: '2024-01-01', attendanceDays: 26, address: 'ধানমন্ডি, ঢাকা', status: 'active', propertyId: 'p1' },
  { id: 'e2', companyId: 'c1', name: 'সোহেল রানা', phone: '01912-334455', role: 'কেয়ারটেকার ও গার্ড', department: 'নিরাপত্তা', salary: 16000, joinDate: '2025-03-10', attendanceDays: 30, address: 'উত্তরা, ঢাকা', status: 'active', propertyId: 'p1' }
];

const DEMO_BOOKINGS: Booking[] = [
  { id: 'b1', companyId: 'c1', unitId: 'u6', customerName: 'মোঃ মাহাবুবুর রহমান', customerPhone: '01755-998877', customerNid: '1998273645019', bookingAmount: 500000, totalPrice: 4500000, bookingDate: '2026-05-10', status: 'active', downPayment: 1000000, installmentsCount: 12 }
];

const DEMO_INSTALLMENTS: Installment[] = [
  { id: 'inst1', bookingId: 'b1', installmentNo: 1, dueDate: '2026-06-15', amount: 250000, paidAmount: 250000, status: 'paid', paymentDate: '2026-06-12' },
  { id: 'inst2', bookingId: 'b1', installmentNo: 2, dueDate: '2026-07-15', amount: 250000, paidAmount: 0, status: 'due' }
];

const DEMO_TRANSACTIONS: AccountTransaction[] = [
  // Income
  { id: 'tx1', companyId: 'c1', date: '2026-06-08', type: 'income', category: 'Rent Revenue', account: 'Bkash Merchant', amount: 37000, description: 'Flat A1 জুন ২৬ ভাড়া সংগ্রহ' },
  { id: 'tx2', companyId: 'c1', date: '2026-06-09', type: 'income', category: 'Rent Revenue', account: 'Cashbook', amount: 53000, description: 'Shop 101 জুন ২৬ ভাড়া সংগ্রহ' },
  // Expenses
  { id: 'tx3', companyId: 'c1', date: '2026-07-02', type: 'expense', category: 'Maintenance Cost', account: 'Cashbook', amount: 750, description: 'Flat A1 ট্যাপ মেরামত ব্যয়' },
  { id: 'tx4', companyId: 'c1', date: '2026-07-05', type: 'expense', category: 'Salary Expense', account: 'Bank Account', amount: 51000, description: 'জুন ২৬ কর্মচারীদের বেতন পরিশোধ' }
];

export interface PropertyIncomeRow {
  id: string;
  propertyId: string;
  monthYear: string; // e.g. "April 2026"
  floorNo: string;
  flatNo: string;
  tenantName: string;
  flatRent: number;
  advance: number;
  liftBill: number;
  electricityBill: number;
  gasBill: number;
  garageRent: number;
}

export interface PropertyExpenseRow {
  id: string;
  propertyId: string;
  monthYear: string; // e.g. "June 2026"
  date: string;
  memoNo: string;
  details: string;
  quantity: string;
  totalCost: number;
}

export interface SummaryAdjustment {
  id: string;
  monthYear: string; // e.g. "April 2026"
  type: 'income' | 'expense';
  description: string;
  amount: number;
  comment?: string;
}

export interface PreviousMonthBalance {
  id: string;
  monthYear: string;
  balance: number;
}

const NEW_DEMO_PROPERTIES: Property[] = [
  { id: 'prop_alif_1', companyId: 'c1', name: 'আলিফ টাওয়ার-১ (Alif Tower-1)', type: 'mixed', address: 'মিরপুর, ঢাকা', floors: 7, totalUnits: 26, status: 'active' },
  { id: 'prop_alif_2', companyId: 'c1', name: 'আলিফ টাওয়ার-২ (Alif Tower-2)', type: 'mixed', address: 'মিরপুর, ঢাকা', floors: 5, totalUnits: 15, status: 'active' },
  { id: 'prop_mahira', companyId: 'c1', name: 'মাহিরা টাওয়ার (Mahira Tower)', type: 'residential', address: 'উত্তরা, ঢাকা', floors: 6, totalUnits: 12, status: 'active' },
  { id: 'prop_mohiuddin', companyId: 'c1', name: 'মহিউদ্দিন মার্কেট ও জায়গা (Mohiuddin Market)', type: 'commercial', address: 'মতিঝিল, ঢাকা', floors: 3, totalUnits: 30, status: 'active' }
];

const SEED_REPORT_INCOME: PropertyIncomeRow[] = [
  // Alif Tower-1 (prop_alif_1) April 2026 (Sums to 601,447 including Advance)
  { id: 'inc_1', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '২', flatNo: '১', tenantName: 'মোঃ নাসির শেখ', flatRent: 0, advance: 0, liftBill: 0, electricityBill: 0, gasBill: 0, garageRent: 0 },
  { id: 'inc_2', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '২', flatNo: '২', tenantName: 'মোঃ শাহাদাত হোসেন', flatRent: 13000, advance: 0, liftBill: 3350, electricityBill: 848, gasBill: 0, garageRent: 0 },
  { id: 'inc_3', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '২', flatNo: '৩', tenantName: 'মোঃ সাব্বির আহমেদ', flatRent: 15950, advance: 0, liftBill: 3350, electricityBill: 2592, gasBill: 1160, garageRent: 700 },
  { id: 'inc_4', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '২', flatNo: '৪', tenantName: 'সুমি রায়', flatRent: 18750, advance: 0, liftBill: 0, electricityBill: 2350, gasBill: 6180, garageRent: 0 },
  { id: 'inc_5', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '২', flatNo: '৫', tenantName: 'মোঃ ইসমাইল হোসেন', flatRent: 0, advance: 0, liftBill: 0, electricityBill: 0, gasBill: 0, garageRent: 0 },
  { id: 'inc_6', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৩', flatNo: '১', tenantName: 'মোঃ শাহাদাত হোসেন', flatRent: 13000, advance: 0, liftBill: 3350, electricityBill: 400, gasBill: 400, garageRent: 0 },
  { id: 'inc_7', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৩', flatNo: '২', tenantName: 'আশা আক্তার', flatRent: 14060, advance: 0, liftBill: 3350, electricityBill: 3700, gasBill: 7020, garageRent: 0 },
  { id: 'inc_8', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৩', flatNo: '৩', tenantName: 'মোঃ আমান উল্লাহ', flatRent: 15950, advance: 0, liftBill: 3350, electricityBill: 2450, gasBill: 1860, garageRent: 0 },
  { id: 'inc_9', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৩', flatNo: '৪', tenantName: 'মোঃ সাদরুল আহসান', flatRent: 18750, advance: 0, liftBill: 3350, electricityBill: 3460, gasBill: 3010, garageRent: 0 },
  { id: 'inc_10', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৩', flatNo: '৫', tenantName: 'মোঃ সোহাগ মিয়া', flatRent: 18750, advance: 0, liftBill: 0, electricityBill: 3970, gasBill: 5040, garageRent: 0 },
  { id: 'inc_11', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৪', flatNo: '১', tenantName: 'মোঃ ফজলে হাসান', flatRent: 13000, advance: 0, liftBill: 3350, electricityBill: 1140, gasBill: 2490, garageRent: 0 },
  { id: 'inc_12', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৪', flatNo: '২', tenantName: 'নিত্য রঞ্জন বর্মন', flatRent: 14060, advance: 0, liftBill: 3350, electricityBill: 1800, gasBill: 1320, garageRent: 700 },
  { id: 'inc_13', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৪', flatNo: '৩', tenantName: 'মোঃ জহিরুল ইসলাম', flatRent: 15950, advance: 0, liftBill: 3350, electricityBill: 2450, gasBill: 3630, garageRent: 2000 },
  { id: 'inc_14', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৪', flatNo: '৪', tenantName: 'মোঃ কামরুল ইসলাম', flatRent: 18750, advance: 0, liftBill: 3350, electricityBill: 5200, gasBill: 4660, garageRent: 0 },
  { id: 'inc_15', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৪', flatNo: '৫', tenantName: 'মোঃ জায়েদ আলহাম্মাদ', flatRent: 18750, advance: 0, liftBill: 3350, electricityBill: 2870, gasBill: 1360, garageRent: 0 },
  { id: 'inc_16', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৫', flatNo: '১', tenantName: 'মোঃ নুর হোসেন', flatRent: 13000, advance: 0, liftBill: 3350, electricityBill: 2830, gasBill: 2870, garageRent: 0 },
  { id: 'inc_17', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৫', flatNo: '২', tenantName: 'অসীম কুমার পাল', flatRent: 14060, advance: 0, liftBill: 3350, electricityBill: 3620, gasBill: 2740, garageRent: 700 },
  { id: 'inc_18', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৫', flatNo: '৩', tenantName: 'মোঃ ইরফান আহমেদ', flatRent: 15950, advance: 0, liftBill: 3350, electricityBill: 3030, gasBill: 390, garageRent: 0 },
  { id: 'inc_19', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৫', flatNo: '৪', tenantName: 'মোঃ আঃ রব সাহেব', flatRent: 18750, advance: 0, liftBill: 3350, electricityBill: 5790, gasBill: 8850, garageRent: 700 },
  { id: 'inc_20', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৫', flatNo: '৫', tenantName: 'মোঃ রাজু সাহেব', flatRent: 18750, advance: 0, liftBill: 0, electricityBill: 6320, gasBill: 2580, garageRent: 0 },
  { id: 'inc_21', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৬', flatNo: '১', tenantName: 'তাপস সরকার', flatRent: 12760, advance: 0, liftBill: 3350, electricityBill: 1970, gasBill: 2170, garageRent: 0 },
  { id: 'inc_22', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৬', flatNo: '২', tenantName: 'মোঃ সাখাওয়াত হোসেন', flatRent: 14060, advance: 0, liftBill: 3350, electricityBill: 2720, gasBill: 660, garageRent: 0 },
  { id: 'inc_23', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৬', flatNo: '৩', tenantName: 'মোঃ আল আমিন', flatRent: 15950, advance: 0, liftBill: 0, electricityBill: 5900, gasBill: 6710, garageRent: 700 },
  { id: 'inc_24', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৬', flatNo: '৪', tenantName: 'মোঃ আরিফ মাস্টার', flatRent: 18750, advance: 0, liftBill: 0, electricityBill: 3670, gasBill: 7300, garageRent: 0 },
  { id: 'inc_25', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৬', flatNo: '৫', tenantName: 'মোঃ মোস্তফা গোল্ড', flatRent: 18750, advance: 0, liftBill: 3350, electricityBill: 6640, gasBill: 940, garageRent: 0 },
  { id: 'inc_26', propertyId: 'prop_alif_1', monthYear: 'April 2026', floorNo: '৭', flatNo: '১', tenantName: 'মোঃ জহির সাহেব', flatRent: 0, advance: 8000, liftBill: 3444, electricityBill: 3450, gasBill: 2193, garageRent: 0 },

  // Alif Tower-2 (prop_alif_2) April 2026 (Sums to 132,951)
  { id: 'inc_al2_1', propertyId: 'prop_alif_2', monthYear: 'April 2026', floorNo: '১', flatNo: 'দোকান ১০১', tenantName: 'রফিকুল ইসলাম', flatRent: 120000, advance: 0, liftBill: 2000, electricityBill: 8500, gasBill: 0, garageRent: 2451 },

  // Mahira Tower (prop_mahira) April 2026 (Sums to 14,000)
  { id: 'inc_mah_1', propertyId: 'prop_mahira', monthYear: 'April 2026', floorNo: '২', flatNo: 'ফ্ল্যাট এ', tenantName: 'আফসানা রহমান', flatRent: 14000, advance: 0, liftBill: 0, electricityBill: 0, gasBill: 0, garageRent: 0 },

  // Mohiuddin Market (prop_mohiuddin) April 2026 (Sums to 18,795)
  { id: 'inc_moh_1', propertyId: 'prop_mohiuddin', monthYear: 'April 2026', floorNo: '১', flatNo: 'দোকান এ', tenantName: 'নুরুল হক', flatRent: 15000, advance: 0, liftBill: 0, electricityBill: 3795, gasBill: 0, garageRent: 0 }
];

const SEED_REPORT_EXPENSE: PropertyExpenseRow[] = [
  // Alif Tower-1 (prop_alif_1) June 2026 (Sums to 865,927)
  { id: 'exp_1', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-02', memoNo: '135', details: 'মামু ভাগিনা এন্টারপ্রাইজ - আস্তর বালু', quantity: '১ গাড়ি', totalCost: 5200 },
  { id: 'exp_2', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-03', memoNo: '', details: 'রাজমনি ডেকোরেটর', quantity: '', totalCost: 3600 },
  { id: 'exp_3', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-04', memoNo: '504', details: 'ভূমি পল্লী আবাসন - সার্ভিস চার্জ (আগস্ট/২০২৫)', quantity: '', totalCost: 1000 },
  { id: 'exp_4', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-05', memoNo: '423', details: 'প্রধান স্যানিটারি - বিভিন্ন মালামাল', quantity: '', totalCost: 17896 },
  { id: 'exp_5', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-06', memoNo: '422', details: 'প্রধান স্যানিটারি - বিভিন্ন মালামাল', quantity: '', totalCost: 2715 },
  { id: 'exp_6', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-08', memoNo: '217', details: 'মামু ভাগিনা এন্টারপ্রাইজ - ইলেকশন বালু', quantity: '১৬৫ ফুট', totalCost: 18950 },
  { id: 'exp_7', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-09', memoNo: '', details: 'আল মদিনা ক্রোকারিজ - বালতি-মগ', quantity: '২', totalCost: 400 },
  { id: 'exp_8', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-10', memoNo: '1983', details: 'আল-মদিনা ব্রিক্স ম্যানুফ্যাকচারাল - ১নং ইট', quantity: '৩০০০ পিচ', totalCost: 36000 },
  { id: 'exp_9', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-11', memoNo: '1982', details: 'আল-মদিনা ব্রিক্স ম্যানুফ্যাকচারাল - ১নং ইট', quantity: '৩০০০ পিচ', totalCost: 36000 },
  { id: 'exp_10', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-12', memoNo: '137', details: 'মামু ভাগিনা এন্টারপ্রাইজ - ইলেকশন বালু + ভাড়া (১০০০/-)', quantity: '১৬৫ ফুট', totalCost: 18985 },
  { id: 'exp_11', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-13', memoNo: '', details: 'ডিপিডিসি - বিদ্যুৎ বিল (সেপ্টেম্বর/২০২৫)', quantity: '', totalCost: 2877 },
  { id: 'exp_12', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-14', memoNo: '৪১৪৮', details: 'এস এস এন্টারপ্রাইজ - এঙ্গেল রড', quantity: '৫০০০ কেজি', totalCost: 372089 },
  { id: 'exp_13', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-15', memoNo: '২০৮২', details: 'প্রধান স্যানিটারি - বিভিন্ন মালামাল', quantity: '', totalCost: 735 },
  { id: 'exp_14', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-16', memoNo: '২০৪২', details: 'আল-মদিনা ব্রিক্স ম্যানুফ্যাকচারাল - ১নং ইট', quantity: '৩০০০ পিচ', totalCost: 36000 },
  { id: 'exp_15', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-17', memoNo: '২০৩৭', details: 'আল-মদিনা ব্রিক্স ম্যানুফ্যাকচারাল - ১নং ইট', quantity: '৩০০০ পিচ', totalCost: 36000 },
  { id: 'exp_16', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-18', memoNo: '২২৬', details: 'মামু ভাগিনা এন্টারপ্রাইজ - আস্তর বালু', quantity: '১ গাড়ি', totalCost: 5200 },
  { id: 'exp_17', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-19', memoNo: '২৩১', details: 'মামু ভাগিনা এন্টারপ্রাইজ - আস্তর বালু', quantity: '১ গাড়ি', totalCost: 5200 },
  { id: 'exp_18', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-20', memoNo: '২১৭৯', details: 'আল-মদিনা ব্রিক্স ম্যানুফ্যাকচারাল - ১নং ইট', quantity: '৩০০০ পিচ', totalCost: 36000 },
  { id: 'exp_19', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-21', memoNo: '২১৮১', details: 'আল-মদিনা ব্রিক্স ম্যানুফ্যাকচারাল - ১নং ইট', quantity: '৩০০০ পিচ', totalCost: 36000 },
  { id: 'exp_20', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-22', memoNo: '১২১', details: 'হাসিনা এন্টারপ্রাইজ - বিভিন্ন মালামাল', quantity: '', totalCost: 14880 },
  { id: 'exp_21', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-23', memoNo: '২৪৮', details: 'ভূমি পল্লী সোসাইটি - সিকিউরিটি সার্ভিস চার্জ (নির্মাণাধীন)', quantity: '', totalCost: 1000 },
  { id: 'exp_22', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-24', memoNo: '৭৪৬', details: 'লুৎফর এন্টারপ্রাইজ - সিমেন্ট', quantity: '২০০ ব্যাগ', totalCost: 102000 },
  { id: 'exp_23', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-25', memoNo: '৩২৫', details: 'ইমাম হাসান এন্টারপ্রাইজ - আস্তর বালু', quantity: '১ গাড়ি', totalCost: 5200 },
  { id: 'exp_24', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-26', memoNo: '৪৩১', details: 'নিউ লিবার সাইট - ১নং ইট', quantity: '৩০০০ পিচ', totalCost: 36000 },
  { id: 'exp_25', propertyId: 'prop_alif_1', monthYear: 'June 2026', date: '2026-06-27', memoNo: '৪২৮', details: 'নিউ লিবার সাইট - ১নং ইট', quantity: '৩০০০ পিচ', totalCost: 36000 },

  // Mohiuddin Market Combined April 2026 Expense (Sums to 784,270)
  { id: 'exp_moh_1', propertyId: 'prop_mohiuddin', monthYear: 'April 2026', date: '2026-04-28', memoNo: 'EXP-SUM-01', details: 'আলিফ টাওয়ার ও অন্যান্য প্রতিষ্ঠানের যাবতীয় খরচ, স্টাফ বেতন ও বিদ্যুৎ বিল ইত্যাদি', quantity: '', totalCost: 784270 }
];

const SEED_REPORT_ADJUSTMENTS: SummaryAdjustment[] = [
  // April 2026 adjustments
  { id: 'adj_1', monthYear: 'April 2026', type: 'income', description: 'বাহিরের গাড়ি ভাড়া', amount: 12900, comment: 'সাধারণ আয়' }
];

const SEED_REPORT_BALANCES: PreviousMonthBalance[] = [
  { id: 'bal_1', monthYear: 'April 2026', balance: 201880 }
];

export class MockDB {
  static init() {
    if (!localStorage.getItem('bongo_companies')) {
      localStorage.setItem('bongo_companies', JSON.stringify(DEMO_COMPANIES));
      localStorage.setItem('bongo_properties', JSON.stringify(DEMO_PROPERTIES));
      localStorage.setItem('bongo_units', JSON.stringify(DEMO_UNITS));
      localStorage.setItem('bongo_tenants', JSON.stringify(DEMO_TENANTS));
      localStorage.setItem('bongo_invoices', JSON.stringify(DEMO_INVOICES));
      localStorage.setItem('bongo_receipts', JSON.stringify(DEMO_RECEIPTS));
      localStorage.setItem('bongo_utilities', JSON.stringify(DEMO_UTILITIES));
      localStorage.setItem('bongo_maintenance', JSON.stringify(DEMO_MAINTENANCE));
      localStorage.setItem('bongo_visitors', JSON.stringify(DEMO_VISITORS));
      localStorage.setItem('bongo_parking', JSON.stringify(DEMO_PARKING));
      localStorage.setItem('bongo_employees', JSON.stringify(DEMO_EMPLOYEES));
      localStorage.setItem('bongo_bookings', JSON.stringify(DEMO_BOOKINGS));
      localStorage.setItem('bongo_installments', JSON.stringify(DEMO_INSTALLMENTS));
      localStorage.setItem('bongo_transactions', JSON.stringify(DEMO_TRANSACTIONS));
    }
    
    // Seed new reporting properties if they do not exist
    const currentProps = JSON.parse(localStorage.getItem('bongo_properties') || '[]');
    if (!currentProps.some((p: any) => p.id === 'prop_alif_1')) {
      currentProps.push(...NEW_DEMO_PROPERTIES);
      localStorage.setItem('bongo_properties', JSON.stringify(currentProps));
    }

    if (!localStorage.getItem('bongo_report_income')) {
      localStorage.setItem('bongo_report_income', JSON.stringify(SEED_REPORT_INCOME));
    }
    if (!localStorage.getItem('bongo_report_expense')) {
      localStorage.setItem('bongo_report_expense', JSON.stringify(SEED_REPORT_EXPENSE));
    }
    if (!localStorage.getItem('bongo_report_adjustments')) {
      localStorage.setItem('bongo_report_adjustments', JSON.stringify(SEED_REPORT_ADJUSTMENTS));
    }
    if (!localStorage.getItem('bongo_report_balances')) {
      localStorage.setItem('bongo_report_balances', JSON.stringify(SEED_REPORT_BALANCES));
    }
  }

  static getTable<T>(name: string): T[] {
    this.init();
    const data = localStorage.getItem(`bongo_${name}`);
    return data ? JSON.parse(data) : [];
  }

  static saveTable<T>(name: string, data: T[]) {
    localStorage.setItem(`bongo_${name}`, JSON.stringify(data));
  }

  // Helper CRUDs
  static insert<T extends { id: string }>(table: string, record: T): T {
    const records = this.getTable<T>(table);
    records.push(record);
    this.saveTable(table, records);
    return record;
  }

  static update<T extends { id: string }>(table: string, id: string, updates: Partial<T>): T | null {
    const records = this.getTable<T>(table);
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...updates };
    this.saveTable(table, records);
    return records[index];
  }

  static delete(table: string, id: string): boolean {
    const records = this.getTable<{ id: string }>(table);
    const filtered = records.filter(r => r.id !== id);
    if (records.length === filtered.length) return false;
    this.saveTable(table, filtered);
    return true;
  }
}

