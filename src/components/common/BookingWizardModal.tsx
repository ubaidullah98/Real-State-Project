import React, { useState } from 'react';
import { Plot, Customer, Project, InstallmentFrequency } from '../../types';
import { formatPKR, formatDate } from '../../lib/utils';
import { useProjects } from '../../context/ProjectContext';
import confetti from 'canvas-confetti';
import { CheckCircle2, UserPlus, DollarSign, Calendar, Calculator, X, Sparkles } from 'lucide-react';

interface BookingWizardModalProps {
  initialPlot?: Plot;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  initialPlot,
  onClose,
  onSuccess,
}) => {
  const { activeProject, plots, customers, createCustomer, createBooking } = useProjects();

  const [selectedPlotId, setSelectedPlotId] = useState<string>(initialPlot?.id || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // New customer inline mode
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustFather, setNewCustFather] = useState('');
  const [newCustCnic, setNewCustCnic] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Financial fields
  const currentPlot = plots.find((p) => p.id === selectedPlotId) || initialPlot;
  const defaultPrice = currentPlot?.totalPlotPrice || 2160000;
  const [totalPrice, setTotalPrice] = useState<number>(defaultPrice);
  const [downPayment, setDownPayment] = useState<number>(Math.round(defaultPrice * 0.25));
  const [frequency, setFrequency] = useState<InstallmentFrequency>('monthly');
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(30);
  const [firstInstallmentDate, setFirstInstallmentDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Derived financial calculation
  const remainingBalance = Math.max(0, totalPrice - downPayment);
  const installmentAmount = numberOfInstallments > 0 ? Math.round(remainingBalance / numberOfInstallments) : 0;

  // Available plots for booking
  const availablePlots = plots.filter((p) => p.status === 'available' || p.id === initialPlot?.id);

  const handleCreateNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustCnic || !newCustPhone) {
      setErrorMsg('Please fill in Customer Full Name, CNIC, and Phone.');
      return;
    }
    try {
      const created = await createCustomer({
        fullName: newCustName,
        fatherName: newCustFather,
        cnic: newCustCnic,
        phone: newCustPhone,
        whatsapp: newCustPhone,
        address: newCustAddress,
      });
      setSelectedCustomerId(created.id);
      setIsCreatingCustomer(false);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating customer');
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedPlotId) {
      setErrorMsg('Please select a plot.');
      return;
    }
    if (!selectedCustomerId) {
      setErrorMsg('Please select or register a customer.');
      return;
    }
    if (downPayment <= 0 || downPayment > totalPrice) {
      setErrorMsg('Down payment must be greater than 0 and less than or equal to total price.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await createBooking({
        projectId: activeProject?.id || 'project-al-basit-residency',
        plotId: selectedPlotId,
        customerId: selectedCustomerId,
        totalPlotPrice: totalPrice,
        downPayment,
        installmentFrequency: frequency,
        installmentAmount,
        numberOfInstallments,
        firstInstallmentDate,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Book Plot & Setup Payment Plan</h2>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Plot Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">Select Plot to Book</label>
            <select
              value={selectedPlotId}
              onChange={(e) => {
                setSelectedPlotId(e.target.value);
                const pl = plots.find((p) => p.id === e.target.value);
                if (pl) {
                  setTotalPrice(pl.totalPlotPrice);
                  setDownPayment(Math.round(pl.totalPlotPrice * 0.25));
                }
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:border-amber-500 dark:focus:border-amber-400"
            >
              <option value="">-- Choose an Available Plot --</option>
              {availablePlots.map((p) => (
                <option key={p.id} value={p.id}>
                  Plot {p.plotNumber} ({p.blockNumber}) - {p.plotSize} - {formatPKR(p.totalPlotPrice)}
                </option>
              ))}
            </select>
          </div>

          {/* Section 2: Customer Selection / Inline Registration */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Assign Customer</label>
              <button
                type="button"
                onClick={() => setIsCreatingCustomer(!isCreatingCustomer)}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 text-[11px] font-medium flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {isCreatingCustomer ? 'Select Existing' : '+ Register New Customer'}
              </button>
            </div>

            {isCreatingCustomer ? (
              <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="font-bold text-slate-900 dark:text-white block">New Customer Registration</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">Full Name *</span>
                    <input
                      type="text"
                      placeholder="e.g. Tariq Mehmood"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">Father's Name</span>
                    <input
                      type="text"
                      placeholder="e.g. Mehmood Hassan"
                      value={newCustFather}
                      onChange={(e) => setNewCustFather(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">CNIC *</span>
                    <input
                      type="text"
                      placeholder="42101-1234567-1"
                      value={newCustCnic}
                      onChange={(e) => setNewCustCnic(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">Phone / WhatsApp *</span>
                    <input
                      type="text"
                      placeholder="+92 300 1234567"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">Residential Address</span>
                  <input
                    type="text"
                    placeholder="e.g. DHA Phase 6, Karachi"
                    value={newCustAddress}
                    onChange={(e) => setNewCustAddress(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateNewCustomer}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Save & Select Customer
                </button>
              </div>
            ) : (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:border-amber-500 dark:focus:border-amber-400"
              >
                <option value="">-- Choose Registered Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.cnic}) • {c.phone}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Section 3: Financial Terms & Schedule */}
          <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Financial Plan & Installment Schedule
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Total Agreed Plot Price (PKR)</span>
                <input
                  type="number"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 text-xs font-semibold"
                />
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Down Payment / Token (PKR)</span>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 rounded-lg p-2 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Installment Frequency</span>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as InstallmentFrequency)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 text-xs"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="half-yearly">Half-Yearly</option>
                </select>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block mb-1">No. of Installments</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={numberOfInstallments}
                  onChange={(e) => setNumberOfInstallments(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block mb-1">First Installment Due</span>
                <input
                  type="date"
                  value={firstInstallmentDate}
                  onChange={(e) => setFirstInstallmentDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            {/* Calculated Plan Preview Badge */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Remaining Balance</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">{formatPKR(remainingBalance)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Each Installment</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{formatPKR(installmentAmount)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Tenure</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  {numberOfInstallments} {frequency} installments
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Processing...' : 'Confirm Booking & Issue Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};
