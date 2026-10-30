import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Server, Activity, AlertTriangle, 
  Settings, LogOut, Shield, Search, Bell, 
  ChevronRight, Command, Sparkles, Crown, Menu, X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import IEGCopilot from './IEGCopilot';

const MENU = [
  { name: 'Dashboard',     path: '/',        icon: LayoutDashboard, accent: 'from-amber-300 to-orange-500' },
  { name: 'Machines',      path: '/machines', icon: Server,         accent: 'from-cyan-300 to-blue-500' },
  { name: 'Incidents',     path: '/incidents',icon: AlertTriangle,  accent: 'from-rose-400 to-red-500' },
  { name: 'Graph Explorer',path: '/graph',    icon: Activity,       accent: 'from-emerald-300 to-teal-500' },
];

const ROLE_META = {
  ADMIN:    { label: 'Command Admin',  color: 'text-amber-300',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   icon: Crown,   accent: 'from-amber-300 to-orange-500' },
  SECURITY: { label: 'Security Chief', color: 'text-rose-300',    bg: 'bg-rose-500/10',    border: 'border-rose-500/25',    icon: Shield,  accent: 'from-rose-400 to-red-500' },
  ENGINEER: { label: 'Plant Engineer', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', icon: Activity,accent: 'from-emerald-300 to-teal-500' },
  OPERATOR: { label: 'Operator',       color: 'text-slate-300',   bg: 'bg-white/[0.04]',   border: 'border-white/10',       icon: Activity,accent: 'from-slate-400 to-slate-500' },
};

export default function Layout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change (for mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const isAdmin = user?.role === 'ADMIN';
  const role = ROLE_META[user?.role] || ROLE_META.OPERATOR;
  const RoleIcon = role.icon;
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Plant Overview';
    if (location.pathname === '/admin') return 'Admin Panel';
    return location.pathname.replace('/', '').replace(/-/g, ' ');
  };

  return (
    <div className="relative flex h-screen bg-[#05060a] text-slate-200 overflow-hidden font-sans selection:bg-amber-400/30">

      {/* ===== AMBIENT BACKDROP ===== */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 left-1/4 w-[20rem] sm:w-[40rem] h-[20rem] sm:h-[40rem] rounded-full bg-amber-500/[0.03] blur-[100px] sm:blur-[160px]" />
        <div className="absolute -bottom-40 right-1/4 w-[20rem] sm:w-[40rem] h-[20rem] sm:h-[40rem] rounded-full bg-cyan-500/[0.03] blur-[100px] sm:blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at 50% 0%, black 40%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 40%, transparent 90%)',
          }}
        />
      </div>

      {/* ===== MOBILE OVERLAY ===== */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`fixed md:relative z-50 h-full w-64 shrink-0 flex flex-col border-r border-white/[0.06] bg-[#080a10]/95 md:bg-[#080a10]/80 backdrop-blur-2xl transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06] relative">
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-amber-400/30 blur-md group-hover:bg-amber-400/50 transition-colors" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-400/30 flex items-center justify-center">
                <Activity size={16} className="text-amber-300" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-0.5">
                <span className="text-base font-black text-white tracking-wider">IEG</span>
                <span className="text-base font-black text-amber-300">.</span>
              </div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold mt-0.5 truncate">
                Experience Graph
              </p>
            </div>
          </Link>
          {/* Close Sidebar Button (Mobile) */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1.5 scrollbar-hide">
          <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-600 px-3 mb-2">
            Navigation
          </div>

          {MENU.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  active
                    ? 'bg-white/[0.06] border border-white/10 text-white'
                    : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] hover:border-white/[0.06]'
                }`}
              >
                {active && (
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b ${item.accent}`} />
                )}
                <div className={`transition-all ${active ? 'text-amber-300' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  <Icon size={17} />
                </div>
                <span className={`text-xs font-semibold tracking-wide flex-1 ${active ? 'text-white' : ''}`}>
                  {item.name}
                </span>
                {active && (
                  <ChevronRight size={12} className="text-amber-300/70" />
                )}
              </Link>
            );
          })}

          {/* Admin only */}
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-white/[0.06]">
              <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-400/60 px-3 mb-2">
                Command
              </div>
              <Link
                to="/admin"
                className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  location.pathname === '/admin'
                    ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-400/30 text-white shadow-[0_0_25px_-5px_rgba(251,191,36,0.3)]'
                    : 'bg-white/[0.015] border border-white/[0.06] text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/[0.06] hover:border-amber-500/25'
                }`}
              >
                {location.pathname === '/admin' && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-amber-300 to-orange-500" />
                )}
                <Shield size={16} className="text-amber-300" />
                <span className="text-xs font-bold tracking-wide flex-1">Admin Panel</span>
                <Crown size={11} className="text-amber-300/70" />
              </Link>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06] space-y-1">
          <button className="group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06] transition-all">
            <Settings size={16} className="group-hover:rotate-45 transition-transform duration-300" />
            <span className="text-xs font-semibold tracking-wide flex-1 text-left">Settings</span>
          </button>

          {/* User card */}
          <div className="mt-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
            <div className={`relative w-9 h-9 rounded-xl bg-gradient-to-br ${role.accent} p-[1px] shrink-0`}>
              <div className="w-full h-full rounded-[10px] bg-[#0a0c14] flex items-center justify-center text-white text-xs font-black">
                {initial}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] border border-[#0a0c14]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-white truncate leading-tight">
                {user?.name || 'User'}
              </p>
              <p className={`text-[9px] font-bold uppercase tracking-[0.15em] truncate ${role.color}`}>
                {role.label}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="h-16 shrink-0 flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#080a10]/60 backdrop-blur-2xl">

          {/* Left: Mobile Menu & Page title */}
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-slate-400 hover:text-white p-1.5 -ml-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold shrink-0">
              <span>IEG</span>
              <ChevronRight size={10} />
              <span className="text-slate-500">Workspace</span>
              <ChevronRight size={10} />
            </div>
            <h1 className="text-base sm:text-base font-bold text-white capitalize tracking-tight truncate">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search */}
            <div className="relative group hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-300 transition-colors" />
              <input
                type="text"
                placeholder="Search…"
                className="w-48 lg:w-56 bg-white/[0.02] border border-white/[0.06] rounded-xl pl-9 pr-14 py-2 text-xs text-white placeholder:text-slate-600 outline-none transition-all focus:border-amber-400/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-amber-400/10"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                <Command size={9} className="text-slate-500" />
                <span className="text-[9px] font-bold text-slate-500">K</span>
              </div>
            </div>

            {/* Notification */}
            <button className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all flex items-center justify-center group">
              <Bell size={15} className="text-slate-400 group-hover:text-amber-300 transition-colors" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)] animate-pulse" />
            </button>

            {/* Role badge (desktop only) */}
            <div className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl border ${role.bg} ${role.border}`}>
              <RoleIcon size={11} className={role.color} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${role.color}`}>
                {user?.role || 'OPERATOR'}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              title="Logout"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-rose-500/10 hover:border-rose-500/25 transition-all flex items-center justify-center group"
            >
              <LogOut size={15} className="text-slate-400 group-hover:text-rose-300 transition-colors" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>

        <IEGCopilot />
      </main>
    </div>
  );
}