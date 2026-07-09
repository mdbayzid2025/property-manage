import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Property, Unit, Tenant, TenantDoc } from '../services/db';
import {
  Home, Plus, Search, Filter, ShieldAlert, Check,
  X, User, Calendar, DollarSign, FileText, UserPlus, History, LogOut, Trash2, Upload
} from 'lucide-react';

export default function PropertyManager({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // States
  const [properties, setProperties] = useState<Property[]>(() =>
    MockDB.getTable<Property>('properties').filter(p => p.companyId === companyId)
  );
  const [units, setUnits] = useState<Unit[]>(() => MockDB.getTable<Unit>('units'));
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(properties[0] || null);

  // Selected Unit for details modal & tenants
  const [selectedUnitDetails, setSelectedUnitDetails] = useState<Unit | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>(() => MockDB.getTable<Tenant>('tenants'));

  // Form states for new tenant inside modal
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newTenantDocs, setNewTenantDocs] = useState<TenantDoc[]>([]);
  const [newTenantOccupation, setNewTenantOccupation] = useState('');
  const [newTenantEmergency, setNewTenantEmergency] = useState('');
  const [newTenantMoveInDate, setNewTenantMoveInDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Form states for adding a new unit
  const [showAddUnitForm, setShowAddUnitForm] = useState(false);
  const [newUnitNumber, setNewUnitNumber] = useState('');
  const [newUnitFloor, setNewUnitFloor] = useState(1);
  const [newUnitType, setNewUnitType] = useState<'flat' | 'shop' | 'office' | 'parking'>('flat');
  const [newUnitSize, setNewUnitSize] = useState(1200);
  const [newUnitRent, setNewUnitRent] = useState(20000);
  const [newUnitService, setNewUnitService] = useState(3000);
  const [newUnitDeposit, setNewUnitDeposit] = useState(40000);
  const [newUnitBedrooms, setNewUnitBedrooms] = useState(2);
  const [newUnitBathrooms, setNewUnitBathrooms] = useState(2);
  const [newUnitMeter, setNewUnitMeter] = useState('');

  // States for document viewer modal
  const [viewingSelectedDoc, setViewingSelectedDoc] = useState<TenantDoc | null>(null);
  const [viewingDocTenant, setViewingDocTenant] = useState<Tenant | null>(null);

  // Filters & Form
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<'residential' | 'commercial' | 'shopping' | 'office' | 'land' | 'mixed'>('residential');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropFloors, setNewPropFloors] = useState(5);

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName.trim() || !newPropAddress.trim()) return;

    const newProp = MockDB.insert<Property>('properties', {
      id: 'prop_' + Math.random().toString(36).substr(2, 9),
      companyId,
      name: newPropName,
      type: newPropType,
      address: newPropAddress,
      floors: newPropFloors,
      totalUnits: 0,
      status: 'active'
    });

    setProperties(prev => [...prev, newProp]);
    setSelectedProperty(newProp);
    setNewPropName('');
    setNewPropAddress('');
    setShowAddForm(false);
  };

  // Modal handlers & helper queries
  const getActiveTenantForUnit = (unitId: string) => {
    return tenants.find(t => t.unitId === unitId && t.status === 'active');
  };

  const getTenantHistoryForUnit = (unitId: string) => {
    return tenants.filter(t => t.unitId === unitId);
  };

  const handleCheckoutTenant = (tenantId: string, unitId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই ভাড়াটিয়াকে প্রস্থান (Checkout) করাতে চান?")) return;

    const today = new Date().toISOString().split('T')[0];

    // Update tenant status to moved_out and set moveOutDate
    MockDB.update<Tenant>('tenants', tenantId, {
      status: 'moved_out',
      moveOutDate: today
    });

    // Update unit status to vacant
    MockDB.update<Unit>('units', unitId, {
      status: 'vacant'
    });

    const updatedUnits = MockDB.getTable<Unit>('units');
    const updatedTenants = MockDB.getTable<Tenant>('tenants');

    setUnits(updatedUnits);
    setTenants(updatedTenants);

    const updatedUnit = updatedUnits.find(u => u.id === unitId);
    if (updatedUnit) {
      setSelectedUnitDetails(updatedUnit);
    }
  };

  const handleAssignNewTenant = (e: React.FormEvent, unitId: string) => {
    e.preventDefault();
    if (!newTenantName.trim() || !newTenantPhone.trim()) {
      alert("নাম এবং মোবাইল নম্বর আবশ্যিক!");
      return;
    }

    MockDB.insert<Tenant>('tenants', {
      id: 'tn_' + Math.random().toString(36).substr(2, 9),
      companyId,
      name: newTenantName,
      phone: newTenantPhone,
      nid: '',
      email: '',
      occupation: newTenantOccupation,
      unitId,
      moveInDate: newTenantMoveInDate,
      emergencyContact: newTenantEmergency,
      status: 'active',
      documents: newTenantDocs
    });

    MockDB.update<Unit>('units', unitId, {
      status: 'occupied'
    });

    const updatedUnits = MockDB.getTable<Unit>('units');
    const updatedTenants = MockDB.getTable<Tenant>('tenants');

    setUnits(updatedUnits);
    setTenants(updatedTenants);

    // Reset forms
    setNewTenantName('');
    setNewTenantPhone('');
    setNewTenantDocs([]);
    setNewTenantOccupation('');
    setNewTenantEmergency('');
    setNewTenantMoveInDate(new Date().toISOString().split('T')[0]);

    const updatedUnit = updatedUnits.find(u => u.id === unitId);
    if (updatedUnit) {
      setSelectedUnitDetails(updatedUnit);
    }
  };

  const handleUpdateUnitStatus = (unitId: string, status: Unit['status']) => {
    MockDB.update<Unit>('units', unitId, { status });

    const updatedUnits = MockDB.getTable<Unit>('units');
    setUnits(updatedUnits);

    const updatedUnit = updatedUnits.find(u => u.id === unitId);
    if (updatedUnit) {
      setSelectedUnitDetails(updatedUnit);
    }
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !newUnitNumber.trim()) return;

    const newUnit = MockDB.insert<Unit>('units', {
      id: 'unit_' + Math.random().toString(36).substr(2, 9),
      propertyId: selectedProperty.id,
      number: newUnitNumber,
      floor: Number(newUnitFloor),
      type: newUnitType,
      sizeSqft: Number(newUnitSize),
      rentAmount: Number(newUnitRent),
      serviceCharge: Number(newUnitService),
      securityDeposit: Number(newUnitDeposit),
      status: 'vacant',
      bedrooms: newUnitType === 'flat' ? Number(newUnitBedrooms) : undefined,
      bathrooms: newUnitType === 'flat' ? Number(newUnitBathrooms) : undefined,
      meterNumber: newUnitMeter.trim() || undefined
    });

    setUnits(prev => [...prev, newUnit]);

    // Reset form
    setNewUnitNumber('');
    setNewUnitFloor(1);
    setNewUnitType('flat');
    setNewUnitSize(1200);
    setNewUnitRent(20000);
    setNewUnitService(3000);
    setNewUnitDeposit(40000);
    setNewUnitBedrooms(2);
    setNewUnitBathrooms(2);
    setNewUnitMeter('');
    setShowAddUnitForm(false);
  };

  const handleDeleteUnit = (unitId: string) => {
    const activeTenant = getActiveTenantForUnit(unitId);
    if (activeTenant) {
      alert("এই ইউনিটে বর্তমানে ভাড়াটিয়া রয়েছে! প্রথমে ভাড়াটিয়াকে Checkout করুন।");
      return;
    }

    if (!window.confirm("আপনি কি নিশ্চিত যে এই ইউনিটটি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।")) return;

    MockDB.delete('units', unitId);

    // Refresh states
    setUnits(MockDB.getTable<Unit>('units'));
    setSelectedUnitDetails(null);
  };

  const handleViewDoc = (doc: TenantDoc, tenant: Tenant) => {
    setViewingSelectedDoc(doc);
    setViewingDocTenant(tenant);
  };

  // Filter units belonging to selected property
  const propertyUnits = selectedProperty
    ? units.filter(u => u.propertyId === selectedProperty.id)
    : [];

  const filteredUnits = propertyUnits.filter(u => {
    const matchesSearch = u.number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('propertyMgmt')}</h2>
            <p className="text-xs text-slate-400">Manage towers, commercial centers, residential apartments and lands</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProperty} className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-in">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Property Name</label>
            <input
              type="text"
              placeholder="e.g. Bongo Tower Phase-2"
              value={newPropName}
              onChange={(e) => setNewPropName(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl text-xs outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Property Type</label>
            <select
              value={newPropType}
              onChange={(e: any) => setNewPropType(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl text-xs outline-none text-slate-300"
            >
              <option value="residential">Residential Apartments</option>
              <option value="commercial">Commercial Buildings</option>
              <option value="shopping">Shopping Complexes</option>
              <option value="office">Office Buildings</option>
              <option value="land">Land Projects</option>
              <option value="mixed">Mixed-Use Developments</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Location Address</label>
            <input
              type="text"
              placeholder="e.g. ধানমন্ডি, ঢাকা"
              value={newPropAddress}
              onChange={(e) => setNewPropAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 rounded-xl text-xs outline-none"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/10"
            >
              Save Property
            </button>
          </div>
        </form>
      )}

      {/* Property Selector Badges */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {properties.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProperty(p)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${selectedProperty?.id === p.id
              ? 'border-sky-500 bg-sky-500/10 text-sky-400'
              : 'border-slate-800 hover:border-slate-600 text-slate-400'
              }`}
          >
            {p.name} ({p.type.toUpperCase()})
          </button>
        ))}
      </div>

      {/* Selected Property Details & Unit Grid */}
      {selectedProperty && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Property Sidebar Details */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{selectedProperty.name}</h3>
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between gap-2">
                <span className="shrink-0 text-slate-450 dark:text-slate-500">Address:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-250 text-right">{selectedProperty.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455 dark:text-slate-500">Floors:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-250">{selectedProperty.floors} Floors</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455 dark:text-slate-500">Units Managed:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-250">{propertyUnits.length} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455 dark:text-slate-500">Status:</span>
                <span className="text-emerald-500 font-semibold">{selectedProperty.status.toUpperCase()}</span>
              </div>
            </div>
            <hr className="border-slate-200 dark:border-slate-800/80" />
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Unit Status Legend</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-650 dark:text-slate-450">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Vacant</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Occupied</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Sold</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reserved</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Maintenance</span>
              </div>
            </div>
          </div>

          {/* Unit Manager Grid and Filter */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-blue-900/30 shadow-sm animate-slide-in">
              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950/40 px-3 py-2 rounded-xl w-full md:w-auto border border-slate-200 dark:border-slate-800/80 transition-all focus-within:border-sky-500/50">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder={t('search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none border-none text-xs text-slate-700 dark:text-slate-300 w-full placeholder-slate-400 dark:placeholder-slate-600"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-2 rounded-xl text-xs text-slate-750 dark:text-slate-300 outline-none w-full md:w-auto transition-all focus:border-sky-500/50"
                >
                  <option value="all" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100">All Units (সব ইউনিট)</option>
                  <option value="vacant" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100">Vacant (ফাঁকা)</option>
                  <option value="occupied" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100">Occupied (ভাড়াটিয়া আছে)</option>
                  <option value="sold" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100">Sold (বিক্রি হয়েছে)</option>
                  <option value="reserved" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100">Reserved (বুকড)</option>
                  <option value="maintenance" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100">Maintenance (রক্ষণাবেক্ষণ)</option>
                </select>

                <button
                  onClick={() => setShowAddUnitForm(!showAddUnitForm)}
                  className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/10 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add Unit
                </button>
              </div>
            </div>

            {showAddUnitForm && (
              <form onSubmit={handleAddUnit} className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-in text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Unit Number/Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat C1"
                    value={newUnitNumber}
                    onChange={(e) => setNewUnitNumber(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Floor *</label>
                  <input
                    type="number"
                    value={newUnitFloor}
                    onChange={(e) => setNewUnitFloor(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Unit Type *</label>
                  <select
                    value={newUnitType}
                    onChange={(e: any) => setNewUnitType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <option value="flat">Flat (বাসা)</option>
                    <option value="shop">Shop (দোকান)</option>
                    <option value="office">Office (অফিস)</option>
                    <option value="parking">Plot / Parking (প্লট / পার্কিং)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Size (Sqft) *</label>
                  <input
                    type="number"
                    value={newUnitSize}
                    onChange={(e) => setNewUnitSize(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Monthly Rent *</label>
                  <input
                    type="number"
                    value={newUnitRent}
                    onChange={(e) => setNewUnitRent(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Service Charge *</label>
                  <input
                    type="number"
                    value={newUnitService}
                    onChange={(e) => setNewUnitService(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Security Deposit *</label>
                  <input
                    type="number"
                    value={newUnitDeposit}
                    onChange={(e) => setNewUnitDeposit(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Meter Number</label>
                  <input
                    type="text"
                    placeholder="e.g. E-882715"
                    value={newUnitMeter}
                    onChange={(e) => setNewUnitMeter(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
                {newUnitType === 'flat' && (
                  <>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Bedrooms</label>
                      <input
                        type="number"
                        value={newUnitBedrooms}
                        onChange={(e) => setNewUnitBedrooms(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Bathrooms</label>
                      <input
                        type="number"
                        value={newUnitBathrooms}
                        onChange={(e) => setNewUnitBathrooms(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </>
                )}
                <div className="flex items-end md:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/10"
                  >
                    Save Unit (ইউনিট সংরক্ষণ করুন)
                  </button>
                </div>
              </form>
            )}

            {/* Interactive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredUnits.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-500 text-xs">No units match the filter criteria.</div>
              ) : (
                filteredUnits.map((u) => {
                  const statusColors =
                    u.status === 'vacant' ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' :
                      u.status === 'occupied' ? 'border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/5' :
                        u.status === 'sold' ? 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5' :
                          u.status === 'reserved' ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5' :
                            'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5';

                  return (
                    <div
                      key={u.id}
                      onClick={() => setSelectedUnitDetails(u)}
                      className={`glass-panel border p-4 rounded-2xl flex flex-col justify-between h-36 relative transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer ${statusColors}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{u.number}</span>
                        <span className="text-[9px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">{u.type}</span>
                      </div>
                      <div className="space-y-1 mt-2 text-[10px] text-slate-600 dark:text-slate-450">
                        <p>{u.sizeSqft} Sqft • Floor {u.floor}</p>
                        {u.bedrooms && <p>{u.bedrooms} Beds / {u.bathrooms} Baths</p>}
                        {u.rentAmount > 0 && <p className="font-extrabold text-slate-800 dark:text-slate-250">৳ {u.rentAmount.toLocaleString()} / mo</p>}
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                        <span className="text-[9px] font-bold uppercase">{u.status}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUnitDetails(u);
                          }}
                          className="text-[9px] font-bold hover:underline text-sky-500"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* Unit Details & Tenant Management Modal */}
      {selectedUnitDetails && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-slide-in my-8">

            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-850 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {selectedUnitDetails.number} - এর বিস্তারিত বিবরণ
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${selectedUnitDetails.status === 'vacant' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20' :
                  selectedUnitDetails.status === 'occupied' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-455 border-sky-500/20' :
                    selectedUnitDetails.status === 'sold' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-450 border-purple-500/20' :
                      selectedUnitDetails.status === 'reserved' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-455 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-500/20'
                  }`}>
                  {selectedUnitDetails.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedUnitDetails(null)}
                className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">

              {/* Left Column: Specifications & Info */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    ফ্ল্যাট / ইউনিটের বিবরণ (Unit Specs)
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl">
                      <span className="text-slate-400 dark:text-slate-500 block mb-0.5">প্রকার (Type)</span>
                      <strong className="text-slate-700 dark:text-slate-200 capitalize font-extrabold">{selectedUnitDetails.type}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl">
                      <span className="text-slate-400 dark:text-slate-500 block mb-0.5">সাইজ (Size)</span>
                      <strong className="text-slate-700 dark:text-slate-200 font-extrabold">{selectedUnitDetails.sizeSqft} Sqft</strong>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl">
                      <span className="text-slate-400 dark:text-slate-500 block mb-0.5">তলা (Floor)</span>
                      <strong className="text-slate-700 dark:text-slate-200 font-extrabold">Floor {selectedUnitDetails.floor}</strong>
                    </div>
                    {selectedUnitDetails.bedrooms && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl">
                        <span className="text-slate-400 dark:text-slate-500 block mb-0.5">রুম বিবরণ</span>
                        <strong className="text-slate-700 dark:text-slate-200 font-extrabold">{selectedUnitDetails.bedrooms} Beds / {selectedUnitDetails.bathrooms} Baths</strong>
                      </div>
                    )}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl">
                      <span className="text-slate-400 dark:text-slate-500 block mb-0.5">ভাড়া (Monthly Rent)</span>
                      <strong className="text-slate-700 dark:text-slate-200 font-extrabold">৳ {selectedUnitDetails.rentAmount.toLocaleString()}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl">
                      <span className="text-slate-400 dark:text-slate-500 block mb-0.5">সার্ভিস চার্জ</span>
                      <strong className="text-slate-700 dark:text-slate-200 font-extrabold">৳ {selectedUnitDetails.serviceCharge.toLocaleString()}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl col-span-2">
                      <span className="text-slate-400 dark:text-slate-500 block mb-0.5">সিকিউরিটি ডিপোজিট</span>
                      <strong className="text-slate-700 dark:text-slate-200 font-extrabold">৳ {selectedUnitDetails.securityDeposit.toLocaleString()}</strong>
                    </div>
                    {selectedUnitDetails.meterNumber && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl col-span-2">
                        <span className="text-slate-400 dark:text-slate-500 block mb-0.5">মিটার নম্বর (Utility Meter)</span>
                        <strong className="text-slate-700 dark:text-slate-200 font-extrabold">{selectedUnitDetails.meterNumber}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/25 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">অবস্থা পরিবর্তন করুন (Update Status)</h5>
                  <div className="flex gap-2 flex-wrap">
                    {(['vacant', 'occupied', 'reserved', 'sold', 'maintenance'] as Unit['status'][]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateUnitStatus(selectedUnitDetails.id, st)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border capitalize transition-all ${selectedUnitDetails.status === st
                          ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-700'
                          }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Danger Zone: Delete Unit */}
                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-bold text-rose-600 dark:text-rose-400">বিপদজনক অঞ্চল (Danger Zone)</h5>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">এই ফ্ল্যাট/ইউনিটটি চিরতরে মুছে ফেলুন</p>
                  </div>
                  <button
                    onClick={() => handleDeleteUnit(selectedUnitDetails.id)}
                    className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-rose-500/10 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    মুছে ফেলুন
                  </button>
                </div>

              </div>

              {/* Right Column: Tenants Management & timelines */}
              <div className="space-y-6">

                {/* Onboarding & Checkout Panel */}
                <div className="p-5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
                  {selectedUnitDetails.status === 'occupied' ? (
                    <div>
                      {(() => {
                        const currentTenant = getActiveTenantForUnit(selectedUnitDetails.id);
                        if (currentTenant) {
                          return (
                            <div className="space-y-4">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">বর্তমান ভাড়াটিয়া</span>
                                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{currentTenant.name}</h4>
                                  <p className="text-xs text-slate-500">{currentTenant.occupation || 'পেশা উল্লেখ নেই'}</p>
                                </div>
                                <button
                                  onClick={() => handleCheckoutTenant(currentTenant.id, selectedUnitDetails.id)}
                                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-455 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-colors border border-rose-500/20 shrink-0"
                                >
                                  <LogOut className="w-3.5 h-3.5" />
                                  Checkout করুন
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">মোবাইল নম্বর</span>
                                  <span className="text-slate-700 dark:text-slate-350 font-bold">{currentTenant.phone}</span>
                                </div>
                                {currentTenant.nid && (
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">জাতীয় পরিচয়পত্র NID</span>
                                    <span className="text-slate-700 dark:text-slate-350 font-bold">{currentTenant.nid}</span>
                                  </div>
                                )}
                                {currentTenant.email && (
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">ইমেইল</span>
                                    <span className="text-slate-700 dark:text-slate-350 font-medium overflow-hidden text-ellipsis block">{currentTenant.email}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-slate-400 block text-[10px]">ভাড়ার শুরুর তারিখ</span>
                                  <span className="text-slate-700 dark:text-slate-350 font-bold">{currentTenant.moveInDate}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-slate-400 block text-[10px]">জরুরি যোগাযোগ</span>
                                  <span className="text-slate-700 dark:text-slate-350">{currentTenant.emergencyContact || 'N/A'}</span>
                                </div>
                              </div>

                              {/* Submitted Documents Section */}
                              <div className="mt-4 pt-3 border-t border-slate-200/65 dark:border-slate-800/85">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider mb-2">ভাড়াটিয়ার কাগজপত্র (Submitted Documents)</span>
                                <div className="space-y-2">
                                  {currentTenant.documents && currentTenant.documents.length > 0 ? (
                                    currentTenant.documents.map((doc, idx) => (
                                      <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center text-xs">
                                        <span className="font-semibold text-slate-700 dark:text-slate-350">{doc.name} ({doc.size})</span>
                                        <button
                                          type="button"
                                          onClick={() => handleViewDoc(doc, currentTenant)}
                                          className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-lg font-bold text-[10px] transition-colors"
                                        >
                                          দেখুন (View)
                                        </button>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center text-xs">
                                      <span className="font-semibold text-slate-700 dark:text-slate-300">Rental Agreement Deed.pdf (1.2 MB)</span>
                                      <button
                                        type="button"
                                        onClick={() => handleViewDoc({ name: 'Rental Agreement Deed.pdf', size: '1.2 MB', type: 'application/pdf' }, currentTenant)}
                                        className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-lg font-bold text-[10px] transition-colors"
                                      >
                                        দেখুন (View)
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="py-6 text-center text-slate-500 text-xs space-y-3">
                              <p>ফ্ল্যাটের অবস্থা "Occupied" কিন্তু সক্রিয় কোনো ভাড়াটিয়া পাওয়া যায়নি।</p>
                              <button
                                onClick={() => handleUpdateUnitStatus(selectedUnitDetails.id, 'vacant')}
                                className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 rounded-xl text-xs font-bold"
                              >
                                অবস্থা "Vacant" করুন
                              </button>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-3">নতুন ভাড়াটিয়া অনবোর্ড করুন</span>
                      <form onSubmit={(e) => handleAssignNewTenant(e, selectedUnitDetails.id)} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-1">ভাড়াটিয়ার নাম *</label>
                            <input
                              type="text"
                              placeholder="যেমন: মোঃ সাকিব হাসান"
                              value={newTenantName}
                              onChange={(e) => setNewTenantName(e.target.value)}
                              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-1">মোবাইল নম্বর *</label>
                            <input
                              type="text"
                              placeholder="যেমন: 017XXXXXXXX"
                              value={newTenantPhone}
                              onChange={(e) => setNewTenantPhone(e.target.value)}
                              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-1">পেশা</label>
                            <input
                              type="text"
                              placeholder="যেমন: বেসরকারি চাকরি"
                              value={newTenantOccupation}
                              onChange={(e) => setNewTenantOccupation(e.target.value)}
                              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] text-slate-500 block mb-1">প্রয়োজনীয় ডকুমেন্টস (ছবি বা ফাইল আপলোড)</label>
                            <div className="flex flex-col gap-2.5">
                              {/* Drag & drop / Select file zone */}
                              <label className="w-full py-4 border border-dashed border-slate-300 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 bg-slate-50/50 dark:bg-slate-950/10 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-slate-100/50">
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
                                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                                  {newTenantDocs.map((doc, idx) => (
                                    <div key={idx} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center text-[10px] gap-1.5">
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
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-1">ভাড়ার তারিখ</label>
                            <input
                              type="date"
                              value={newTenantMoveInDate}
                              onChange={(e) => setNewTenantMoveInDate(e.target.value)}
                              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] text-slate-500 block mb-1">জরুরি যোগাযোগ বিবরণ</label>
                            <input
                              type="text"
                              placeholder="মোবাইল ও সম্পর্কের বিবরণ (যেমন: ০১৭০০-০০০০০০ - ভাই)"
                              value={newTenantEmergency}
                              onChange={(e) => setNewTenantEmergency(e.target.value)}
                              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all"
                          >
                            <UserPlus className="w-4 h-4" />
                            Register & Assign
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {/* Tenant History Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-350 uppercase tracking-wider">
                      ভাড়াটিয়া ইতিহাস সংরক্ষণাগার (Timeline)
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(() => {
                      const history = getTenantHistoryForUnit(selectedUnitDetails.id);
                      if (history.length === 0) {
                        return (
                          <div className="py-5 text-center text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/10 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl">
                            পূর্বে কোনো ভাড়াটিয়া থাকার ইতিহাস রেকর্ড নেই।
                          </div>
                        );
                      }
                      return history.map((h) => {
                        const isActive = h.status === 'active';
                        return (
                          <div
                            key={h.id}
                            className={`p-3 border rounded-2xl flex justify-between items-center text-xs transition-all ${isActive
                              ? 'border-sky-500 bg-sky-500/5'
                              : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 text-slate-650'
                              }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-slate-800 dark:text-slate-250 font-extrabold">{h.name}</strong>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                  }`}>
                                  {isActive ? 'সক্রিয়' : 'পূর্বের'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-550 mt-0.5 font-medium">মোবাইল: {h.phone}</p>
                              <p className="text-[9px] text-slate-455 dark:text-slate-500 mt-0.5 font-medium">
                                সময়কাল: {h.moveInDate} থেকে {h.moveOutDate || 'বর্তমান'}
                              </p>
                            </div>
                            <span className="text-[10px] text-slate-550 dark:text-slate-450 font-medium">
                              {h.occupation}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

              </div>

            </div>
          </div>
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
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
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
            <div className="flex-1 flex justify-center py-4 overflow-y-auto max-h-[60vh] w-full">
              {viewingSelectedDoc.previewUrl && viewingSelectedDoc.type.startsWith('image/') ? (
                <div className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-3xl max-w-lg w-full">
                  <img
                    src={viewingSelectedDoc.previewUrl}
                    alt={viewingSelectedDoc.name}
                    className="max-w-full max-h-[48vh] object-contain rounded-2xl shadow-md border border-slate-200/50"
                  />
                  <span className="text-[10px] text-slate-400 mt-2 font-bold">{viewingSelectedDoc.name} ({viewingSelectedDoc.size})</span>
                </div>
              ) : viewingSelectedDoc.name.toLowerCase().includes('nid') ? (
                <div className="space-y-6 w-full max-w-md">
                  {/* Front Side of NID */}
                  <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/20 dark:to-slate-900 border border-emerald-500/20 rounded-2xl p-4 relative shadow-md flex flex-col justify-between h-56 text-slate-800 dark:text-slate-200 select-none">
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
                          <span className="text-slate-450 dark:text-slate-500 block text-[7px]">মাতা (Mother):</span>
                          <span className="text-slate-700 dark:text-slate-200 font-bold block">মোছাঃ রাশিদা বেগম</span>
                        </div>
                        <div className="flex justify-between gap-1">
                          <div>
                            <span className="text-slate-450 dark:text-slate-500 block text-[7px]">জন্ম তারিখ (Date of Birth):</span>
                            <span className="text-slate-700 dark:text-slate-200 font-bold block">15 Jun 1986</span>
                          </div>
                          <div>
                            <span className="text-slate-450 dark:text-slate-500 block text-[7px]">রক্তের গ্রুপ:</span>
                            <span className="text-rose-500 font-bold block">O+</span>
                          </div>
                        </div>
                        <div className="pt-1 border-t border-emerald-500/10">
                          <span className="text-slate-450 dark:text-slate-500 block text-[7px] font-black">NID NO:</span>
                          <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-black tracking-widest block">{viewingDocTenant.nid || '3829102938210'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back Side of NID */}
                  <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/20 dark:to-slate-900 border border-emerald-500/20 rounded-2xl p-4 relative shadow-md flex flex-col justify-between h-56 text-slate-800 dark:text-slate-200 select-none">
                    <div className="space-y-2 text-[8px] flex-1">
                      <div className="border-b border-emerald-500/20 pb-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-450 text-[7px] block uppercase">Address / ঠিকানা:</span>
                        <p className="text-slate-700 dark:text-slate-200 font-semibold">{selectedProperty?.address}, ডাকঘর: ধানমন্ডি - ১২০৯, ঢাকা মেট্রোপলিটন</p>
                      </div>
                      <div className="flex justify-between gap-2">
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
                    <div className="text-center text-[7px] font-bold text-slate-400 border-t border-emerald-500/10 pt-1.5">
                      Election Commission Bangladesh / নির্বাচন কমিশন বাংলাদেশ
                    </div>
                  </div>
                </div>
              ) : (
                /* Rental Deed Mockup */
                <div className="bg-orange-50/15 dark:bg-slate-900 border-t-[14px] border-emerald-700 border-x border-b border-slate-200 dark:border-slate-800 rounded-b-2xl p-6 space-y-5 w-full max-w-lg shadow-lg relative text-slate-800 dark:text-slate-250 font-serif leading-relaxed text-xs">
                  {/* Stamp Seal Mockup */}
                  <div className="border border-dashed border-emerald-700/40 p-3 rounded-xl flex flex-col items-center justify-center space-y-1 text-emerald-800 dark:text-emerald-400 select-none">
                    <span className="text-[14px] tracking-widest font-black block uppercase">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</span>
                    <div className="w-10 h-10 border border-emerald-700 rounded-full flex items-center justify-center font-black text-xs">১০০</div>
                    <span className="text-[9px] font-black block tracking-widest uppercase">একশত টাকা (১০০/-)</span>
                    <span className="text-[8px] block text-slate-450">JUDICIAL STAMP PAPER DEED BANGLADESH</span>
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
                    <p>
                      উভয় পক্ষ স্বেচ্ছায় রাজী হইয়া অত্র ফ্ল্যাট/ইউনিট <strong>{selectedUnitDetails?.number}</strong> ভাড়ার নিম্নোক্ত চুক্তিনামায় স্বাক্ষর করিলেন:
                    </p>

                    <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 font-bold text-slate-700 dark:text-slate-350">
                      <div className="flex justify-between">
                        <span>১. ফ্ল্যাট নম্বর:</span>
                        <span className="text-sky-600 dark:text-sky-400">{selectedUnitDetails?.number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>২. মাসিক ভাড়া:</span>
                        <span>৳ {selectedUnitDetails?.rentAmount.toLocaleString()} / মাস</span>
                      </div>
                      <div className="flex justify-between">
                        <span>৩. জামানত (Deposit):</span>
                        <span>৳ {selectedUnitDetails?.securityDeposit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>৪. চুক্তির শুরুর তারিখ:</span>
                        <span>{viewingDocTenant.moveInDate}</span>
                      </div>
                    </div>

                    <ul className="list-decimal pl-4 space-y-1 text-[10px] text-slate-600 dark:text-slate-400">
                      <li>প্রতি ইংরেজি মাসের ১০ তারিখের মধ্যে ২য় পক্ষকে অত্র ইউনিটের মাসিক ভাড়া ১ম পক্ষকে পরিশোধ করিতে হইবে।</li>
                      <li>বিদ্যুৎ, গ্যাস ও পানি বিল সহ অন্যান্য ইউটিলিটি বিল ২য় পক্ষ স্বীয় দায়িত্বে বহন করিবেন।</li>
                      <li>২য় পক্ষ অত্র ইউনিট কেবল আবাসিক/দাপ্তরিক কার্যে ব্যবহার করিবেন, কোনরূপ অসামাজিক বা অবৈধ কার্যে ব্যবহার করিতে পারিবেন না।</li>
                    </ul>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between pt-6 font-sans text-[10px] text-slate-650 dark:text-slate-455 select-none">
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
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
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
