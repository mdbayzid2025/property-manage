import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Employee, Property, TenantDoc, AccountTransaction } from '../services/db';
import { 
  Briefcase, UserPlus, Search, Filter, Upload, Trash2, X, 
  Edit3, Phone, MapPin, Calendar, FileText, CheckCircle, Ban, DollarSign 
} from 'lucide-react';

export default function EmployeeManager({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // DB tables
  const [employees, setEmployees] = useState<Employee[]>(() => 
    MockDB.getTable<Employee>('employees').filter(e => e.companyId === companyId)
  );
  const [properties] = useState<Property[]>(() =>
    MockDB.getTable<Property>('properties').filter(p => p.companyId === companyId)
  );

  // Filtering states
  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, former

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Input states for Add/Edit
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [address, setAddress] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'active' | 'former'>('active');
  const [employeeDocs, setEmployeeDocs] = useState<TenantDoc[]>([]);

  // Document Viewer Modal State
  const [viewingDoc, setViewingDoc] = useState<TenantDoc | null>(null);
  const [viewingDocEmployee, setViewingDocEmployee] = useState<Employee | null>(null);

  // Handlers
  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setName('');
    setPhone('');
    setRole('');
    setSalary('');
    setAddress('');
    setPropertyId(properties[0]?.id || '');
    setJoinDate(new Date().toISOString().split('T')[0]);
    setStatus('active');
    setEmployeeDocs([]);
    setShowAddForm(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setPhone(emp.phone);
    setRole(emp.role);
    setSalary(emp.salary.toString());
    setAddress(emp.address || '');
    setPropertyId(emp.propertyId || properties[0]?.id || '');
    setJoinDate(emp.joinDate);
    setStatus(emp.status || 'active');
    setEmployeeDocs(emp.documents || []);
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const salVal = Number(salary);
    if (!name.trim() || !phone.trim() || !role.trim() || isNaN(salVal) || salVal <= 0) return;

    if (editingEmployee) {
      // Update
      const updated = MockDB.update<Employee>('employees', editingEmployee.id, {
        name,
        phone,
        role,
        salary: salVal,
        address,
        propertyId,
        joinDate,
        status,
        documents: employeeDocs
      });
      if (updated) {
        alert('কর্মচারীর তথ্য সফলভাবে আপডেট করা হয়েছে!');
      }
    } else {
      // Insert
      MockDB.insert<Employee>('employees', {
        id: 'emp_' + Math.random().toString(36).substr(2, 9),
        companyId,
        name,
        phone,
        role,
        salary: salVal,
        address,
        propertyId,
        joinDate,
        status,
        documents: employeeDocs
      });
      alert('নতুন কর্মচারী সফলভাবে যোগ করা হয়েছে!');
    }

    // Refresh & Reset
    setEmployees(MockDB.getTable<Employee>('employees').filter(e => e.companyId === companyId));
    setShowAddForm(false);
    setEditingEmployee(null);
  };

  const toggleStatus = (emp: Employee) => {
    const nextStatus = emp.status === 'former' ? 'active' : 'former';
    const updated = MockDB.update<Employee>('employees', emp.id, { status: nextStatus });
    if (updated) {
      setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: nextStatus } : e));
    }
  };

  const handlePaySalary = (emp: Employee) => {
    MockDB.insert<AccountTransaction>('transactions', {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      companyId,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: 'Salary Expense',
      account: 'Bank Account',
      amount: emp.salary,
      description: `বেতন বিতরণ: ${emp.name} (${emp.role})`,
      propertyId: emp.propertyId
    });
    alert(`৳${emp.salary.toLocaleString()} বেতন প্রদান সফল হয়েছে এবং ক্যাশবুকে রেকর্ড করা হয়েছে।`);
  };

  // Filtering Logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || emp.phone.includes(search);
    const matchesProperty = !propertyFilter || emp.propertyId === propertyFilter;
    const matchesStatus = statusFilter === 'all' || (emp.status || 'active') === statusFilter;
    return matchesSearch && matchesProperty && matchesStatus;
  });

  const getPropertyName = (pId?: string) => {
    if (!pId) return 'General';
    const prop = properties.find(p => p.id === pId);
    return prop ? prop.name : 'General';
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Header section */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">কর্মচারী তালিকা</h2>
            <p className="text-xs text-slate-400">Manage property staff, designate roles, upload documents, and disburse payroll</p>
          </div>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          কর্মচারী যোগ করুন
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-5 animate-slide-in border-t-4 border-t-indigo-500">
          <div className="md:col-span-3 flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              {editingEmployee ? 'কর্মচারীর তথ্য সংশোধন করুন' : 'নতুন কর্মচারী যুক্ত করুন'}
            </h3>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-650 block mb-1">কর্মচারীর নাম *</label>
            <input 
              type="text" 
              placeholder="যেমন: মোঃ কামরুল হাসান"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium font-sans"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-650 block mb-1">মোবাইল নম্বর *</label>
            <input 
              type="text" 
              placeholder="যেমন: 017XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium font-sans"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-650 block mb-1">পদবী (Designation) *</label>
            <input 
              type="text" 
              placeholder="যেমন: কেয়ারটেকার / ইলেকট্রিশিয়ান / গার্ড"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-650 block mb-1">মাসিক বেতন (BDT) *</label>
            <input 
              type="number" 
              placeholder="যেমন: ১৫০০০"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium font-sans"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-650 block mb-1">যোগদানের তারিখ</label>
            <input 
              type="date" 
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium font-sans"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-650 block mb-1">কর্মরত প্রতিষ্ঠান / প্রোপার্টি *</label>
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
            <label className="text-[11px] font-bold text-slate-650 block mb-1">কর্মরত অবস্থা</label>
            <select
              value={status}
              onChange={(e: any) => setStatus(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
            >
              <option value="active">বর্তমানে কর্মরত (Active)</option>
              <option value="former">পূর্বের কর্মরত (Former)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-bold text-slate-650 block mb-1">স্থায়ী ঠিকানা</label>
            <input 
              type="text" 
              placeholder="যেমন: গ্রাম, ডাকঘর, জেলা"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
            />
          </div>

          {/* Document upload system following Tenant upload */}
          <div className="md:col-span-3">
            <label className="text-[11px] font-bold text-slate-650 block mb-1">প্রয়োজনীয় ডকুমেন্টস (ছবি, NID বা ফাইল আপলোড)</label>
            <div className="flex flex-col gap-2.5">
              <label className="w-full py-4 border border-dashed border-slate-350 hover:border-indigo-500 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-slate-100/50">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-600">ডকুমেন্ট / ছবি আপলোড করুন</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,application/pdf" 
                  className="hidden" 
                  onChange={(e) => {
                    if (!e.target.files) return;
                    const filesArray = Array.from(e.target.files);
                    filesArray.forEach(file => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEmployeeDocs(prev => [...prev, {
                          name: file.name,
                          size: (file.size / 1024).toFixed(1) + ' KB',
                          type: file.type,
                          previewUrl: reader.result as string
                        }]);
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                />
              </label>

              {employeeDocs.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-1">
                  {employeeDocs.map((doc, idx) => (
                    <div key={idx} className="p-2 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-[10px] gap-1.5 shadow-sm font-sans">
                      <span className="font-semibold text-slate-600 truncate flex-1">{doc.name}</span>
                      <button 
                        type="button" 
                        onClick={() => setEmployeeDocs(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 hover:bg-rose-500/10 text-rose-500 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/15 hover:shadow-lg transition-all cursor-pointer font-sans"
            >
              {editingEmployee ? 'হালনাগাদ করুন' : 'যোগ করুন'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Options Panel */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-1.5 text-slate-800 shrink-0 font-bold">
          <Briefcase className="w-4 h-4 text-indigo-500" />
          <span>মোট কর্মচারী ({filteredEmployees.length} জন)</span>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full md:w-64">
            <Search className="w-4 h-4 text-slate-550 shrink-0" />
            <input 
              type="text" 
              placeholder="নাম বা মোবাইল নম্বর খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none border-none text-xs text-slate-800 w-full font-sans"
            />
          </div>

          {/* Property filter */}
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 outline-none select-custom shrink-0 font-bold"
          >
            <option value="">সকল কর্মরত প্রতিষ্ঠান</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 outline-none select-custom shrink-0 font-bold"
          >
            <option value="all">বর্তমানে ও পূর্বের সকল কর্মরত</option>
            <option value="active">বর্তমানে কর্মরত (Active)</option>
            <option value="former">পূর্বের কর্মরত (Former)</option>
          </select>
        </div>
      </div>

      {/* Employees Directory Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="p-4 font-bold">নাম ও পদবী</th>
                <th className="p-4 font-bold">কর্মরত প্রতিষ্ঠান</th>
                <th className="p-4 font-bold">যোগাযোগ ও ঠিকানা</th>
                <th className="p-4 font-bold">বেতন</th>
                <th className="p-4 font-bold">প্রয়োজনীয় ডকুমেন্টস</th>
                <th className="p-4 font-bold">অবস্থা</th>
                <th className="p-4 font-bold text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium italic">
                    কোনো কর্মচারীর তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isFormer = emp.status === 'former';
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{emp.name}</div>
                        <div className="text-[10px] text-slate-450">{emp.role}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700">{getPropertyName(emp.propertyId)}</div>
                        <div className="text-[9px] text-slate-500">Joined: {emp.joinDate}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-sans">{emp.phone}</span>
                          </div>
                          {emp.address && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-normal">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {emp.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800 font-sans">
                        ৳{emp.salary.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 max-w-[150px]">
                          {emp.documents && emp.documents.length > 0 ? (
                            emp.documents.map((doc, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setViewingDoc(doc);
                                  setViewingDocEmployee(emp);
                                }}
                                className="text-left text-[10px] font-semibold text-sky-500 hover:text-sky-600 truncate flex items-center gap-1 cursor-pointer font-sans"
                              >
                                <FileText className="w-3 h-3 shrink-0" />
                                {doc.name}
                              </button>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">No documents</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          isFormer 
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                        }`}>
                          {isFormer ? 'সাবেক (Former)' : 'কর্মরত (Active)'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handlePaySalary(emp)}
                            title="বেতন প্রদান করুন"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            title="সম্পাদনা"
                            className="p-1.5 text-indigo-650 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleStatus(emp)}
                            title={isFormer ? 'কর্মরত করুন' : 'অব্যাহতি দিন'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isFormer ? 'text-emerald-500 hover:bg-emerald-50' : 'text-rose-500 hover:bg-rose-50'
                            }`}
                          >
                            {isFormer ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Viewer Modal Overlay */}
      {viewingDoc && viewingDocEmployee && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 overflow-y-auto font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-in my-8 p-6 space-y-6 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 w-full">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {viewingDoc.name} ({viewingDoc.size})
                </h3>
              </div>
              <button
                onClick={() => {
                  setViewingDoc(null);
                  setViewingDocEmployee(null);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Render Area */}
            <div className="flex-1 flex justify-center py-4 overflow-y-auto max-h-[60vh] w-full text-slate-800">
              {viewingDoc.previewUrl && viewingDoc.type.startsWith('image/') ? (
                <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-3xl max-w-lg w-full">
                  <img 
                    src={viewingDoc.previewUrl} 
                    alt={viewingDoc.name} 
                    className="max-w-full max-h-[48vh] object-contain rounded-2xl shadow-md border border-slate-200/50" 
                  />
                  <span className="text-[10px] text-slate-450 mt-2 font-bold">{viewingDoc.name} ({viewingDoc.size})</span>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 italic">
                  ফাইল ফরম্যাটটি সরাসরি ব্রাউজারে প্রিভিউ করার উপযোগী নয়। দয়া করে ডাউনলোড করে দেখুন।
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="border-t border-slate-100 pt-4 flex justify-end w-full">
              <button
                onClick={() => {
                  setViewingDoc(null);
                  setViewingDocEmployee(null);
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
