import React, { useState } from 'react';
import { Customer, Installment, Plot, Project } from '../../types';
import { formatPKR, formatDate } from '../../lib/utils';
import { MessageSquare, Send, X, Copy, Check } from 'lucide-react';

interface WhatsAppReminderModalProps {
  installment: Installment;
  customer?: Customer;
  plot?: Plot;
  project?: Project;
  onClose: () => void;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  installment,
  customer,
  plot,
  project,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const defaultMessage = `Dear ${customer?.fullName || 'Valued Customer'},

Your installment of ${formatPKR(installment.amountDue)} for Plot ${plot?.plotNumber || 'N/A'} (${plot?.blockNumber || 'Residential'}), ${project?.name || 'Al-Basit Residency'}, is due on ${formatDate(installment.dueDate)}.

Please contact Al-Basit Builders for payment details or online deposit verification.

Head Office: Main Super Highway (M-9), Karachi
Helpline: +92 300 8291044

Thank you.
Al-Basit Builders Management`;

  const [message, setMessage] = useState(defaultMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const rawPhone = customer?.whatsapp || customer?.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Send WhatsApp Reminder</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Installment #{installment.installmentNumber} • {customer?.fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Recipient Phone:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{customer?.whatsapp || customer?.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Due Amount:</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">{formatPKR(installment.amountDue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Due Date:</span>
              <span className="text-slate-900 dark:text-white">{formatDate(installment.dueDate)}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Personalized Message (Editable):
            </label>
            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <Send className="w-4 h-4" /> Open in WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
