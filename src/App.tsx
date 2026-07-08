import React, { useState, useEffect } from 'react';
import { useTranslation, Language } from './services/translation';
import { MockDB, Company } from './services/db';

// Component imports
// VisitorParking, SalesBooking, and AISmartFeatures have been removed
import Dashboard from './components/Dashboard';
import PropertyManager from './components/PropertyManager';
import TenantManager from './components/TenantManager';
import RentManager from './components/RentManager';
import UtilityManager from './components/UtilityManager';
import MaintenanceManager from './components/MaintenanceManager';
import Accounting from './components/Accounting';
import EmployeeManager from './components/EmployeeManager';
import Reports from './components/Reports';
import SuperAdmin from './components/SuperAdmin';
import TenantPortal from './components/TenantPortal';
import AIChatSidebar from './components/AIChatSidebar';

// Icons
import {
  Menu, X, Sun, Moon, Globe, Bell, Bot, ChevronRight,
  Home, Users, FileText, Zap, Wrench, ShieldCheck,
  BadgeDollarSign, BookOpen, Briefcase, FileSpreadsheet, Brain, Shield, User
} from 'lucide-react';

export default function App() {
  const { t, lang, toggleLanguage } = useTranslation();

  // App States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeRole, setActiveRole] = useState<string>('owner'); // owner, admin, manager, accountant, collector, tenant
  const [activeCompanyId, setActiveCompanyId] = useState<string>('c1');
  const isDark = false;
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Load Companies
  const companies = MockDB.getTable<Company>('companies');
  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0];

  // Load Theme (Force light theme)
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
  }, []);

  // Handle auto-routing when switching roles
  useEffect(() => {
    if (activeRole === 'tenant') {
      setActiveTab('tenantPortal');
    } else if (activeRole === 'superAdmin') {
      setActiveTab('superAdmin');
    } else {
      setActiveTab('dashboard');
    }
  }, [activeRole]);

  // Role Access configuration
  const getSidebarMenus = () => {
    if (activeRole === 'tenant') {
      return [{ id: 'tenantPortal', label: t('tenantPortal'), icon: User }];
    }
    if (activeRole === 'superAdmin') {
      return [
        { id: 'superAdmin', label: t('superAdmin'), icon: Shield },
        { id: 'reports', label: t('reports'), icon: FileSpreadsheet }
      ];
    }

    const items = [
      { id: 'dashboard', label: t('dashboard'), icon: Home },
      { id: 'reports', label: t('reports'), icon: FileSpreadsheet },
      { id: 'accountingSystem', label: t('accountingSystem'), icon: BookOpen },
      { id: 'rentMgmt', label: t('rentMgmt'), icon: FileText },
      { id: 'propertyMgmt', label: t('propertyMgmt'), icon: Home },
      { id: 'employeeMgmt', label: t('employeeMgmt'), icon: Briefcase },
      { id: 'tenantMgmt', label: t('tenantMgmt'), icon: Users },
      { id: 'utilityMgmt', label: t('utilityMgmt'), icon: Zap },
      { id: 'maintenanceMgmt', label: t('maintenanceMgmt'), icon: Wrench },
    ];

    // Filter menus based on role
    if (activeRole === 'accountant') {
      return items.filter(i => ['dashboard', 'rentMgmt', 'accountingSystem', 'reports'].includes(i.id));
    }
    if (activeRole === 'collector') {
      return items.filter(i => ['dashboard', 'rentMgmt', 'utilityMgmt'].includes(i.id));
    }
    return items;
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard companyId={activeCompanyId} />;
      case 'propertyMgmt':
      case 'unitMgmt':
        return <PropertyManager companyId={activeCompanyId} />;
      case 'tenantMgmt':
        return <TenantManager companyId={activeCompanyId} />;
      case 'rentMgmt':
        return <RentManager companyId={activeCompanyId} />;
      case 'utilityMgmt':
        return <UtilityManager companyId={activeCompanyId} />;
      case 'maintenanceMgmt':
        return <MaintenanceManager companyId={activeCompanyId} />;
      case 'accountingSystem':
        return <Accounting companyId={activeCompanyId} />;
      case 'employeeMgmt':
        return <EmployeeManager companyId={activeCompanyId} />;
      case 'reports':
        return <Reports companyId={activeCompanyId} />;
      case 'superAdmin':
        return <SuperAdmin />;
      case 'tenantPortal':
        return <TenantPortal tenantId="t1" />; // KAMRUL HASAN default tenant profile demo
      default:
        return <Dashboard companyId={activeCompanyId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex text-slate-800 dark:text-slate-100 selection:bg-sky-500/30 selection:text-sky-300">

      {/* Sidebar Panel */}
      <aside className={`no-print fixed inset-y-0 left-0 z-40 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'
        } glass-panel border-r border-slate-200 dark:border-blue-900/30 bg-sidebar-bg flex flex-col justify-between hidden md:flex`}>
        <div className="flex flex-col h-full overflow-hidden w-full">
          {/* Logo & Slogan */}
          <div className="p-6 border-b border-slate-200 dark:border-blue-950/40 flex justify-between items-center shrink-0">
            {!sidebarCollapsed ? (
              <div>
                <h1 className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent uppercase m-0 leading-none">
                  {t('appName')}
                </h1>
                <p className="text-[9px] text-slate-500 font-semibold mt-1 uppercase tracking-widest">{t('slogan')}</p>
              </div>
            ) : (
              <span className="text-lg font-black text-sky-400 mx-auto">BP</span>
            )}
          </div>

          {/* Menus List - Scrollable */}
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
            {getSidebarMenus().map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center p-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/15'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-950/20 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  <IconComponent className="w-5 h-5 mr-3 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Brand Copyright Info */}
          {!sidebarCollapsed && (
            <div className="p-6 border-t border-slate-200 dark:border-blue-950/40 text-[10px] text-slate-500 font-medium shrink-0">
              <p>{t('footerMadeBy')}</p>
              <p className="mt-1">
                <a href="https://www.softwarepointbd.com/" target="_blank" rel="noopener noreferrer" className="hover:underline text-sky-400">
                  www.softwarepointbd.com
                </a>
              </p>
              <p className="mt-1">{t('hotline')}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        } pb-16 md:pb-0`}>

        {/* Sticky Header Navbar */}
        <header className="no-print sticky top-0 z-30 glass-panel border-b border-slate-200 dark:border-blue-900/30 bg-sidebar-bg flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hidden md:block text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-slate-400 hidden sm:inline-block">
              {activeCompany.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Assistant Float Button */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="p-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-xl transition-all flex items-center gap-1.5 border border-sky-500/20"
            >
              <Bot className="w-4 h-4" />
              <span className="text-[10px] font-bold hidden md:inline">AI Chat</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 flex items-center gap-1 transition-all"
            >
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-bold uppercase">{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-xl transition-all relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 glass-panel border border-slate-200 dark:border-blue-900/30 rounded-2xl shadow-xl p-4 text-xs z-50 animate-slide-in space-y-3">
                  <span className="font-bold block text-slate-800 dark:text-slate-300">System Notification Alerts</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <div className="p-2 bg-rose-500/5 rounded-xl border border-rose-500/10">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Flat A1 Overdue Alert</span>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400">July Rent billing has passed due date.</p>
                    </div>
                    <div className="p-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Shop 101 Payment Registered</span>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400">Received 20,000 BDT partial rent.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Multi-Tenant Company Switcher */}
            {activeRole !== 'superAdmin' && activeRole !== 'tenant' && (
              <select
                value={activeCompanyId}
                onChange={(e) => setActiveCompanyId(e.target.value)}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 text-[10px] font-bold p-2.5 rounded-xl text-slate-700 dark:text-slate-300 outline-none w-32 sm:w-44"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{c.name}</option>
                ))}
              </select>
            )}

            {/* Access Role Switcher Selector */}
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/40 text-[10px] font-bold p-2.5 rounded-xl text-sky-600 dark:text-sky-400 outline-none w-24 sm:w-32"
            >
              <option value="owner" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Property Owner</option>
              <option value="manager" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Property Manager</option>
              <option value="accountant" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Accountant</option>
              <option value="collector" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Cash Collector</option>
              <option value="tenant" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Tenant View</option>
              <option value="superAdmin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Super Admin Panel</option>
            </select>

          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 md:p-6 w-full pb-24 md:pb-8">
          {renderActiveModule()}
        </main>

        {/* Mobile Responsive Bottom Navigation */}
        <nav className="no-print fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-slate-200 dark:border-blue-900/30 bg-sidebar-bg flex items-center justify-around z-40 md:hidden">
          {getSidebarMenus().slice(0, 4).map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all ${isActive ? 'text-sky-600 dark:text-sky-400 font-bold' : ''
                  }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-[9px] mt-1">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>

        {/* AI Assistant Chat Widget */}
        <AIChatSidebar isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </div>
  );
}
