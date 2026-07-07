import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Tenant, Unit, Property, TenantDoc } from '../services/db';
import { 
  Users, Search, Plus, UserPlus, Info, CheckCircle, Ban, 
  Building, Phone, Calendar, ShieldAlert, FileText, Upload, Trash2, X, User 
} from 'lucide-react';

export default function TenantManager({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // Database lists
  const [tenants, setTenants] = useState<Tenant[]>(() => 
    MockDB.getTable<Tenant>('tenants').filter(t => t.companyId === companyId)
  );
  const [units, setUnits] = useState<Unit[]>(() => MockDB.getTable<Unit>('units'));
  const [properties] = useState<Property[]>(() =>
    MockDB.getTable<Property>('properties').filter(p => p.companyId === companyId)
  );

  // Filtering states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [occupation, setOccupation] = useState('');
  const [emergency, setEmergency] = useState('');
  const [unitId, setUnitId] = useState('');
  const [newTenantDocs, setNewTenantDocs] = useState<TenantDoc[]>([]);
  const [viewingSelectedDoc, setViewingSelectedDoc] = useState<TenantDoc | null>(null);
  const [viewingDocTenant, setViewingDocTenant] = useState<Tenant | null>(null);

  const vacantUnits = units.filter(u => u.status === 'vacant');

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !unitId) return;

    // Create Tenant
    const newTenant = MockDB.insert<Tenant>('tenants', {
      id: 'tn_' + Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      phone,
      nid: '',
      email: '',
      occupation,
      unitId,
      moveInDate: new Date().toISOString().split('T')[0],
      emergencyContact: emergency,
      status: 'active',
      documents: newTenantDocs
    });

    // Update Unit state in DB to occupied
    MockDB.update<Unit>('units', unitId, { status: 'occupied' });

    // Refresh lists
    setTenants(MockDB.getTable<Tenant>('tenants').filter(t => t.companyId === companyId));
    setUnits(MockDB.getTable<Unit>('units'));

    // Reset Form
    setName('');
    setPhone('');
    setOccupation('');
    setEmergency('');
    setUnitId('');
    setNewTenantDocs([]);
    setShowAddForm(false);
  };

  const toggleBlacklist = (id: string) => {
    const updated = tenants.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'blacklisted' ? 'active' : 'blacklisted';
        MockDB.update<Tenant>('tenants', id, { status: nextStatus as any });
        return { ...t, status: nextStatus as any };
      }
      return t;
    });
    setTenants(updated);
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.phone.includes(search);
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Group tenants by property helper
  const getTenantsForProperty = (propertyId: string) => {
    return filteredTenants.filter(t => {
      const unit = units.find(u => u.id === t.unitId);
      return unit?.propertyId === propertyId;
    });
  };

  // Get unassigned tenants (if any)
  const unassignedTenants = filteredTenants.filter(t => {
    const unit = units.find(u => u.id === t.unitId);
    if (!unit) return true;
    return !properties.some(p => p.id === unit.propertyId);
  });

  return (
    <div className="space-y-6 text-sm">
      {/* Header section */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('tenantMgmt')}</h2>
            <p className="text-xs text-slate-400">Onboard tenants, check references, upload agreements and monitor active leases</p>
          </div>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/10 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          {lang === 'bn' ? 'ভাড়াটিয়া যোগ করুন' : 'Add Tenant'}
        </button>
      </div>

      {/* Add Tenant Form */}
      {showAddForm && (
        <form onSubmit={handleAddTenant} className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-in">
          <div>
            <label className="text-xs text-slate-550 dark:text-slate-400 block mb-1">Full Name *</label>
            <input 
              type="text" 
              placeholder="যেমন: মোঃ আশরাফুল ইসলাম"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-550 dark:text-slate-400 block mb-1">Mobile Phone *</label>
            <input 
              type="text" 
              placeholder="যেমন: 017XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-550 dark:text-slate-400 block mb-1">Occupation</label>
            <input 
              type="text" 
              placeholder="যেমন: ব্যাংকার"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-550 dark:text-slate-400 block mb-1">Assign Vacant Flat / Shop *</label>
            <select 
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-350"
              required
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">-- Choose Unit --</option>
              {vacantUnits.map(u => {
                const prop = properties.find(p => p.id === u.propertyId);
                return (
                  <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                    {prop ? `${prop.name} - ` : ''}{u.number} ({u.type.toUpperCase()})
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-550 dark:text-slate-400 block mb-1">Emergency Contact Info</label>
            <input 
              type="text" 
              placeholder="যেমন: ০১৮১২-XXXXXX (স্ত্রী)"
              value={emergency}
              onChange={(e) => setEmergency(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs text-slate-550 dark:text-slate-400 block mb-1">Required Documents (ছবি বা ফাইল আপলোড)</label>
            <div className="flex flex-col gap-2.5">
              {/* Drag & drop / Select file zone */}
              <label className="w-full py-4 border border-dashed border-slate-300 dark:border-blue-900/35 hover:border-sky-500 dark:hover:border-sky-500 bg-slate-50/50 dark:bg-slate-950/10 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-slate-100/50">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">ডকুমেন্ট / ছবি আপলোড করুন</span>
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
                        setNewTenantDocs(prev => [...prev, {
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

              {/* Previews List */}
              {newTenantDocs.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-1">
                  {newTenantDocs.map((doc, idx) => (
                    <div key={idx} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-950/50 rounded-xl flex justify-between items-center text-[10px] gap-1.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-350 truncate flex-1">{doc.name}</span>
                      <button 
                        type="button" 
                        onClick={() => setNewTenantDocs(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 hover:bg-rose-500/10 text-rose-500 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button 
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/10"
            >
              Register & Assign Unit
            </button>
          </div>
        </form>
      )}

      {/* Global Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-blue-900/30 flex flex-col md:flex-row gap-4 items-center justify-between">
        <span className="font-extrabold text-sm text-slate-850 dark:text-slate-200 flex items-center gap-1.5 shrink-0">
          <Info className="w-4 h-4 text-sky-500" />
          {lang === 'bn' ? `মোট ভাড়াটিয়া ডাটাবেজ (${filteredTenants.length} জন)` : `Total Tenant Directory (${filteredTenants.length} profiles)`}
        </span>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder={lang === 'bn' ? "ভাড়াটিয়ার নাম বা মোবাইল খুঁজুন..." : "Search name or phone..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none border-none text-xs text-slate-800 dark:text-slate-300 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs text-slate-800 dark:text-slate-300 outline-none select-custom shrink-0"
          >
            <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">All Statuses</option>
            <option value="active" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Active</option>
            <option value="blacklisted" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Blocked</option>
          </select>
        </div>
      </div>

      {/* Property-grouped card displays */}
      <div className="space-y-8">
        
        {properties.map(property => {
          const propertyTenants = getTenantsForProperty(property.id);
          if (propertyTenants.length === 0) return null;

          return (
            <div key={property.id} className="space-y-4">
              <div className="flex items-center gap-2 border-l-4 border-sky-500 pl-3">
                <Building className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                <h3 className="text-sm font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider">
                  {property.name}
                </h3>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-bold">
                  {propertyTenants.length} tenants
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertyTenants.map(tenant => {
                  const unit = units.find(u => u.id === tenant.unitId);
                  const isBlocked = tenant.status === 'blacklisted';

                  return (
                    <div 
                      key={tenant.id}
                      className={`glass-panel border rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                        isBlocked 
                          ? 'border-rose-500/20 bg-rose-500/[0.02]' 
                          : 'border-slate-200 dark:border-blue-900/20 bg-white dark:bg-slate-900/40'
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Title & Badge */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              {tenant.name}
                            </h4>
                            <p className="text-xs text-slate-400 font-medium">{tenant.occupation || 'Occupation N/A'}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            isBlocked ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                          }`}>
                            {tenant.status === 'active' ? (lang === 'bn' ? 'সক্রিয়' : 'Active') : (lang === 'bn' ? 'ব্লকড' : 'Blocked')}
                          </span>
                        </div>

                        {/* Flat Details */}
                        {unit && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Assigned Flat</span>
                              <strong className="text-slate-800 dark:text-slate-250 font-extrabold">{unit.number} ({unit.type.toUpperCase()})</strong>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Monthly Rent</span>
                              <strong className="text-sky-500 font-extrabold">৳ {unit.rentAmount.toLocaleString()}</strong>
                            </div>
                          </div>
                        )}

                        {/* Tenant Contacts */}
                        <div className="space-y-1.5 text-xs text-slate-650 dark:text-slate-350">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{tenant.phone}</span>
                          </div>
                          {tenant.emergencyContact && (
                            <div className="flex items-center gap-2">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="text-slate-500">{tenant.emergencyContact}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Joined: {tenant.moveInDate}</span>
                          </div>
                        </div>

                        {/* Provided Documents */}
                        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted Documents</span>
                          <div className="flex flex-col gap-1.5 text-xs">
                            {tenant.documents && tenant.documents.length > 0 ? (
                              tenant.documents.map((doc, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setViewingSelectedDoc(doc);
                                    setViewingDocTenant(tenant);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 border border-sky-500/10 rounded-xl flex items-center gap-1.5 font-semibold text-[10px] transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate flex-1">{doc.name} ({doc.size})</span>
                                  <span className="text-[9px] text-sky-500 font-bold shrink-0">দেখুন</span>
                                </button>
                              ))
                            ) : (
                              <button
                                onClick={() => {
                                  setViewingSelectedDoc({ name: 'Rental Agreement Deed.pdf', size: '1.2 MB', type: 'application/pdf' });
                                  setViewingDocTenant(tenant);
                                }}
                                className="w-full text-left px-2.5 py-1.5 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 border border-sky-500/10 rounded-xl flex items-center gap-1.5 font-semibold text-[10px] transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate flex-1">Rental Agreement Deed.pdf</span>
                                <span className="text-[9px] text-sky-500 font-bold shrink-0">দেখুন</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Blacklist Whitelist Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
                        <button
                          onClick={() => toggleBlacklist(tenant.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                            isBlocked
                              ? 'border-emerald-500/30 text-emerald-450 hover:bg-emerald-500/5'
                              : 'border-rose-500/30 text-rose-450 hover:bg-rose-500/5'
                          }`}
                        >
                          {isBlocked ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              White-list Tenant
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              Blacklist Tenant
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Unassigned / Loose tenants (if any exist) */}
        {unassignedTenants.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-amber-500 pl-3">
              <Building className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider">
                {lang === 'bn' ? 'অন্যান্য / অবিক্রীত ইউনিটসমূহ' : 'Other / Unassigned Properties'}
              </h3>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-bold">
                {unassignedTenants.length} tenants
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unassignedTenants.map(tenant => {
                const unit = units.find(u => u.id === tenant.unitId);
                const isBlocked = tenant.status === 'blacklisted';

                return (
                  <div 
                    key={tenant.id}
                    className={`glass-panel border rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                      isBlocked 
                        ? 'border-rose-500/20 bg-rose-500/[0.02]' 
                        : 'border-slate-200 dark:border-blue-900/20 bg-white dark:bg-slate-900/40'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Title & Badge */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            {tenant.name}
                          </h4>
                          <p className="text-xs text-slate-400 font-medium">{tenant.occupation || 'Occupation N/A'}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          isBlocked ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                        }`}>
                          {tenant.status === 'active' ? (lang === 'bn' ? 'সক্রিয়' : 'Active') : (lang === 'bn' ? 'ব্লকড' : 'Blocked')}
                        </span>
                      </div>

                      {/* Flat Details */}
                      {unit && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Assigned Flat</span>
                            <strong className="text-slate-800 dark:text-slate-250 font-extrabold">{unit.number} ({unit.type.toUpperCase()})</strong>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Monthly Rent</span>
                            <strong className="text-sky-500 font-extrabold">৳ {unit.rentAmount.toLocaleString()}</strong>
                          </div>
                        </div>
                      )}

                      {/* Tenant Contacts */}
                      <div className="space-y-1.5 text-xs text-slate-650 dark:text-slate-350">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{tenant.phone}</span>
                        </div>
                        {tenant.emergencyContact && (
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-slate-500">{tenant.emergencyContact}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Joined: {tenant.moveInDate}</span>
                        </div>
                      </div>

                      {/* Provided Documents */}
                      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted Documents</span>
                        <div className="flex flex-col gap-1.5 text-xs">
                          {tenant.documents && tenant.documents.length > 0 ? (
                            tenant.documents.map((doc, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setViewingSelectedDoc(doc);
                                  setViewingDocTenant(tenant);
                                }}
                                className="w-full text-left px-2.5 py-1.5 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 border border-sky-500/10 rounded-xl flex items-center gap-1.5 font-semibold text-[10px] transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate flex-1">{doc.name} ({doc.size})</span>
                                <span className="text-[9px] text-sky-500 font-bold shrink-0">দেখুন</span>
                              </button>
                            ))
                          ) : (
                            <button
                              onClick={() => {
                                setViewingSelectedDoc({ name: 'Rental Agreement Deed.pdf', size: '1.2 MB', type: 'application/pdf' });
                                setViewingDocTenant(tenant);
                              }}
                              className="w-full text-left px-2.5 py-1.5 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 border border-sky-500/10 rounded-xl flex items-center gap-1.5 font-semibold text-[10px] transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate flex-1">Rental Agreement Deed.pdf</span>
                              <span className="text-[9px] text-sky-500 font-bold shrink-0">দেখুন</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Blacklist Whitelist Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
                      <button
                        onClick={() => toggleBlacklist(tenant.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                          isBlocked
                            ? 'border-emerald-500/30 text-emerald-450 hover:bg-emerald-500/5'
                            : 'border-rose-500/30 text-rose-450 hover:bg-rose-500/5'
                        }`}
                      >
                        {isBlocked ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            White-list Tenant
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" />
                            Blacklist Tenant
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTenants.length === 0 && (
          <div className="py-16 text-center text-slate-500 font-medium italic bg-slate-50/50 dark:bg-blue-950/5 rounded-3xl border border-dashed border-slate-300 dark:border-blue-900/20">
            {lang === 'bn' ? 'কোনো ভাড়াটিয়ার তথ্য পাওয়া যায়নি।' : 'No tenant directory records match the search filter.'}
          </div>
        )}

      {/* Document Viewer Modal Overlay */}
      {viewingSelectedDoc && viewingDocTenant && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-in my-8 p-6 space-y-6 flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 w-full">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-sans">
                  {viewingSelectedDoc.name} ({viewingSelectedDoc.size})
                </h3>
              </div>
              <button
                onClick={() => {
                  setViewingSelectedDoc(null);
                  setViewingDocTenant(null);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Render Area */}
            <div className="flex-1 flex justify-center py-4 overflow-y-auto max-h-[60vh] w-full text-slate-800 dark:text-slate-200">
              {viewingSelectedDoc.previewUrl && viewingSelectedDoc.type.startsWith('image/') ? (
                <div className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-3xl max-w-lg w-full">
                  <img 
                    src={viewingSelectedDoc.previewUrl} 
                    alt={viewingSelectedDoc.name} 
                    className="max-w-full max-h-[48vh] object-contain rounded-2xl shadow-md border border-slate-200/50" 
                  />
                  <span className="text-[10px] text-slate-400 mt-2 font-bold font-sans">{viewingSelectedDoc.name} ({viewingSelectedDoc.size})</span>
                </div>
              ) : viewingSelectedDoc.name.toLowerCase().includes('nid') ? (
                <div className="space-y-6 w-full max-w-md">
                  {/* Front Side of NID */}
                  <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/20 dark:to-slate-900 border border-emerald-500/20 rounded-2xl p-4 relative shadow-md flex flex-col justify-between h-56 select-none font-sans">
                    {/* Top crest header */}
                    <div className="flex justify-between items-start gap-2 border-b border-emerald-500/20 pb-1.5">
                      <div className="w-7 h-7 bg-emerald-700 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 border border-emerald-500/20 shadow-sm">BD</div>
                      <div className="text-center flex-1">
                        <span className="text-[8px] font-bold block text-emerald-800 dark:text-emerald-400">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</span>
                        <span className="text-[7px] font-semibold block text-slate-500">Government of the People's Republic of Bangladesh</span>
                        <span className="text-[9px] font-black block tracking-wide text-emerald-900 dark:text-emerald-300">National ID Card / জাতীয় পরিচয়পত্র</span>
                      </div>
                      <div className="w-7 h-7 bg-slate-250 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/10">🇧🇩</div>
                    </div>
                    {/* Card Content body */}
                    <div className="flex gap-3 flex-1 mt-2">
                      <div className="w-20 flex flex-col justify-between items-center py-1">
                        <div className="w-16 h-20 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-600 shadow-sm relative overflow-hidden">
                          <User className="w-10 h-10" />
                          <div className="absolute inset-0 bg-sky-500/10"></div>
                        </div>
                        <span className="text-[7px] font-bold italic tracking-wide text-slate-400 uppercase mt-1">Signature: {viewingDocTenant.name.split(' ')[0]}</span>
                      </div>
                      <div className="flex-1 space-y-1.5 text-[9px] leading-tight mt-1">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block text-[7px]">নাম (Name):</span>
                          <strong className="text-slate-800 dark:text-slate-100 font-extrabold text-[10px] block">{viewingDocTenant.name}</strong>
                        </div>
                        <div>
                          <span className="text-slate-450 dark:text-slate-500 block text-[7px]">পিতা (Father):</span>
                          <span className="text-slate-700 dark:text-slate-200 font-bold block">মোঃ আব্দুল হালিম চৌধুরী</span>
                        </div>
                        <div>
                          <span className="text-slate-455 dark:text-slate-500 block text-[7px]">মাতা (Mother):</span>
                          <span className="text-slate-700 dark:text-slate-200 font-bold block">মোছাঃ রাশিদা বেগম</span>
                        </div>
                        <div className="flex justify-between gap-1">
                          <div>
                            <span className="text-slate-455 dark:text-slate-500 block text-[7px]">জন্ম তারিখ (Date of Birth):</span>
                            <span className="text-slate-700 dark:text-slate-200 font-bold block">15 Jun 1986</span>
                          </div>
                          <div>
                            <span className="text-slate-455 dark:text-slate-500 block text-[7px]">রক্তের গ্রুপ:</span>
                            <span className="text-rose-500 font-bold block">O+</span>
                          </div>
                        </div>
                        <div className="pt-1 border-t border-emerald-500/10">
                          <span className="text-slate-455 dark:text-slate-500 block text-[7px] font-black">NID NO:</span>
                          <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-black tracking-widest block">{viewingDocTenant.nid || '3829102938210'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back Side of NID */}
                  <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/20 dark:to-slate-900 border border-emerald-500/20 rounded-2xl p-4 relative shadow-md flex flex-col justify-between h-56 select-none font-sans">
                    <div className="space-y-2 text-[8px] flex-1">
                      <div className="border-b border-emerald-500/20 pb-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-455 text-[7px] block uppercase">Address / ঠিকানা:</span>
                        <p className="text-slate-700 dark:text-slate-200 font-semibold font-sans">ডাকঘর: ধানমন্ডি - ১২০৯, ঢাকা মেট্রোপলিটন</p>
                      </div>
                      <div className="flex justify-between gap-2 font-sans">
                        <div>
                          <span className="text-slate-455 dark:text-slate-500 text-[7px] block">প্রদানের স্থান:</span>
                          <span className="text-slate-700 dark:text-slate-200 font-bold">ঢাকা</span>
                        </div>
                        <div>
                          <span className="text-slate-455 dark:text-slate-500 text-[7px] block">প্রদানের তারিখ:</span>
                          <span className="text-slate-700 dark:text-slate-200 font-bold">12 Jan 2018</span>
                        </div>
                      </div>

                      {/* Simulated Barcode block */}
                      <div className="bg-white p-2 rounded-lg border border-slate-200 mt-3 shadow-inner flex flex-col justify-center items-center gap-1.5 h-16 w-full">
                        <div className="flex gap-[1.5px] items-stretch justify-center h-8 w-full">
                          {Array.from({ length: 42 }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`bg-slate-900 rounded-sm shrink-0 ${idx % 3 === 0 ? 'w-[1px]' :
                                idx % 5 === 0 ? 'w-[2.5px]' :
                                  idx % 7 === 0 ? 'w-[1.5px]' : 'w-[2px]'
                                }`}
                            ></div>
                          ))}
                        </div>
                        <span className="text-[7px] tracking-[0.25em] font-mono text-slate-500 font-bold">NID8872910382910382910382910EC</span>
                      </div>
                    </div>
                    <div className="text-center text-[7px] font-bold text-slate-400 border-t border-emerald-500/10 pt-1.5 font-sans">
                      Election Commission Bangladesh / নির্বাচন কমিশন বাংলাদেশ
                    </div>
                  </div>
                </div>
              ) : (
                /* Rental Deed Mockup */
                <div className="bg-orange-50/15 dark:bg-slate-900 border-t-[14px] border-emerald-700 border-x border-b border-slate-200 dark:border-slate-800 rounded-b-2xl p-6 space-y-5 w-full max-w-lg shadow-lg relative text-slate-800 dark:text-slate-250 font-serif leading-relaxed text-xs font-sans">
                  {/* Stamp Seal Mockup */}
                  <div className="border border-dashed border-emerald-700/40 p-3 rounded-xl flex flex-col items-center justify-center space-y-1 text-emerald-800 dark:text-emerald-400 select-none">
                    <span className="text-[14px] tracking-widest font-black block uppercase">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</span>
                    <div className="w-10 h-10 border border-emerald-700 rounded-full flex items-center justify-center font-black text-xs">১০০</div>
                    <span className="text-[9px] font-black block tracking-widest uppercase">একশত টাকা (১০০/-)</span>
                    <span className="text-[8px] block text-slate-450 font-sans">JUDICIAL STAMP PAPER DEED BANGLADESH</span>
                  </div>

                  {/* Title of agreement */}
                  <div className="text-center font-bold tracking-wider pt-2">
                    <h4 className="text-[13px] font-black text-slate-900 dark:text-slate-100 uppercase underline">অস্থায়ী ফ্ল্যাট/দোকান ভাড়া চুক্তিপত্র দলিল</h4>
                  </div>

                  <div className="space-y-3 text-[11px] font-sans">
                    <p>
                      <strong>১ম পক্ষ (প্রপার্টি মালিক):</strong> বঙ্গ প্রোপার্টি হোল্ডিংস লিমিটেড (ম্যানেজার পক্ষে).
                    </p>
                    <p>
                      <strong>২য় পক্ষ (ভাড়াটিয়া):</strong> {viewingDocTenant.name}, মোবাইল: {viewingDocTenant.phone}.
                    </p>

                    <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 font-bold text-slate-700 dark:text-slate-350">
                      <div className="flex justify-between">
                        <span>১. চুক্তির শুরুর তারিখ:</span>
                        <span>{viewingDocTenant.moveInDate}</span>
                      </div>
                      <div className="flex justify-between font-sans">
                        <span>২. ভাড়াটিয়া স্থিতি:</span>
                        <span className="text-emerald-500 font-sans">সক্রিয় ভাড়াটিয়া</span>
                      </div>
                    </div>

                    <ul className="list-decimal pl-4 space-y-1 text-[10px] text-slate-650 dark:text-slate-400">
                      <li>প্রতি ইংরেজি মাসের ১০ তারিখের মধ্যে ২য় পক্ষকে অত্র ইউনিটের মাসিক ভাড়া ১ম পক্ষকে পরিশোধ করিতে হইবে।</li>
                      <li>বিদ্যুৎ, গ্যাস ও পানি বিল সহ অন্যান্য ইউটিলিটি বিল ২য় পক্ষ স্বীয় দায়িত্বে বহন করিবেন।</li>
                    </ul>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between pt-6 text-[10px] text-slate-650 dark:text-slate-455 select-none font-sans">
                    <div className="text-center w-24">
                      <div className="h-8 flex items-end justify-center font-mono italic text-[9px] text-sky-500 border-b border-dashed border-slate-300 pb-0.5">Manager.BP</div>
                      <span className="block font-bold mt-1">১ম পক্ষ (মালিক)</span>
                    </div>
                    <div className="text-center w-24">
                      <div className="h-8 flex items-end justify-center font-mono italic text-[9px] text-purple-500 border-b border-dashed border-slate-300 pb-0.5">{viewingDocTenant.name.split(' ')[0]}</div>
                      <span className="block font-bold mt-1">২য় পক্ষ (ভাড়াটিয়া)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end w-full">
              <button
                onClick={() => {
                  setViewingSelectedDoc(null);
                  setViewingDocTenant(null);
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-md font-sans"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
