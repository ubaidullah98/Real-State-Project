import React from 'react';
import {
  LayoutDashboard,
  Box,
  Building,
  Grid3X3,
  Users,
  FileCheck,
  CreditCard,
  Clock,
  BarChart3,
  History,
  Settings,
  Sparkles,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'plot-map'
  | 'projects'
  | 'plots'
  | 'customers'
  | 'bookings'
  | 'payments'
  | 'installments'
  | 'reports'
  | 'activity-logs'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuItems: { id: NavTab; label: string; icon: React.FC<any>; badge?: string; isHero?: boolean }[] = [
    { id: 'dashboard', label: 'Main Overview', icon: LayoutDashboard },
    { id: 'plot-map', label: 'Interactive 3D Map', icon: Box, badge: '3D HERO', isHero: true },
    { id: 'projects', label: 'Projects Management', icon: Building },
    { id: 'plots', label: 'Plot Inventory', icon: Grid3X3 },
    { id: 'customers', label: 'Customer Management', icon: Users },
    { id: 'bookings', label: 'Plot Bookings', icon: FileCheck },
    { id: 'payments', label: 'Payment Collection', icon: CreditCard },
    { id: 'installments', label: 'Installment Tracker', icon: Clock },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'activity-logs', label: 'Activity Logs', icon: History },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const handleItemClick = (id: NavTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ease-in-out md:translate-x-0 flex flex-col justify-between overflow-y-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3.5 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation Menu
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-700 dark:text-amber-300 border border-amber-500/40 dark:border-amber-500/30 shadow-sm'
                    : item.isHero
                    ? 'bg-amber-50/70 dark:bg-slate-950/60 hover:bg-amber-100/70 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-amber-500/30 dark:border-amber-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-amber-600 dark:text-amber-400'
                        : item.isHero
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      item.isHero
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80">
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Flagship Project
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">Al-Basit Residency</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Phase 1 • Scheme 45, Super Highway, Karachi
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
