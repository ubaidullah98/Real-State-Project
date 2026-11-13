import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Transaction, Plot, Customer } from '../types';
import { formatPKR, formatDate } from '../lib/utils';
import { exportPaymentReceiptPdf } from '../lib/pdfExport';
import { exportFinancialTransactionsToExcel } from '../lib/excelExport';
import { PaymentModal } from '../components/common/PaymentModal';
import { ReceiptModal } from '../components/common/ReceiptModal';
import {
  CreditCard,
  Plus,
  Search,
  Download,
  Printer,
  DollarSign,
  Building,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { activeProject, transactions, plots, customers } = useProjects();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTxnForReceipt, setSelectedTxnForReceipt] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter((t) => {
    const cust = customers.find((c) => c.id === t.customerId);
    const plot = plots.find((p) => p.id === t.plotId);

    const matchesSearch =
      t.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      cust?.fullName.toLowerCase().includes(search.toLowerCase()) ||
      plot?.plotNumber.toLowerCase().includes(search.toLowerCase()) ||
      (t.referenceNumber && t.referenceNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollected = filteredTransactions.reduce((sum, t) => sum + t.amountReceived, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Payment Collections & Receipt Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeProject?.name || 'Al-Basit Residency'} • Immutable financial transactions ledger, partial settlements, and verified receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportFinancialTransactionsToExcel(transactions, customers, plots)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Collect Payment
          </button>
        </div>
      </div>

      {/* Summary Box & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by receipt #, customer, plot, cheque..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs"
          >
            <option value="all">All Payment Methods</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash Desk</option>
            <option value="online">Online Banking / Raast</option>
          </select>

          <div className="bg-slate-50 dark:bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mr-2">Total Filtered:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{formatPKR(totalCollected)}</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider">Receipt Number</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Date</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Customer</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Plot</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Method & Reference</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Amount Received</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Remaining Bal</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
              {filteredTransactions.map((txn) => {
                const cust = customers.find((c) => c.id === txn.customerId);
                const pl = plots.find((p) => p.id === txn.plotId);

                return (
                  <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {txn.receiptNumber}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{formatDate(txn.paymentDate)}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{cust?.fullName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{cust?.cnic}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-amber-600 dark:text-amber-400">Plot {pl?.plotNumber || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{pl?.blockNumber}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="uppercase text-slate-800 dark:text-slate-200 font-semibold block">
                        {txn.paymentMethod.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {txn.referenceNumber || 'Cash Desk'}
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatPKR(txn.amountReceived)}
                    </td>
                    <td className="p-3.5 font-bold text-rose-600 dark:text-rose-400">
                      {formatPKR(txn.remainingBalance)}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTxnForReceipt(txn)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => exportPaymentReceiptPdf(txn, cust, pl, activeProject || undefined)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 rounded-lg transition-colors"
                          title="Download PDF Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={(txn) => {
            setShowPaymentModal(false);
            setSelectedTxnForReceipt(txn);
          }}
        />
      )}

      {/* Printable Receipt Modal */}
      {selectedTxnForReceipt && (
        <ReceiptModal
          transaction={selectedTxnForReceipt}
          customer={customers.find((c) => c.id === selectedTxnForReceipt.customerId)}
          plot={plots.find((p) => p.id === selectedTxnForReceipt.plotId)}
          project={activeProject || undefined}
          onClose={() => setSelectedTxnForReceipt(null)}
        />
      )}
    </div>
  );
};
