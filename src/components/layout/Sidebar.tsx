import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  PenSquare,
  Sparkles,
  TableProperties,
  FileSpreadsheet,
  Database,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  LogOut,
  BookOpen,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SyncStatusBar } from '../sync/SyncStatusBar';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface SubMenuItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: 'emerald' | 'blue' | 'amber';
}

interface NavItem {
  title: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  subItems?: SubMenuItem[];
}

const KALKULATOR_SUBITEMS: SubMenuItem[] = [
  { title: 'Kalkulator Harga', path: '/kalkulator', icon: Calculator, badge: 'Auto', badgeType: 'emerald' },
  { title: 'Kalkulator Manual', path: '/kalkulator-manual', icon: PenSquare, badge: 'Baru', badgeType: 'blue' },
  { title: 'Kalkulator Rekomendasi', path: '/kalkulator-rekomendasi', icon: Sparkles, badge: 'Maint', badgeType: 'amber' },
];

const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  {
    title: 'Kalkulator',
    icon: Calculator,
    subItems: KALKULATOR_SUBITEMS,
  },
  { title: 'Data Perhitungan', path: '/perhitungan', icon: TableProperties },
  { title: 'Surat Penawaran (SPH)', path: '/sph', icon: FileSpreadsheet },
  { title: 'Master Data', path: '/master-data', icon: Database },
  { title: 'Sync Engine', path: '/sync-monitor', icon: RefreshCw },
  { title: 'Kumpulan Aturan', path: '/aturan', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { role, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isKalkulatorActive = location.pathname.startsWith('/kalkulator');
  const [isKalkulatorOpen, setIsKalkulatorOpen] = useState(true);

  const initials = user?.nama
    ? user.nama
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0].toUpperCase())
        .join('')
    : 'US';
  
  const allowedPaths = ['/', '/kalkulator', '/kalkulator-manual', '/kalkulator-rekomendasi', '/perhitungan', '/sph'];

  const filteredNavItems = NAV_ITEMS.map(item => {
    if (role === 'admin') return item;
    
    // For non-admin roles
    if (item.subItems) {
      const allowedSubs = item.subItems.filter(sub => allowedPaths.includes(sub.path));
      if (allowedSubs.length > 0) {
        return { ...item, subItems: allowedSubs };
      }
      return null;
    }

    if (item.path && allowedPaths.includes(item.path)) {
      return item;
    }
    return null;
  }).filter((item): item is NavItem => item !== null);

  const renderBadge = (badge: string, badgeType?: 'emerald' | 'blue' | 'amber') => {
    const colorClasses = {
      emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    }[badgeType || 'emerald'];

    return (
      <span className={cn('px-1.5 py-0.2 text-[8px] font-bold rounded-full border', colorClasses)}>
        {badge}
      </span>
    );
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col justify-between h-screen bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 z-30 select-none flex-shrink-0',
        isCollapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Top Brand Logo */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between pt-5 sm:pt-6 pb-3 sm:pb-4 px-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25 flex-shrink-0">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-xs text-white tracking-tight truncate">
                  Enterprise Pricing
                </span>
                <span className="text-[9px] text-emerald-400 font-semibold tracking-wider uppercase">
                  Supabase + GAS
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;

            // Group Menu (e.g. Kalkulator)
            if (item.subItems) {
              const isGroupActive = isKalkulatorActive;

              if (isCollapsed) {
                return (
                  <div key={item.title} className="relative group">
                    <button
                      className={cn(
                        'flex items-center justify-center w-full p-2 rounded-lg text-xs font-medium transition-all duration-150',
                        isGroupActive
                          ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </button>

                    {/* Popover Flyout for Collapsed Sidebar */}
                    <div className="absolute left-full top-0 ml-2 w-52 py-2 px-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
                      <div className="px-2.5 py-1 text-[11px] font-bold text-slate-300 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                        <span>{item.title}</span>
                        <span className="text-[9px] text-slate-500">{item.subItems.length} Pilihan</span>
                      </div>
                      <div className="space-y-0.5">
                        {item.subItems.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive = location.pathname === sub.path;
                          return (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              className={cn(
                                'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                isSubActive
                                  ? 'bg-brand-600 text-white font-semibold shadow-sm'
                                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                              )}
                            >
                              <SubIcon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate flex-1 text-[11px]">{sub.title}</span>
                              {sub.badge && renderBadge(sub.badge, sub.badgeType)}
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              // Expanded Sidebar Group Menu
              return (
                <div key={item.title} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setIsKalkulatorOpen(prev => !prev)}
                    className={cn(
                      'flex items-center justify-between w-full gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 group',
                      isGroupActive
                        ? 'text-white bg-slate-800/70 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={cn('w-4 h-4 flex-shrink-0', isGroupActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200')} />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
                        isKalkulatorOpen && 'transform rotate-180'
                      )}
                    />
                  </button>

                  {/* Submenu Items */}
                  {isKalkulatorOpen && (
                    <div className="pl-3.5 pr-1 py-0.5 space-y-0.5 border-l border-slate-800 ml-4">
                      {item.subItems.map((sub) => {
                        const SubIcon = sub.icon;
                        return (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            className={({ isActive }: { isActive: boolean }) =>
                              cn(
                                'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 group relative',
                                isActive
                                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25 font-semibold'
                                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                              )
                            }
                          >
                            <SubIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate flex-1 text-[11px]">{sub.title}</span>
                            {sub.badge && renderBadge(sub.badge, sub.badgeType)}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Standard Single NavItem
            return (
              <NavLink
                key={item.path}
                to={item.path!}
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 group relative',
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  )
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate flex-1">{item.title}</span>}
                {!isCollapsed && item.badge && renderBadge(item.badge, 'emerald')}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-950 text-white text-[11px] rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {item.title}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col mt-auto">
        {/* User Profile, Theme & Sync Status */}
        {!isCollapsed && (
          <div className="mx-2 mb-2 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col gap-3">
            <div className="w-full">
              <SyncStatusBar />
            </div>
            <div className="flex items-center gap-2.5 border-t border-slate-700/50 pt-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-[11px] shadow-sm shadow-brand-500/20 flex-shrink-0">
                {initials}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[11px] font-bold text-slate-100 truncate">
                  {user?.nama || 'Sales Admin'}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider truncate">
                  {user?.role || role || 'Sales PIC'}
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors border border-slate-700/60"
                title={`Ganti ke Tema ${theme === 'dark' ? 'Terang' : 'Gelap'}`}
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="p-2 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full p-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
