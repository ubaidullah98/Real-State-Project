import { PlotStatus, InstallmentStatus } from '../types';

export function formatPKR(amount: number | null | undefined): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'PKR 0';
  }
  const formatted = Math.round(amount).toLocaleString('en-PK');
  return `PKR ${formatted}`;
}

export function formatPakistaniWords(amount: number): string {
  if (amount >= 10000000) {
    const crores = (amount / 10000000).toFixed(2);
    return `${crores} Crore`;
  }
  if (amount >= 100000) {
    const lacs = (amount / 100000).toFixed(2);
    return `${lacs} Lac`;
  }
  if (amount >= 1000) {
    const thousands = (amount / 1000).toFixed(1);
    return `${thousands} Thousand`;
  }
  return `${amount}`;
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function generateReceiptNumber(seq: number = Math.floor(1000 + Math.random() * 9000)): string {
  const year = new Date().getFullYear();
  return `ABR-REC-${year}-${String(seq).padStart(4, '0')}`;
}

export function generateBookingNumber(seq: number = Math.floor(100 + Math.random() * 900)): string {
  const year = new Date().getFullYear();
  return `ABR-BKG-${year}-${String(seq).padStart(4, '0')}`;
}

export function getPlotStatusColor(status: PlotStatus): {
  bg: string;
  text: string;
  border: string;
  hex: number;
  label: string;
} {
  switch (status) {
    case 'available':
      return {
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/30',
        hex: 0x10b981, // Emerald Green
        label: 'Available',
      };
    case 'sold':
      return {
        bg: 'bg-rose-500/15',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-500/30',
        hex: 0xef4444, // Red
        label: 'Sold',
      };
    case 'reserved':
      return {
        bg: 'bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-500/30',
        hex: 0xf59e0b, // Yellow/Amber
        label: 'Reserved',
      };
    case 'installments_in_progress':
      return {
        bg: 'bg-blue-500/15',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-500/30',
        hex: 0x3b82f6, // Blue
        label: 'Installments in Progress',
      };
    case 'overdue':
      return {
        bg: 'bg-orange-500/15',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-500/30',
        hex: 0xf97316, // Orange
        label: 'Payment Overdue',
      };
    default:
      return {
        bg: 'bg-slate-500/15',
        text: 'text-slate-700 dark:text-slate-400',
        border: 'border-slate-500/30',
        hex: 0x64748b,
        label: status,
      };
  }
}

export function getInstallmentStatusBadge(status: InstallmentStatus): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (status) {
    case 'paid':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/30', label: 'Paid' };
    case 'partially_paid':
      return { bg: 'bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-500/30', label: 'Partially Paid' };
    case 'pending':
      return { bg: 'bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500/30', label: 'Pending' };
    case 'overdue':
      return { bg: 'bg-rose-500/15', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-500/30', label: 'Overdue' };
    default:
      return { bg: 'bg-slate-500/15', text: 'text-slate-700 dark:text-slate-400', border: 'border-slate-500/30', label: status };
  }
}
