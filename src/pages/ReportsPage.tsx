import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { formatPKR, formatDate } from '../lib/utils';
import { exportPlotsToExcel, exportFinancialTransactionsToExcel, exportCustomerLedgerToExcel } from '../lib/excelExport';
import {
  BarChart3,
  Download,
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
  CreditCard,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { activeProject, plots, customers, bookings, transactions, installments } = useProjects();

  const [dateRange, setDateRange] = useState('all');
  const [reportType, setReportType] = useState<'sales' | 'collections' | 'outstanding'>('sales');

  const totalProjectValue = plots.reduce((sum, p) => sum + p.totalPlotPrice, 0);
  const totalSales = bookings.reduce((sum, b) => sum + b.totalPlotPrice, 0);
  const totalDownPayments = bookings.reduce((sum, b) => sum + b.downPayment, 0);
  const totalCollected = transactions.reduce((sum, t) => sum + t.amountReceived, 0);
  const totalOutstanding = bookings.reduce((sum, b) => sum + b.remainingBalance, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Executive Financial & Sales Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeProject?.name || 'Al-Basit Residency'} • Balance ledgers, collection audits, and accounting statements in Pakistani PKR.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportFinancialTransactionsToExcel(transactions, customers, plots)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Export Collections (.xlsx)
          </button>
          <button
            onClick={() => exportPlotsToExcel(plots, activeProject || undefined)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Export Inventory (.xlsx)
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      {/* Top 4 Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg">
          <div className="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider mb-1">Total Booked Sales</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{formatPKR(totalSales)}</div>
          <div className="text-[10px] text-slate-500 mt-1">{bookings.length} Confirmed Sales Contracts</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg">
          <div className="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider mb-1">Down Payments Received</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{formatPKR(totalDownPayments)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Average 25% booking token</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg">
          <div className="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider mb-1">Total Realized Revenue</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatPKR(totalCollected)}</div>
          <div className="text-[10px] text-slate-500 mt-1">{transactions.length} Verified Bank & Cash Receipts</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg">
          <div className="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider mb-1">Outstanding Receivables</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400">{formatPKR(totalOutstanding)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Across ongoing installment plans</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-4">
        <button
          onClick={() => setReportType('sales')}
          className={`pb-3 transition-colors ${
            reportType === 'sales'
              ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Customer Outstanding Balances ({bookings.length})
        </button>
        <button
          onClick={() => setReportType('collections')}
          className={`pb-3 transition-colors ${
            reportType === 'collections'
              ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Payment Collections Audit ({transactions.length})
        </button>
      </div>

      {/* Report Table 1: Customer Outstanding Balances */}
      {reportType === 'sales' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Customer</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">CNIC & Phone</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Plot #</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Plot Value</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Down Payment</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Total Received</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
                {bookings.map((b) => {
                  const cust = customers.find((c) => c.id === b.customerId);
                  const pl = plots.find((p) => p.id === b.plotId);
                  const isPaid = b.remainingBalance <= 0;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white text-sm">{cust?.fullName || 'N/A'}</td>
                      <td className="p-3.5">
                        <div className="font-mono text-slate-700 dark:text-slate-200">{cust?.cnic}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{cust?.phone}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-amber-600 dark:text-amber-400">Plot {pl?.plotNumber}</span>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{pl?.blockNumber}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{formatPKR(b.totalPlotPrice)}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{formatPKR(b.downPayment)}</td>
                      <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">{formatPKR(b.totalReceived)}</td>
                      <td className="p-3.5">
                        <span className={`font-black ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {formatPKR(b.remainingBalance)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Table 2: Payment Collections Audit */}
      {reportType === 'collections' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Receipt #</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Date</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Customer</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Plot</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Method</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Amount</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
                {transactions.map((t) => {
                  const cust = customers.find((c) => c.id === t.customerId);
                  const pl = plots.find((p) => p.id === t.plotId);

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{t.receiptNumber}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{formatDate(t.paymentDate)}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{cust?.fullName || 'N/A'}</td>
                      <td className="p-3.5 text-amber-600 dark:text-amber-400 font-semibold">Plot {pl?.plotNumber}</td>
                      <td className="p-3.5 uppercase font-medium text-slate-600 dark:text-slate-300">{t.paymentMethod.replace('_', ' ')}</td>
                      <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400">{formatPKR(t.amountReceived)}</td>
                      <td className="p-3.5 font-bold text-rose-600 dark:text-rose-400">{formatPKR(t.remainingBalance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
