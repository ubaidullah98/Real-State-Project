import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Customer, Plot, Booking, Transaction } from '../types';
import { formatPKR, formatDate } from '../lib/utils';
import { exportCustomerStatementPdf } from '../lib/pdfExport';
import { exportCustomerLedgerToExcel } from '../lib/excelExport';
import {
  Users,
  UserPlus,
  Search,
  Download,
  FileText,
  Phone,
  CreditCard,
  Building,
  Edit,
  Trash2,
  X,
  ExternalLink,
  Printer,
} from 'lucide-react';

interface CustomersPageProps {
  selectedCustomer?: Customer | null;
  onClearSelectedCustomer?: () => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  selectedCustomer: initialSelected,
  onClearSelectedCustomer,
}) => {
  const { customers, plots, bookings, transactions, activeProject, createCustomer, updateCustomer, deleteCustomer } =
    useProjects();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [inspectCustomer, setInspectCustomer] = useState<Customer | null>(initialSelected || null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.cnic.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setFullName('');
    setFatherName('');
    setCnic('');
    setPhone('+92 300 ');
    setWhatsapp('+92 300 ');
    setAddress('Karachi, Pakistan');
    setEmail('');
    setErrorMsg('');
    setShowAddModal(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFullName(c.fullName);
    setFatherName(c.fatherName);
    setCnic(c.cnic);
    setPhone(c.phone);
    setWhatsapp(c.whatsapp);
    setAddress(c.address);
    setEmail(c.email || '');
    setErrorMsg('');
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !cnic.trim() || !phone.trim()) {
      setErrorMsg('Full Name, CNIC, and Phone Number are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, {
          fullName,
          fatherName,
          cnic,
          phone,
          whatsapp: whatsapp || phone,
          address,
          email,
        });
        setEditingCustomer(null);
      } else {
        await createCustomer({
          fullName,
          fatherName,
          cnic,
          phone,
          whatsapp: whatsapp || phone,
          address,
          email,
          registrationDate: new Date().toISOString().split('T')[0],
          assignedProjectIds: [activeProject?.id || 'project-al-basit-residency'],
          assignedPlotIds: [],
        });
        setShowAddModal(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (c: Customer) => {
    const hasBookings = bookings.some((b) => b.customerId === c.id);
    if (hasBookings) {
      alert('This customer has active bookings or purchased plots and cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to delete customer ${c.fullName}?`)) return;
    try {
      await deleteCustomer(c.id);
    } catch (err: any) {
      alert(err.message || 'Error deleting customer');
    }
  };

  // Inspect customer financial data
  const customerBookings = bookings.filter((b) => b.customerId === inspectCustomer?.id);
  const customerPlots = plots.filter((p) => inspectCustomer?.assignedPlotIds?.includes(p.id) || customerBookings.some((b) => b.plotId === p.id));
  const customerTxns = transactions.filter((t) => t.customerId === inspectCustomer?.id);
  const totalValue = customerBookings.reduce((sum, b) => sum + b.totalPlotPrice, 0);
  const totalPaid = customerBookings.reduce((sum, b) => sum + b.totalReceived, 0);
  const totalBalance = customerBookings.reduce((sum, b) => sum + b.remainingBalance, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Customer Directory & Account Profiles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered buyers, multi-plot investors, CNIC verification, and payment ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCustomerLedgerToExcel(customers, bookings)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Register Customer
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, CNIC, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
          />
        </div>

        <span className="text-slate-500 dark:text-slate-400">
          Total Registered Customers: <strong className="text-slate-900 dark:text-white">{filteredCustomers.length}</strong>
        </span>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider">Customer Name</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">CNIC Number</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Phone & WhatsApp</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Owned Plots</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Registered</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
              {filteredCustomers.map((cust) => {
                const ownedCount = bookings.filter((b) => b.customerId === cust.id).length;

                return (
                  <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{cust.fullName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">S/O: {cust.fatherName || '-'}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-700 dark:text-slate-200">{cust.cnic}</td>
                    <td className="p-3.5">
                      <div className="text-slate-900 dark:text-white font-medium">{cust.phone}</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        WA: {cust.whatsapp || cust.phone}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full font-bold">
                        {ownedCount} Plots
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">{formatDate(cust.registrationDate)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectCustomer(cust)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          Profile →
                        </button>
                        <button
                          onClick={() => openEditModal(cust)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                          title="Edit Customer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(cust)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/15 dark:hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Customer Profile Side Drawer */}
      {inspectCustomer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700/80 shadow-2xl flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200">
          <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{inspectCustomer.fullName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">CNIC: {inspectCustomer.cnic}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportCustomerStatementPdf(inspectCustomer, customerPlots, customerBookings, customerTxns)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Statement PDF
              </button>
              <button
                onClick={() => setInspectCustomer(null)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* Financial Overview */}
            <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">TOTAL PURCHASED</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">{formatPKR(totalValue)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">TOTAL PAID</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{formatPKR(totalPaid)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">OUTSTANDING</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">{formatPKR(totalBalance)}</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] block">Contact Details</span>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Father's Name:</span>
                <span className="text-slate-800 dark:text-slate-200">{inspectCustomer.fatherName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                <span className="text-slate-800 dark:text-slate-200">{inspectCustomer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">WhatsApp:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{inspectCustomer.whatsapp || inspectCustomer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Address:</span>
                <span className="text-slate-800 dark:text-slate-200 text-right max-w-[240px] truncate">{inspectCustomer.address}</span>
              </div>
            </div>

            {/* Purchased Plots */}
            <div>
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] block mb-2">
                Purchased Plots ({customerPlots.length})
              </span>
              <div className="space-y-2">
                {customerPlots.map((p) => {
                  const b = bookings.find((bk) => bk.plotId === p.id);
                  return (
                    <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Plot {p.plotNumber} ({p.blockNumber})</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{p.plotSize} • {formatPKR(p.totalPlotPrice)}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">{formatPKR(b?.totalReceived || 0)} Paid</span>
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Bal: {formatPKR(b?.remainingBalance || 0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Transactions Ledger */}
            <div>
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] block mb-2">
                Transaction History ({customerTxns.length})
              </span>
              <div className="space-y-2">
                {customerTxns.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{t.receiptNumber}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{formatDate(t.paymentDate)} • {t.paymentMethod.toUpperCase()}</div>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatPKR(t.amountReceived)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {(showAddModal || editingCustomer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                {editingCustomer ? 'Edit Customer' : 'Register New Customer'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCustomer(null);
                }}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Mehmood"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Father's Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mehmood Hassan"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">CNIC Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="42101-1234567-1"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  placeholder="+92 300 1234567"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. House 42, Block 4, Gulshan-e-Iqbal, Karachi"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-colors"
                >
                  {isSubmitting ? 'Saving...' : editingCustomer ? 'Update Profile' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
