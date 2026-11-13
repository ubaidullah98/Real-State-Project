import React, { useState } from 'react';
import { Plot, Customer, Booking, Installment, PaymentMethod, Transaction } from '../../types';
import { formatPKR, formatDate } from '../../lib/utils';
import { useProjects } from '../../context/ProjectContext';
import confetti from 'canvas-confetti';
import { DollarSign, CheckCircle2, CreditCard, X, Calendar, FileText } from 'lucide-react';

interface PaymentModalProps {
  initialPlot?: Plot;
  initialInstallment?: Installment;
  onClose: () => void;
  onPaymentSuccess: (txn: Transaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  initialPlot,
  initialInstallment,
  onClose,
  onPaymentSuccess,
}) => {
  const { activeProject, plots, customers, bookings, installments, recordPayment } = useProjects();

  const [selectedPlotId, setSelectedPlotId] = useState<string>(initialPlot?.id || initialInstallment?.plotId || '');
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string>(initialInstallment?.id || '');

  const plot = plots.find((p) => p.id === selectedPlotId) || initialPlot;
  const booking = bookings.find((b) => b.plotId === selectedPlotId);
  const customer = customers.find((c) => c.id === (booking?.customerId || plot?.customerId));

  const plotInstallments = installments.filter((i) => i.plotId === selectedPlotId);
  const targetInstallment = installments.find((i) => i.id === selectedInstallmentId);

  const defaultAmount = targetInstallment
    ? Math.max(0, targetInstallment.amountDue - targetInstallment.amountPaid)
    : booking?.installmentAmount || 54000;

  const [amountReceived, setAmountReceived] = useState<number>(defaultAmount);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plot) {
      setErrorMsg('Please select a plot.');
      return;
    }
    if (!booking) {
      setErrorMsg('No active booking found for this plot. Book the plot first.');
      return;
    }
    if (!customer) {
      setErrorMsg('Customer profile is missing.');
      return;
    }
    if (amountReceived <= 0) {
      setErrorMsg('Payment amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const txn = await recordPayment({
        projectId: plot.projectId || activeProject?.id || 'project-al-basit-residency',
        plotId: plot.id,
        customerId: customer.id,
        bookingId: booking.id,
        installmentId: selectedInstallmentId || undefined,
        amountReceived,
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber || 'Counter Cash Receipt',
        remarks,
      });

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
      });

      onPaymentSuccess(txn);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording payment transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Collect Payment & Generate Receipt</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{activeProject?.name || 'Al-Basit Residency'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCollectPayment} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Plot & Customer Selection */}
          <div className="space-y-1">
            <label className="text-slate-700 dark:text-slate-300 font-semibold block">Select Plot / Booking</label>
            <select
              value={selectedPlotId}
              onChange={(e) => {
                setSelectedPlotId(e.target.value);
                const b = bookings.find((bk) => bk.plotId === e.target.value);
                if (b) setAmountReceived(b.installmentAmount);
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:border-emerald-500"
            >
              <option value="">-- Choose Booked Plot --</option>
              {plots
                .filter((p) => p.status !== 'available')
                .map((p) => {
                  const b = bookings.find((bk) => bk.plotId === p.id);
                  const cust = customers.find((c) => c.id === b?.customerId);
                  return (
                    <option key={p.id} value={p.id}>
                      Plot {p.plotNumber} ({p.blockNumber}) - {cust?.fullName || 'Booked'} (Bal: {formatPKR(b?.remainingBalance)})
                    </option>
                  );
                })}
            </select>
          </div>

          {/* Customer & Balance Overview */}
          {customer && booking && (
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Customer:</span>
                <span className="text-slate-900 dark:text-white font-semibold">{customer.fullName} ({customer.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Price:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{formatPKR(booking.totalPlotPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Paid to Date:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatPKR(booking.totalReceived)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Current Remaining Balance:</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">{formatPKR(booking.remainingBalance)}</span>
              </div>
            </div>
          )}

          {/* Installment Association (Optional) */}
          {plotInstallments.length > 0 && (
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold block">Specific Installment (Optional)</label>
              <select
                value={selectedInstallmentId}
                onChange={(e) => {
                  setSelectedInstallmentId(e.target.value);
                  const inst = plotInstallments.find((i) => i.id === e.target.value);
                  if (inst) setAmountReceived(inst.amountDue - inst.amountPaid);
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:border-emerald-500"
              >
                <option value="">Auto-Settle Earliest Due Installment</option>
                {plotInstallments.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    Installment #{inst.installmentNumber} (Due: {formatDate(inst.dueDate)}) - {formatPKR(inst.amountDue)} [{inst.status.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount Received Input */}
          <div className="space-y-1">
            <label className="text-slate-700 dark:text-slate-300 font-semibold block">Amount Received (PKR) *</label>
            <input
              type="number"
              min={1}
              value={amountReceived}
              onChange={(e) => setAmountReceived(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-black text-lg rounded-xl p-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Payment Method and Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs"
              >
                <option value="bank_transfer">Bank Transfer / Pay Order</option>
                <option value="cash">Cash Counter</option>
                <option value="online">Online Banking / Raast</option>
              </select>
            </div>
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs"
              />
            </div>
          </div>

          {/* Reference Number */}
          <div className="space-y-1">
            <label className="text-slate-700 dark:text-slate-300 font-semibold block">Cheque / Deposit Slip / Transaction Ref #</label>
            <input
              type="text"
              placeholder="e.g. HBL-FT-9918231 or Cheque # 882910"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:border-emerald-500"
            />
          </div>

          {/* Remarks */}
          <div className="space-y-1">
            <label className="text-slate-700 dark:text-slate-300 font-semibold block">Remarks / Notes</label>
            <input
              type="text"
              placeholder="e.g. Cleared via clearing branch"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:border-emerald-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : 'Record Payment & Generate Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
