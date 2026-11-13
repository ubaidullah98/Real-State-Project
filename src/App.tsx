/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { PlotMapPage } from './pages/PlotMapPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { PlotsPage } from './pages/PlotsPage';
import { CustomersPage } from './pages/CustomersPage';
import { BookingsPage } from './pages/BookingsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { InstallmentsPage } from './pages/InstallmentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ActivityLogsPage } from './pages/ActivityLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { WhatsAppReminderModal } from './components/common/WhatsAppReminderModal';
import { Customer, Installment } from './types';
import { Menu, X, Building2, ShieldCheck, Sun, Moon } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { loginWithGoogle, loginAsRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google Sign-In failed. You can also enter Demo Preview mode.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-sm"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-[#0B192C] dark:bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400 font-serif font-black text-2xl">
              AB
            </div>
          </div>
          <h1 className="text-xl font-black tracking-wide">
            AL-BASIT <span className="text-amber-600 dark:text-amber-400">BUILDERS</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real Estate Management & 3D Master Plan Visualization
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            {isLoading ? 'Signing in...' : 'Sign In with Google (Cloud Firestore)'}
          </button>

          <button
            onClick={() => loginAsRole('admin')}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Enter Demo Preview Workspace
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
          Authorized access for Al-Basit Builders management & finance personnel.
        </p>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Global modals state
  const [reminderInstallment, setReminderInstallment] = useState<Installment | null>(null);
  const [activeCustomerForProfile, setActiveCustomerForProfile] = useState<Customer | null>(null);

  const { plots, customers, activeProject } = useProjects();

  if (!currentUser) {
    return <LoginScreen />;
  }

  const handleGlobalSearchSelect = (type: string, id: string) => {
    if (type === 'plot') {
      setActiveTab('plot-map');
    } else if (type === 'customer') {
      const cust = customers.find((c) => c.id === id);
      if (cust) {
        setActiveCustomerForProfile(cust);
        setActiveTab('customers');
      }
    } else if (type === 'transaction') {
      setActiveTab('payments');
    }
  };

  const handleOpenCustomerProfile = (customer: Customer) => {
    setActiveCustomerForProfile(customer);
    setActiveTab('customers');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar onSearchSelect={handleGlobalSearchSelect} />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Hamburger Floating Button */}
        <div className="md:hidden fixed bottom-5 right-5 z-50">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-12 h-12 bg-amber-500 text-slate-950 rounded-full shadow-2xl flex items-center justify-center font-bold"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Page Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectPlot={() => setActiveTab('plot-map')}
              onOpenWhatsApp={(inst) => setReminderInstallment(inst)}
            />
          )}

          {activeTab === 'plot-map' && (
            <PlotMapPage onOpenCustomerProfile={handleOpenCustomerProfile} />
          )}

          {activeTab === 'projects' && <ProjectsPage />}

          {activeTab === 'plots' && <PlotsPage />}

          {activeTab === 'customers' && (
            <CustomersPage
              selectedCustomer={activeCustomerForProfile}
              onClearSelectedCustomer={() => setActiveCustomerForProfile(null)}
            />
          )}

          {activeTab === 'bookings' && <BookingsPage />}

          {activeTab === 'payments' && <PaymentsPage />}

          {activeTab === 'installments' && <InstallmentsPage />}

          {activeTab === 'reports' && <ReportsPage />}

          {activeTab === 'activity-logs' && <ActivityLogsPage />}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global WhatsApp Reminder Modal */}
      {reminderInstallment && (
        <WhatsAppReminderModal
          installment={reminderInstallment}
          customer={customers.find((c) => c.id === reminderInstallment.customerId)}
          plot={plots.find((p) => p.id === reminderInstallment.plotId)}
          project={activeProject || undefined}
          onClose={() => setReminderInstallment(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
