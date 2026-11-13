import React, { useState, useMemo } from 'react';
import { useProjects } from '../context/ProjectContext';
import { formatPKR, formatDate } from '../lib/utils';
import { exportPaymentReceiptPdf } from '../lib/pdfExport';
import { Plot, Installment } from '../types';
import {
  Building,
  Grid3X3,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  CreditCard,
  Printer,
  MessageSquare,
  Sparkles,
  Layers,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: any) => void;
  onSelectPlot: (plot: Plot) => void;
  onOpenWhatsApp: (inst: Installment) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenWhatsApp,
}) => {
  const {
    projects,
    activeProject,
    allPlots,
    customers,
    bookings,
    installments,
    transactions,
  } = useProjects();

  const [filterProjectId, setFilterProjectId] = useState<string>('all');

  const filteredPlots = useMemo(() => {
    if (filterProjectId === 'all') return allPlots;
    return allPlots.filter((p) => p.projectId === filterProjectId);
  }, [allPlots, filterProjectId]);

  const filteredBookings = useMemo(() => {
    if (filterProjectId === 'all') return bookings;
    return bookings.filter((b) => b.projectId === filterProjectId);
  }, [bookings, filterProjectId]);

  const filteredInstallments = useMemo(() => {
    if (filterProjectId === 'all') return installments;
    return installments.filter((i) => i.projectId === filterProjectId);
  }, [installments, filterProjectId]);

  const filteredTransactions = useMemo(() => {
    if (filterProjectId === 'all') return transactions;
    return transactions.filter((t) => t.projectId === filterProjectId);
  }, [transactions, filterProjectId]);

  const totalPlots = filteredPlots.length;
  const availablePlots = filteredPlots.filter((p) => p.status === 'available').length;
  const soldPlots = filteredPlots.filter((p) => p.status === 'sold').length;
  const reservedPlots = filteredPlots.filter((p) => p.status === 'reserved').length;
  const inProgressPlots = filteredPlots.filter((p) => p.status === 'installments_in_progress').length;
  const overduePlots = filteredPlots.filter((p) => p.status === 'overdue').length;

  const totalProjectValue = filteredPlots.reduce((sum, p) => sum + p.totalPlotPrice, 0);
  const totalSales = filteredBookings.reduce((sum, b) => sum + b.totalPlotPrice, 0);
  const totalPaymentsReceived = filteredTransactions.reduce((sum, t) => sum + t.amountReceived, 0);
  const totalOutstanding = filteredBookings.reduce((sum, b) => sum + b.remainingBalance, 0);

  const upcomingInstallments = filteredInstallments.filter((i) => i.status === 'pending');
  const overdueInstallments = filteredInstallments.filter((i) => i.status === 'overdue');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Project Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Executive Real Estate Dashboard
            </h1>
            <span className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Live Firestore Data
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Financial analytics, plot inventory management, and installment tracking for Al-Basit Builders.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
            className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
          >
            <option value="all">All Projects Combined ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => onNavigate('plot-map')}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" /> Open 3D Map
          </button>
        </div>
      </div>

      {/* Overdue Alert Banner if any */}
      {overdueInstallments.length > 0 && (
        <div className="bg-rose-50 dark:bg-gradient-to-r dark:from-rose-950/60 dark:via-slate-900 dark:to-rose-950/60 border border-rose-200 dark:border-rose-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm dark:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                Attention Required: {overdueInstallments.length} Overdue Installments Detected
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300">
                Total Overdue Amount:{' '}
                <span className="font-bold text-rose-700 dark:text-rose-300">
                  {formatPKR(overdueInstallments.reduce((sum, i) => sum + (i.amountDue - i.amountPaid), 0))}
                </span>
                . Direct WhatsApp reminders can be dispatched immediately.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('installments')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-colors whitespace-nowrap"
          >
            View Overdue Ledger →
          </button>
        </div>
      )}

      {/* Key Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Project Value</span>
            <Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{formatPKR(totalProjectValue)}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Across all planned plots</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Booked Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">{formatPKR(totalSales)}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{filteredBookings.length} Active Bookings</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Payments Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">{formatPKR(totalPaymentsReceived)}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{filteredTransactions.length} Realized Receipts</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Outstanding Balance</span>
            <CreditCard className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">{formatPKR(totalOutstanding)}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Due over installment tenures</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Society Plots</span>
            <Grid3X3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{totalPlots}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Block A, B, and C</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Available for Sale</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{availablePlots}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Ready for instant booking</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sold & In Progress</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">{soldPlots + inProgressPlots}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{soldPlots} Sold • {inProgressPlots} In Installments</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Reserved Plots</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{reservedPlots}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Holding for token clearance</div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plot Status Inventory Progress Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Plot Availability Breakdown
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">{totalPlots} Total Units</span>
            </div>

            <div className="w-full h-4 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden flex mb-4 border border-slate-200 dark:border-slate-800">
              <div
                style={{ width: `${totalPlots > 0 ? (availablePlots / totalPlots) * 100 : 0}%` }}
                className="bg-emerald-500 transition-all"
                title={`Available: ${availablePlots}`}
              />
              <div
                style={{ width: `${totalPlots > 0 ? (reservedPlots / totalPlots) * 100 : 0}%` }}
                className="bg-amber-500 transition-all"
                title={`Reserved: ${reservedPlots}`}
              />
              <div
                style={{ width: `${totalPlots > 0 ? (inProgressPlots / totalPlots) * 100 : 0}%` }}
                className="bg-blue-500 transition-all"
                title={`Installments: ${inProgressPlots}`}
              />
              <div
                style={{ width: `${totalPlots > 0 ? (overduePlots / totalPlots) * 100 : 0}%` }}
                className="bg-orange-500 transition-all"
                title={`Overdue: ${overduePlots}`}
              />
              <div
                style={{ width: `${totalPlots > 0 ? (soldPlots / totalPlots) * 100 : 0}%` }}
                className="bg-rose-500 transition-all"
                title={`Sold: ${soldPlots}`}
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-100 dark:border-transparent">
                <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available Plots
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {availablePlots} ({totalPlots > 0 ? Math.round((availablePlots / totalPlots) * 100) : 0}%)
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-100 dark:border-transparent">
                <span className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Reserved Plots
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {reservedPlots} ({totalPlots > 0 ? Math.round((reservedPlots / totalPlots) * 100) : 0}%)
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-100 dark:border-transparent">
                <span className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Active Installments
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {inProgressPlots} ({totalPlots > 0 ? Math.round((inProgressPlots / totalPlots) * 100) : 0}%)
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-100 dark:border-transparent">
                <span className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Payment Overdue
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {overduePlots} ({totalPlots > 0 ? Math.round((overduePlots / totalPlots) * 100) : 0}%)
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-100 dark:border-transparent">
                <span className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Fully Sold
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {soldPlots} ({totalPlots > 0 ? Math.round((soldPlots / totalPlots) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('plot-map')}
            className="w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            Launch Interactive 3D Society View →
          </button>
        </div>

        {/* Financial Flow & Revenue Collection */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Financial Capital Overview
              </h3>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold font-mono">Pakistani PKR</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Total Booked Sales</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatPKR(totalSales)}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    style={{ width: `${totalProjectValue > 0 ? Math.min(100, (totalSales / totalProjectValue) * 100) : 0}%` }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <div className="text-[10px] text-slate-500 text-right mt-0.5">
                  {totalProjectValue > 0 ? Math.round((totalSales / totalProjectValue) * 100) : 0}% of Total Project Capacity
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Collected Cash & Bank Receipts</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatPKR(totalPaymentsReceived)}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    style={{ width: `${totalSales > 0 ? Math.min(100, (totalPaymentsReceived / totalSales) * 100) : 0}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
                <div className="text-[10px] text-slate-500 text-right mt-0.5">
                  {totalSales > 0 ? Math.round((totalPaymentsReceived / totalSales) * 100) : 0}% of Booked Sales Realized
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Outstanding Receivables:</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{formatPKR(totalOutstanding)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Pending Installment Count:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{upcomingInstallments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Overdue Installment Count:</span>
                  <span className="text-orange-600 dark:text-orange-400 font-bold">{overdueInstallments.length}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('reports')}
            className="w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            Export Comprehensive Financial Reports →
          </button>
        </div>

        {/* Quick Actions & Project Metadata */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Active Project Information
            </h3>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Project Name:</span>
                <span className="text-slate-900 dark:text-white font-bold">{activeProject?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Project Code:</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono font-semibold">{activeProject?.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Location:</span>
                <span className="text-slate-700 dark:text-slate-300 max-w-[160px] truncate">{activeProject?.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                <span className="text-emerald-700 dark:text-emerald-400 uppercase font-semibold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">
                  {activeProject?.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Plot Sizes Offered:</span>
                <span className="text-slate-700 dark:text-slate-300">{activeProject?.plotSizes}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('bookings')}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                + Create New Plot Booking
              </button>
              <button
                onClick={() => onNavigate('payments')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                + Collect Installment Payment
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
            Al-Basit Builders Enterprise System
          </div>
        </div>
      </div>

      {/* Two Column Table Layout: Recent Payments & Upcoming/Overdue Installments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Recent Payment Transactions
            </h3>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 font-semibold"
            >
              View All ({filteredTransactions.length}) →
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredTransactions.slice(0, 5).map((txn) => {
              const cust = customers.find((c) => c.id === txn.customerId);
              const pl = allPlots.find((p) => p.id === txn.plotId);

              return (
                <div
                  key={txn.id}
                  className="bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{txn.receiptNumber}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {pl ? `${pl.plotNumber} (${pl.blockNumber})` : 'Plot'}
                      </span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      {cust?.fullName || 'Customer'} • {formatDate(txn.paymentDate)} •{' '}
                      <span className="uppercase text-slate-700 dark:text-slate-300">{txn.paymentMethod.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                      {formatPKR(txn.amountReceived)}
                    </span>
                    <button
                      onClick={() => exportPaymentReceiptPdf(txn, cust, pl, activeProject || undefined)}
                      className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg border border-slate-200 dark:border-transparent transition-colors"
                      title="Download PDF Receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Pending & Overdue Installments
            </h3>
            <button
              onClick={() => onNavigate('installments')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 font-semibold"
            >
              Manage ({filteredInstallments.length}) →
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredInstallments
              .filter((i) => i.status === 'overdue' || i.status === 'pending')
              .slice(0, 5)
              .map((inst) => {
                const cust = customers.find((c) => c.id === inst.customerId);
                const pl = allPlots.find((p) => p.id === inst.plotId);
                const isOverdue = inst.status === 'overdue';

                return (
                  <div
                    key={inst.id}
                    className={`p-3 rounded-xl flex items-center justify-between text-xs border transition-colors ${
                      isOverdue
                        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-950'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Installment #{inst.installmentNumber}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isOverdue
                              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {isOverdue ? 'OVERDUE' : 'UPCOMING'}
                        </span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        {cust?.fullName || 'Customer'} • Plot {pl?.plotNumber} • Due: {formatDate(inst.dueDate)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-amber-600 dark:text-amber-400">
                        {formatPKR(inst.amountDue - inst.amountPaid)}
                      </span>
                      <button
                        onClick={() => onOpenWhatsApp(inst)}
                        className="px-2.5 py-1 bg-emerald-600/15 dark:bg-emerald-600/20 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                        title="Send WhatsApp Payment Reminder"
                      >
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
