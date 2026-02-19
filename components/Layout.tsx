import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Database, CalendarClock, Share2, Activity, Menu, Settings, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navItems = [
    { to: '/', label: 'דשבורד', icon: Activity },
    { to: '/queries', label: 'שאילתות', icon: Database },
    { to: '/schedules', label: 'תזמונים', icon: CalendarClock },
    { to: '/distributions', label: 'הפצות', icon: Share2 },
    { to: '/settings', label: 'הגדרות', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-200" dir="rtl">
      {/* Header */}
      <header className="bg-[#664FE1] dark:bg-slate-800 text-white shadow-lg sticky top-0 z-50 transition-colors duration-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
             {/* Logo Placeholder */}
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Database className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden md:block">
              תשתית אחזור והפצת מידעים
            </h1>
            <h1 className="text-lg font-bold md:hidden">Menora Data</h1>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-1 h-full items-end">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors border-b-4 rounded-t-lg hover:bg-white/10 ${
                    isActive
                      ? 'border-white text-white bg-white/10'
                      : 'border-transparent text-indigo-100 hover:text-white'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
             {/* Dark Mode Toggle */}
             <button 
                onClick={() => setIsDark(!isDark)}
                className="p-2 text-indigo-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title={isDark ? 'מצב יום' : 'מצב לילה'}
             >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             {/* Mobile Menu Button */}
             <button 
                className="md:hidden p-2 rounded-md hover:bg-white/20"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             >
                <Menu size={24} />
             </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-indigo-500 bg-[#664FE1] dark:bg-slate-800 pb-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-6 py-3 text-base font-medium ${
                    isActive ? 'bg-indigo-700 dark:bg-slate-700 text-white' : 'text-indigo-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  {item.label}
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
