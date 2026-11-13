import React from 'react';
import { Plot, Customer, Booking, Installment, Transaction, Project } from '../../types';
import { formatPKR, formatDate, getPlotStatusColor } from '../../lib/utils';
import { exportPaymentReceiptPdf, exportCustomerStatementPdf } from '../../lib/pdfExport';
import {
  X,
  User,
  CreditCard,
  FileText,
  DollarSign,
  Calendar,
  Phone,
  Home,
  CheckCircle,
  AlertCircle,
  Clock,
  Printer,
  PlusCircle,
} from 'lucide-react';

interface PlotDetailModalProps {
  plot: Plot;
  project: Project | undefined;
  customer: Customer | undefined;
  booking: Booking | undefined;
  installments: Installment[];
  transactions: Transaction[];
  onClose: () => void;
  onOpenPaymentModal: (plot: Plot) => void;
  onOpenBookingModal: (plot: Plot) => void;
  onOpenCustomerProfile: (customer: Customer) => void;
}

export const PlotDetailModal: React.FC<PlotDetailModalProps> = ({
  plot,
  project,
  customer,
  booking,
  installments,
  transactions,
  onClose,
  onOpenPaymentModal,
  onOpenBookingModal,
  onOpenCustomerProfile,
}) => {
  const statusMeta = getPlotStatusColor(plot.status);
  const plotInstallments = installments.filter((i) => i.plotId === plot.id);
  const plotTransactions = transactions.filter((t) => t.plotId === plot.id);

  const totalInstallments = plotInstallments.length || (booking?.numberOfInstallments || 0);
  const paidInstallments = plotInstallments.filter((i) => i.status === 'paid').length;
  const remainingInstallments = Math.max(0, totalInstallments - paidInstallments);
  const nextInstallment = plotInstallments.find((i) => i.status === 'pending' || i.status === 'overdue');

  const handleDownloadStatement = () => {
    if (customer) {
      exportCustomerStatementPdf(customer, [plot], booking ? [booking] : [], plotTransactions);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700/80 shadow-2xl flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200">
      {/* Header Bar */}
      <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Plot {plot.plotNumber}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                {statusMeta.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{plot.blockNumber} • {project?.name || 'Al-Basit Residency'}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Quick Spec Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Plot Size:</span>
            <span className="text-slate-900 dark:text-white font-semibold">{plot.plotSize}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Dimensions:</span>
            <span className="text-slate-900 dark:text-white font-semibold">{plot.dimensions}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Category:</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium capitalize">{plot.category.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Total Plot Value:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{formatPKR(plot.totalPlotPrice)}</span>
          </div>
        </div>

        {/* Customer Information Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Customer Information
            </h3>
            {customer && (
              <button
                onClick={() => onOpenCustomerProfile(customer)}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 font-medium"
              >
                View Full Profile →
              </button>
            )}
          </div>

          {customer ? (
            <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/60 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Name:</span>
                <span className="text-slate-900 dark:text-white font-semibold">{customer.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Father's Name:</span>
                <span className="text-slate-700 dark:text-slate-300">{customer.fatherName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">CNIC:</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">{customer.cnic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                <span className="text-slate-700 dark:text-slate-300">{customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Address:</span>
                <span className="text-slate-700 dark:text-slate-300 text-right max-w-[240px] truncate">{customer.address}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">This plot is currently unassigned.</p>
              <button
                onClick={() => onOpenBookingModal(plot)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
              >
                Book This Plot Now
              </button>
            </div>
          )}
        </div>

        {/* Financial Information Section */}
        {booking && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Financial Details & Installments
              </h3>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{booking.bookingNumber}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Down Payment:</span>
                <span className="text-slate-900 dark:text-white font-semibold">{formatPKR(booking.downPayment)}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Remaining Balance:</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">{formatPKR(booking.remainingBalance)}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Total Received:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatPKR(booking.totalReceived)}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Installment Count:</span>
                <span className="text-slate-700 dark:text-slate-200">{paidInstallments} of {totalInstallments} Paid</span>
              </div>
            </div>

            {nextInstallment && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div className="text-amber-700 dark:text-amber-300 font-semibold">Next Installment #{nextInstallment.installmentNumber}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Due: {formatDate(nextInstallment.dueDate)}</div>
                  </div>
                </div>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{formatPKR(nextInstallment.amountDue)}</span>
              </div>
            )}
          </div>
        )}

        {/* Recent Payment Transactions */}
        {plotTransactions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Payment History ({plotTransactions.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {plotTransactions.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="text-slate-900 dark:text-white font-semibold">{t.receiptNumber}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formatDate(t.paymentDate)} • {t.paymentMethod.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatPKR(t.amountReceived)}</span>
                    <button
                      onClick={() => exportPaymentReceiptPdf(t, customer, plot, project)}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="Download Official Receipt PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
        {booking ? (
          <button
            onClick={() => onOpenPaymentModal(plot)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Add Payment
          </button>
        ) : (
          <button
            onClick={() => onOpenBookingModal(plot)}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-colors"
          >
            <CheckCircle className="w-4 h-4" /> Book Plot
          </button>
        )}

        {customer && (
          <button
            onClick={handleDownloadStatement}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Download Full Customer Statement"
          >
            <FileText className="w-4 h-4" /> Statement
          </button>
        )}
      </div>
    </div>
  );
};
