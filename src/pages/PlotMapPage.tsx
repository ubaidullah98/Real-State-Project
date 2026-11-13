import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { ThreePlotMap } from '../components/map3d/ThreePlotMap';
import { MasterPlanPdfUploader } from '../components/map3d/MasterPlanPdfUploader';
import { PlotDetailModal } from '../components/map3d/PlotDetailModal';
import { BookingWizardModal } from '../components/common/BookingWizardModal';
import { PaymentModal } from '../components/common/PaymentModal';
import { ReceiptModal } from '../components/common/ReceiptModal';
import { Plot, Customer, ExtractedPlotLayout, Transaction } from '../types';
import { UploadCloud, HelpCircle } from 'lucide-react';

interface PlotMapPageProps {
  onOpenCustomerProfile: (customer: Customer) => void;
}

export const PlotMapPage: React.FC<PlotMapPageProps> = ({ onOpenCustomerProfile }) => {
  const { activeProject, plots, customers, bookings, installments, transactions, syncMasterPlanPlots } =
    useProjects();

  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [showPdfUploader, setShowPdfUploader] = useState<boolean>(false);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [createdTxn, setCreatedTxn] = useState<Transaction | null>(null);

  const selectedBooking = bookings.find((b) => b.plotId === selectedPlot?.id);
  const selectedCustomer = customers.find((c) => c.id === (selectedBooking?.customerId || selectedPlot?.customerId));

  const handleLayoutSaved = async (extracted: ExtractedPlotLayout[]) => {
    if (activeProject) {
      await syncMasterPlanPlots(activeProject.id, extracted);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Interactive 3D Property Master Plan
            </h1>
            <span className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Three.js PBR Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Explore {activeProject?.name || 'Al-Basit Residency'} plot layouts, roads, blocks, and live financial statuses in real-time 3D.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowPdfUploader(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            Upload PDF Master Plan
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="w-full">
        <ThreePlotMap
          plots={plots}
          onSelectPlot={(p) => setSelectedPlot(p)}
          selectedPlot={selectedPlot}
          projectName={activeProject?.name}
        />
      </div>

      {/* Helper Tips Card */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong className="text-slate-900 dark:text-white">Interaction Guide:</strong> Left-click and drag to rotate. Right-click and drag to pan. Scroll mouse wheel to zoom. Click any plot to open the full customer and installment panel.
          </span>
        </div>
        <span className="text-[11px] text-amber-700 dark:text-amber-400/90 font-medium whitespace-nowrap">
          {plots.length} Society Plots Rendered
        </span>
      </div>

      {/* Slide-in Plot Details Panel */}
      {selectedPlot && (
        <PlotDetailModal
          plot={selectedPlot}
          project={activeProject || undefined}
          customer={selectedCustomer}
          booking={selectedBooking}
          installments={installments}
          transactions={transactions}
          onClose={() => setSelectedPlot(null)}
          onOpenBookingModal={() => setShowBookingModal(true)}
          onOpenPaymentModal={() => setShowPaymentModal(true)}
          onOpenCustomerProfile={onOpenCustomerProfile}
        />
      )}

      {/* PDF Master Plan Upload and 10-Step Calibration Wizard */}
      {showPdfUploader && activeProject && (
        <MasterPlanPdfUploader
          project={activeProject}
          onLayoutSaved={handleLayoutSaved}
          onClose={() => setShowPdfUploader(false)}
        />
      )}

      {/* Plot Booking Wizard Modal */}
      {showBookingModal && (
        <BookingWizardModal
          initialPlot={selectedPlot || undefined}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            if (selectedPlot) {
              const updated = plots.find((p) => p.id === selectedPlot.id);
              if (updated) setSelectedPlot(updated);
            }
          }}
        />
      )}

      {/* Payment Collection Modal */}
      {showPaymentModal && (
        <PaymentModal
          initialPlot={selectedPlot || undefined}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={(txn) => {
            setShowPaymentModal(false);
            setCreatedTxn(txn);
          }}
        />
      )}

      {/* Generated Receipt Modal */}
      {createdTxn && (
        <ReceiptModal
          transaction={createdTxn}
          customer={customers.find((c) => c.id === createdTxn.customerId)}
          plot={plots.find((p) => p.id === createdTxn.plotId)}
          project={activeProject || undefined}
          onClose={() => setCreatedTxn(null)}
        />
      )}
    </div>
  );
};
