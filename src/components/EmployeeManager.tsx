import React, { useState } from 'react';
import { useTranslation } from '../services/translation';
import { MockDB, Employee, AccountTransaction } from '../services/db';
import { Briefcase, UserPlus, Check, DollarSign } from 'lucide-react';

export default function EmployeeManager({ companyId }: { companyId: string }) {
  const { t, lang } = useTranslation();

  // DB tables
  const [employees, setEmployees] = useState<Employee[]>(() => 
    MockDB.getTable<Employee>('employees').filter(e => e.companyId === companyId)
  );

  const handlePaySalary = (emp: Employee) => {
    // Process payment in ledger expense
    MockDB.insert<AccountTransaction>('transactions', {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      companyId,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: 'Salary Expense',
      account: 'Bank Account',
      amount: emp.salary,
      description: `বেতন বিতরণ: ${emp.name} (${emp.role})`
    });

    alert(`Salary of ৳${emp.salary.toLocaleString()} disbursed to ${emp.name} via Bank transfer.`);
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('employeeMgmt')}</h2>
            <p className="text-xs text-slate-400">Manage property staff, caretaker shift attendances and process payroll payouts</p>
          </div>
        </div>
      </div>

      {/* Employees grid list */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30">
        <span className="font-bold text-sm block mb-4">Staff Directory</span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map((emp) => (
            <div key={emp.id} className="p-4 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-blue-950/40 rounded-xl flex justify-between items-center text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{emp.name}</h4>
                <p className="text-slate-500 dark:text-slate-450">Role: <strong className="text-sky-600 dark:text-sky-400">{emp.role}</strong> • Dept: {emp.department}</p>
                <p className="text-[10px] text-slate-500">Joined: {emp.joinDate} • Current month attendance: <span className="text-emerald-550 dark:text-emerald-400 font-semibold">{emp.attendanceDays} days</span></p>
              </div>
              <div className="text-right space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 block">৳ {emp.salary.toLocaleString()} <span className="text-[9px] text-slate-500">/ mo</span></span>
                <button 
                  onClick={() => handlePaySalary(emp)}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-[10px]"
                >
                  Pay Salary
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
