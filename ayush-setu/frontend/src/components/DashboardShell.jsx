import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, X, Sparkles, Presentation, Accessibility } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const NAV = {
  student: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/opportunities', label: 'Internships & Jobs', icon: Briefcase },
  ],
  industry: [{ to: '/industry', label: 'Dashboard', icon: LayoutDashboard }],
  institution: [{ to: '/institution', label: 'Dashboard', icon: LayoutDashboard }],
};

export default function DashboardShell({ children, title, subtitle, searchValue, onSearchChange, searchPlaceholder }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const items = NAV[user.role] || [];

  return (
    <div className={`flex min-h-screen mesh-bg ${largeText ? 'text-[17px]' : ''}`}>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`w-60 bg-navy text-white flex flex-col p-4 fixed lg:static inset-y-0 left-0 z-30 transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2"><span className="grid place-items-center w-9 h-9 bg-white/15 rounded-xl font-black text-accent">A</span><div><span className="font-bold text-lg tracking-tight">AYUSH-SETU</span><p className="text-[10px] tracking-widest text-white/50">CAREER INTELLIGENCE</p></div></div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/70">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  isActive ? 'bg-brand' : 'hover:bg-white/10'
                }`}
              >
                <Icon size={17} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button onClick={() => setDemoMode((value) => !value)} className={`no-print flex items-center gap-2 rounded-lg px-3 py-2 text-sm mb-2 ${demoMode ? 'bg-accent text-white' : 'bg-white/10 text-white/80 hover:bg-white/15'}`}><Presentation size={16} /> {demoMode ? 'Exit demo mode' : 'SIH demo mode'}</button>
        <button onClick={() => setLargeText((value) => !value)} className="no-print flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 mb-3"><Accessibility size={16} /> {largeText ? 'Standard text' : 'Larger text'}</button>

        <div className="text-sm text-white/70 mb-2 truncate">{user.name} ({user.role})</div>
        <button onClick={logout} className="text-sm text-white/70 hover:text-white text-left">
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onMenuClick={() => setMobileOpen(true)}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
        />
        <main className="flex-1 p-5 lg:p-8 pb-20 lg:pb-8">
          {demoMode && <div className="no-print soft-enter mb-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 flex gap-3 text-sm"><Sparkles className="text-accent shrink-0" size={18} /><div><strong className="text-navy">SIH presentation mode</strong><p className="text-gray-600">Tell the story: challenge → transparent skill intelligence → measurable student and institution outcomes.</p></div></div>}
          <h1 className="text-2xl font-bold text-navy tracking-tight">{title}</h1>
          {subtitle && <p className="text-gray-500 mb-6">{subtitle}</p>}
          {children}
        </main>
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t flex justify-around p-2 pb-[max(.5rem,env(safe-area-inset-bottom))]">
          {items.map((item) => { const Icon = item.icon; const active = location.pathname === item.to; return <Link key={item.to} to={item.to} className={`flex flex-col items-center gap-1 text-[11px] px-3 py-1 ${active ? 'text-brand font-semibold' : 'text-gray-500'}`}><Icon size={18} />{item.label}</Link>; })}
        </nav>
      </div>
    </div>
  );
}
