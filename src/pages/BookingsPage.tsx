import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Booking, Plot, Customer } from '../types';
import { formatPKR, formatDate } from '../lib/utils';
import { BookingWizardModal } from '../components/common/BookingWizardModal';
import {
  FileCheck,
  Plus,
  Search,
  Building,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const BookingsPage: React.FC = () => {
  const { activeProject, bookings, plots, customers } = useProjects();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showWizard, setShowWizard] = useState(false);

  const filteredBookings = bookings.filter((b) => {
    const cust = customers.find((c) => c.id === b.customerId);
    const plot = plots.find((p) => p.id === b.plotId);

    const matchesSearch =
      b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      cust?.fullName.toLowerCase().includes(search.toLowerCase()) ||
      plot?.plotNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Plot Bookings & Sales Contracts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeProject?.name || 'Al-Basit Residency'} • Down payment agreements, payment plans, and installment schedules.
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Plot Booking
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by booking #, customer, plot #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs"
          >
            <option value="all">All Bookings ({bookings.length})</option>
            <option value="active">Active Plan</option>
            <option value="completed">Fully Paid</option>
          </select>
          <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Showing <strong className="text-slate-900 dark:text-white">{filteredBookings.length}</strong> records
          </span>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider">Booking Number</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Customer</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Plot</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Total Value</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Down Payment</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Remaining Balance</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Schedule</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
              {filteredBookings.map((b) => {
                const cust = customers.find((c) => c.id === b.customerId);
                const pl = plots.find((p) => p.id === b.plotId);
                const isPaidOff = b.remainingBalance <= 0;

                return (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {b.bookingNumber}
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{formatDate(b.bookingDate)}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{cust?.fullName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{cust?.phone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-amber-600 dark:text-amber-400">Plot {pl?.plotNumber || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{pl?.blockNumber} • {pl?.plotSize}</div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{formatPKR(b.totalPlotPrice)}</td>
                    <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400">{formatPKR(b.downPayment)}</td>
                    <td className="p-3.5">
                      <span className={`font-bold ${isPaidOff ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatPKR(b.remainingBalance)}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-700 dark:text-slate-200 capitalize font-medium">{b.installmentFrequency}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {b.numberOfInstallments} × {formatPKR(b.installmentAmount)}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          isPaidOff
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {isPaidOff ? 'Completed' : 'Active Plan'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Wizard Modal */}
      {showWizard && (
        <BookingWizardModal
          onClose={() => setShowWizard(false)}
          onSuccess={() => setShowWizard(false)}
        />
      )}
    </div>
  );
};
