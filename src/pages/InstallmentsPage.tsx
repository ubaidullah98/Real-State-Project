import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Installment, InstallmentStatus, Plot, Customer } from '../types';
import { formatPKR, formatDate, getInstallmentStatusBadge } from '../lib/utils';
import { WhatsAppReminderModal } from '../components/common/WhatsAppReminderModal';
import { PaymentModal } from '../components/common/PaymentModal';
import {
  Clock,
  AlertTriangle,
  MessageSquare,
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const InstallmentsPage: React.FC = () => {
  const { activeProject, installments, plots, customers } = useProjects();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'upcoming' | 'paid'>('all');

  const [reminderInstallment, setReminderInstallment] = useState<Installment | null>(null);
  const [payInstallment, setPayInstallment] = useState<Installment | null>(null);

  // Status counts
  const overdueCount = installments.filter((i) => i.status === 'overdue').length;
  const pendingCount = installments.filter((i) => i.status === 'pending').length;
  const paidCount = installments.filter((i) => i.status === 'paid').length;

  const filteredInstallments = installments.filter((inst) => {
    const cust = customers.find((c) => c.id === inst.customerId);
    const plot = plots.find((p) => p.id === inst.plotId);

    const matchesSearch =
      cust?.fullName.toLowerCase().includes(search.toLowerCase()) ||
      plot?.plotNumber.toLowerCase().includes(search.toLowerCase()) ||
      plot?.blockNumber.toLowerCase().includes(search.toLowerCase()) ||
      String(inst.installmentNumber).includes(search);

    let matchesTab = true;
    if (activeTab === 'overdue') matchesTab = inst.status === 'overdue';
    else if (activeTab === 'upcoming') matchesTab = inst.status === 'pending';
    else if (activeTab === 'paid') matchesTab = inst.status === 'paid' || inst.status === 'partially_paid';

    let matchesStatus = statusFilter === 'all' || inst.status === statusFilter;

    return matchesSearch && matchesTab && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Installment Schedule & Overdue Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeProject?.name || 'Al-Basit Residency'} • Track due dates, partial payments, and dispatch direct WhatsApp payment reminders.
          </p>
        </div>

        {/* Tab Badges */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({installments.length})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'overdue' ? 'bg-rose-500 text-white' : 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Overdue ({overdueCount})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'upcoming' ? 'bg-amber-500 text-slate-950' : 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
            }`}
          >
            Upcoming ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'paid' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'
            }`}
          >
            Paid ({paidCount})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, plot #, installment #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
          />
        </div>

        <span className="text-slate-500 dark:text-slate-400">
          Showing <strong className="text-slate-900 dark:text-white">{filteredInstallments.length}</strong> installment schedules
        </span>
      </div>

      {/* Installments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider">Installment #</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Customer</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Plot</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Due Date</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Amount Due</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Amount Paid</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
              {filteredInstallments.map((inst) => {
                const cust = customers.find((c) => c.id === inst.customerId);
                const pl = plots.find((p) => p.id === inst.plotId);
                const badge = getInstallmentStatusBadge(inst.status);

                return (
                  <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white text-sm">
                      #{inst.installmentNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{cust?.fullName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{cust?.phone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-amber-600 dark:text-amber-400">Plot {pl?.plotNumber || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{pl?.blockNumber}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700 dark:text-slate-200">
                      {formatDate(inst.dueDate)}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{formatPKR(inst.amountDue)}</td>
                    <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400">{formatPKR(inst.amountPaid)}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inst.status !== 'paid' && (
                          <>
                            <button
                              onClick={() => setReminderInstallment(inst)}
                              className="px-2.5 py-1 bg-emerald-500/10 dark:bg-emerald-600/20 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Send WhatsApp Reminder"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </button>
                            <button
                              onClick={() => setPayInstallment(inst)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                            >
                              Pay Now
                            </button>
                          </>
                        )}
                        {inst.status === 'paid' && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Cleared
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Reminder Modal */}
      {reminderInstallment && (
        <WhatsAppReminderModal
          installment={reminderInstallment}
          customer={customers.find((c) => c.id === reminderInstallment.customerId)}
          plot={plots.find((p) => p.id === reminderInstallment.plotId)}
          project={activeProject || undefined}
          onClose={() => setReminderInstallment(null)}
        />
      )}

      {/* Payment Modal */}
      {payInstallment && (
        <PaymentModal
          initialPlot={plots.find((p) => p.id === payInstallment.plotId)}
          initialInstallment={payInstallment}
          onClose={() => setPayInstallment(null)}
          onPaymentSuccess={() => setPayInstallment(null)}
        />
      )}
    </div>
  );
};
