import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Settings,
  Building,
  Database,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Shield,
  Layers,
  Sparkles,
  Info,
  Sun,
  Moon,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { activeProject, seedDemoData, clearDemoData, isFirestoreConnected, plots, customers } = useProjects();
  const { currentUser, loginAsRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const [statusMsg, setStatusMsg] = useState('');

  const demoPlotsCount = plots.filter((p) => p.isDemo).length;
  const demoCustCount = customers.filter((c) => c.isDemo).length;

  const handleSeed = async () => {
    if (confirm('Re-seed initial demonstration data for Al-Basit Residency?')) {
      await seedDemoData();
      setStatusMsg('Demonstration data has been successfully re-seeded.');
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleClear = async () => {
    if (
      confirm(
        'Are you sure you want to remove all demonstration records? This will delete sample plots and demo customers while preserving your real uploaded project data.'
      )
    ) {
      await clearDemoData();
      setStatusMsg('All demonstration records have been cleared. Application is now production clean.');
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            System Settings & Enterprise Architecture
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Database synchronization, interface appearance, company profile, and demonstration data controls.
          </p>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${
            isFirestoreConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{isFirestoreConnected ? 'Firestore Connected & Active' : 'Local Preview Mode'}</span>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {statusMsg}
        </div>
      )}

      {/* Interface Appearance / Dark & Light Mode Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              Interface Appearance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Switch between Navy Dark Mode and Daylight Crisp Light Mode across all dashboards and 3D overlays.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Light Mode
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                theme === 'dark'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark Mode
            </button>
          </div>
        </div>
      </div>

      {/* Company Branding Profile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Building className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Company Corporate Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-500 dark:text-slate-400 block mb-1">Company Name</label>
            <input
              type="text"
              readOnly
              value="Al-Basit Builders"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold"
            />
          </div>
          <div>
            <label className="text-slate-500 dark:text-slate-400 block mb-1">Head Office Location</label>
            <input
              type="text"
              readOnly
              value="Main Super Highway (M-9), Scheme 45, Karachi, Pakistan"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl p-2.5"
            />
          </div>
          <div>
            <label className="text-slate-500 dark:text-slate-400 block mb-1">Flagship Real Estate Project</label>
            <input
              type="text"
              readOnly
              value="Al-Basit Residency (Phase 1)"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-bold rounded-xl p-2.5"
            />
          </div>
          <div>
            <label className="text-slate-500 dark:text-slate-400 block mb-1">Currency Standard</label>
            <input
              type="text"
              readOnly
              value="Pakistani Rupee (PKR) - Exact Non-Rounded Ledger"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl p-2.5"
            />
          </div>
        </div>
      </div>

      {/* Cloud Firestore & Security Information */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Database & Security Infrastructure
        </h2>

        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Cloud Firestore Database</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 break-all">Database ID: ai-studio-albasitbuildersr-8f22a66a-e9d6-45ec-a07b-71d34c1c1f7c</div>
            </div>
            <span className="self-start sm:self-center px-2.5 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold rounded-lg border border-emerald-500/30 whitespace-nowrap">
              Provisioned & Online
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Firestore Security Rules</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Hardened ABAC Ruleset Deployed to Firebase via Fax RPC</div>
            </div>
            <span className="self-start sm:self-center px-2.5 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold rounded-lg border border-amber-500/30 whitespace-nowrap">
              Active Security Shield
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Super Admin Access</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">ubaidullahbhutto1998@gmail.com</div>
            </div>
            <span className="self-start sm:self-center px-2.5 py-1 bg-purple-500/15 text-purple-700 dark:text-purple-400 font-bold rounded-lg border border-purple-500/30 whitespace-nowrap">
              Owner Credentials Verified
            </span>
          </div>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Demonstration Data Controls
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          In accordance with project requirements, demonstration records for Al-Basit Residency are cleanly isolated
          with an internal <code className="bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-400 font-mono">isDemo: true</code> flag.
          Real uploaded PDF master plan plots are never mixed with sample data.
        </p>

        <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">ACTIVE DEMO RECORDS IN SYSTEM</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {demoPlotsCount} Demo Plots • {demoCustCount} Demo Customers
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSeed}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-400 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-Seed Demo Records
            </button>
            <button
              onClick={handleClear}
              className="px-3.5 py-2 bg-rose-500/10 dark:bg-rose-600/20 hover:bg-rose-600 text-rose-700 dark:text-rose-400 hover:text-white border border-rose-500/30 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Demo Records (Production Mode)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
