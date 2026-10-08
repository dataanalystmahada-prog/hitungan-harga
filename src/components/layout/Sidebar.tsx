import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  PenSquare,
  TableProperties,
  FileSpreadsheet,
  Database,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { SyncStatusBar } from '../sync/SyncStatusBar';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Kalkulator Harga', path: '/kalkulator', icon: Calculator, badge: 'Auto' },
  { title: 'Kalkulator Manual', path: '/kalkulator-manual', icon: PenSquare, badge: 'Baru' },
  { title: 'Data Perhitungan', path: '/perhitungan', icon: TableProperties },
  { title: 'Surat Penawaran (SPH)', path: '/sph', icon: FileSpreadsheet },
  { title: 'Master Data', path: '/master-data', icon: Database },
  { title: 'Sync Engine', path: '/sync-monitor', icon: RefreshCw },
  { title: 'Kumpulan Aturan', path: '/aturan', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { role, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const initials = user?.nama
    ? user.nama
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0].toUpperCase())
        .join('')
    : 'US';
  
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (role === 'admin') return true;
    // For sales and purchasing, only show specific paths
    const allowedPaths = ['/', '/kalkulator', '/kalkulator-manual', '/perhitungan', '/sph'];
    return allowedPaths.includes(item.path);
  });

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
        <nav className="p-2 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
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
                {!isCollapsed && item.badge && (
                  <span className="px-1.5 py-0.2 text-[8px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
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
            <div className="flex items-center gap-2.5">
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
            <div className="border-t border-slate-700/50 pt-3 w-full">
              <SyncStatusBar />
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
