import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Building2,
  ChevronDown,
  Search,
  LogOut,
  Shield,
  AlertTriangle,
  Sun,
  Moon,
  Cloud,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  onSearchSelect?: (type: string, id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchSelect }) => {
  const { currentUser, firebaseUser, loginWithGoogle, loginAsRole, logout } = useAuth();
  const { projects, activeProject, setActiveProjectId, plots, customers, transactions, installments } = useProjects();
  const { isDark, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Search results
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return null;
    const q = searchQuery.toLowerCase().trim();

    const matchedPlots = plots.filter(
      (p) => p.plotNumber.toLowerCase().includes(q) || p.blockNumber.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedCustomers = customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.cnic.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedTxns = transactions.filter((t) => t.receiptNumber.toLowerCase().includes(q)).slice(0, 4);

    return {
      plots: matchedPlots,
      customers: matchedCustomers,
      transactions: matchedTxns,
    };
  }, [searchQuery, plots, customers, transactions]);

  const overdueCount = installments.filter((i) => i.status === 'overdue').length;

  const handleGoogleSyncSignIn = async () => {
    setIsSigningIn(true);
    try {
      await loginWithGoogle();
    } catch {
      // handled gracefully in context
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Brand Crest & Company Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#0B192C] dark:bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400 font-serif font-black text-xl tracking-tighter">
                AB
              </div>
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                AL-BASIT <span className="text-amber-600 dark:text-amber-400 font-semibold">BUILDERS</span>
              </div>
              <div className="text-[10px] tracking-widest text-slate-500 dark:text-slate-400 uppercase font-medium">
                Real Estate ERP & 3D Visualization
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />

          {/* Project Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-950/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-bold text-slate-900 dark:text-white max-w-[140px] truncate">
                {activeProject?.name || 'Al-Basit Residency'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>

            {showProjectMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Select Active Project
                </div>
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveProjectId(proj.id);
                      setShowProjectMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                      activeProject?.id === proj.id
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{proj.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{proj.status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="relative flex-1 max-w-md mx-4 hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Global Search (Plot, Customer, CNIC, Receipt #)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors shadow-inner"
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchDropdown && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 z-50 max-h-80 overflow-y-auto">
              {searchResults.plots.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider px-2 py-1">Plots</div>
                  {searchResults.plots.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSearchSelect?.('plot', p.id);
                        setShowSearchDropdown(false);
                      }}
                      className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-xs flex justify-between"
                    >
                      <span className="font-bold text-slate-900 dark:text-white">Plot {p.plotNumber} ({p.blockNumber})</span>
                      <span className="text-slate-500 dark:text-slate-400">{p.plotSize}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.customers.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider px-2 py-1">Customers</div>
                  {searchResults.customers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSearchSelect?.('customer', c.id);
                        setShowSearchDropdown(false);
                      }}
                      className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-xs flex justify-between"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">{c.fullName}</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">{c.cnic}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.transactions.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider px-2 py-1">Receipts</div>
                  {searchResults.transactions.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        onSearchSelect?.('transaction', t.id);
                        setShowSearchDropdown(false);
                      }}
                      className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-xs flex justify-between"
                    >
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{t.receiptNumber}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">PKR {t.amountReceived.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Theme Toggle, Cloud Sync, Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle Switch */}
          <button
            type="button"
            onClick={toggleTheme}
            role="switch"
            aria-checked={isDark}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="group flex items-center gap-2 bg-slate-100 dark:bg-slate-950/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs transition-all cursor-pointer"
          >
            <Sun className={`w-3.5 h-3.5 transition-colors ${!isDark ? 'text-amber-500' : 'text-slate-500'}`} />
            <div
              className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                isDark ? 'bg-amber-500/30 border border-amber-500/50' : 'bg-slate-300 border border-slate-400/40'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full shadow-sm transition-transform duration-200 ${
                  isDark ? 'translate-x-4 bg-amber-400' : 'translate-x-0 bg-white'
                }`}
              />
            </div>
            <Moon className={`w-3.5 h-3.5 transition-colors ${isDark ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden xl:inline text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              {isDark ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Firebase Cloud Sync Status / Google Sign In */}
          {!firebaseUser ? (
            <button
              onClick={handleGoogleSyncSignIn}
              disabled={isSigningIn}
              className="hidden sm:flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-700 dark:text-amber-300 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              title="Sign in with Google to enable live Firestore cloud sync"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{isSigningIn ? 'Signing in...' : 'Sign In for Cloud Sync'}</span>
            </button>
          ) : (
            <div
              className="hidden sm:flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-xl text-xs font-semibold"
              title={`Synced to Cloud Firestore as ${firebaseUser.email}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Cloud Synced</span>
            </div>
          )}

          {/* Overdue alert badge */}
          {overdueCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/30 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded-xl text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{overdueCount} Overdue</span>
            </div>
          )}

          {/* User Profile / Role Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-[11px]">
                {currentUser?.displayName?.[0] || 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-slate-900 dark:text-white leading-tight max-w-[130px] truncate">
                  {currentUser?.displayName || 'Authorized User'}
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 capitalize flex items-center gap-1 font-medium">
                  <Shield className="w-2.5 h-2.5" />
                  {currentUser?.role.replace('_', ' ') || 'Admin'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Switch Active Role (Demo)
                </div>
                <button
                  onClick={() => {
                    loginAsRole('admin');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>Super Admin & Owner</span>
                  {currentUser?.role === 'admin' && <span className="text-amber-600 dark:text-amber-400 font-bold">✓</span>}
                </button>
                <button
                  onClick={() => {
                    loginAsRole('project_manager');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>Project Manager</span>
                  {currentUser?.role === 'project_manager' && <span className="text-amber-600 dark:text-amber-400 font-bold">✓</span>}
                </button>
                <button
                  onClick={() => {
                    loginAsRole('accountant');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>Finance / Accountant</span>
                  {currentUser?.role === 'accountant' && <span className="text-amber-600 dark:text-amber-400 font-bold">✓</span>}
                </button>
                <button
                  onClick={() => {
                    loginAsRole('sales_agent');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>Sales Agent</span>
                  {currentUser?.role === 'sales_agent' && <span className="text-amber-600 dark:text-amber-400 font-bold">✓</span>}
                </button>

                {!firebaseUser && (
                  <>
                    <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        handleGoogleSyncSignIn();
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-semibold"
                    >
                      <Cloud className="w-3.5 h-3.5" /> Sign in with Google
                    </button>
                  </>
                )}

                <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

                <button
                  onClick={() => {
                    logout();
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
