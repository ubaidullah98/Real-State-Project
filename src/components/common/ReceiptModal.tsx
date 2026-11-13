import React from 'react';
import { Transaction, Customer, Plot, Project } from '../../types';
import { formatPKR, formatDate } from '../../lib/utils';
import { exportPaymentReceiptPdf } from '../../lib/pdfExport';
import { Printer, Download, CheckCircle, X, Building2 } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction;
  customer?: Customer;
  plot?: Plot;
  project?: Project;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  customer,
  plot,
  project,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    exportPaymentReceiptPdf(transaction, customer, plot, project);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Actions Bar */}
        <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Payment Receipt Generated
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div className="p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 space-y-5 print:bg-white print:text-black">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 mb-2 border border-amber-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-wide">AL-BASIT BUILDERS</h2>
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              {project?.name || 'Al-Basit Residency'}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Official Payment Receipt & Financial Acknowledgement
            </p>
          </div>

          {/* Meta Line */}
          <div className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">RECEIPT NUMBER</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{transaction.receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">DATE</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(transaction.paymentDate)}</span>
            </div>
          </div>

          {/* Customer & Plot Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">CUSTOMER NAME</span>
              <span className="font-semibold text-slate-900 dark:text-white">{customer?.fullName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">CNIC NO</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{customer?.cnic || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">PLOT DETAILS</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {plot ? `${plot.plotNumber} (${plot.blockNumber})` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">PLOT SIZE</span>
              <span className="text-slate-800 dark:text-slate-200">{plot?.plotSize || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">PAYMENT METHOD</span>
              <span className="uppercase text-slate-800 dark:text-slate-200">{transaction.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">TRANSACTION / REF #</span>
              <span className="text-slate-800 dark:text-slate-200 font-mono">{transaction.referenceNumber || 'Desk Receipt'}</span>
            </div>
          </div>

          {/* Big Amount Received Box */}
          <div className="bg-amber-500/10 dark:bg-gradient-to-r dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-amber-500/40 p-4 rounded-xl text-center shadow-sm dark:shadow-lg">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 tracking-wider uppercase block mb-1">
              Amount Received
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatPKR(transaction.amountReceived)}
            </div>
          </div>

          {/* Balance Breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Previous Balance</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{formatPKR(transaction.previousBalance)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">This Payment</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatPKR(transaction.amountReceived)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Remaining Balance</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{formatPKR(transaction.remainingBalance)}</span>
            </div>
          </div>

          {/* Received By Signature Footer */}
          <div className="flex justify-between items-end pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">RECEIVED BY</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{transaction.receivedBy || 'Finance Desk'}</span>
            </div>
            <div className="text-right">
              <div className="w-32 border-b border-slate-400 dark:border-slate-600 mb-1" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Authorized Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
