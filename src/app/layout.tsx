'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, LayoutDashboard, Users, Calendar, Lightbulb, 
  LogOut, Menu, X, User, Crown, Activity
} from 'lucide-react';
import { authAPI, loadTokens, clearTokens, isAuthenticated } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tipsters', href: '/dashboard/tipsters', icon: Users },
  { name: 'Apuestas Hoy', href: '/dashboard/apuestas', icon: Calendar },
  { name: 'Recomendaciones', href: '/dashboard/recomendaciones', icon: Lightbulb },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, isLoading, setLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      loadTokens();
      
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const response = await authAPI.getMe();
        setUser(response.user);
      } catch (error) {
        clearTokens();
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, setUser]);

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    router.push('/login');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-emerald-500 mx-auto animate-pulse" />
          <p className="mt-4 text-slate-400 font-mono">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  const getPlanBadge = () => {
    switch (user.plan) {
      case 'FREE_TRIAL':
        return <span className="badge-warning text-[10px]">TRIAL</span>;
      case 'PREMIUM':
        return <span className="badge-success text-[10px] flex items-center gap-1"><Crown className="h-3 w-3" /> PRO</span>;
      case 'EXPIRED':
        return <span className="badge-danger text-[10px]">EXPIRED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Sidebar Mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-[#0f172a] border-r border-slate-800">
          <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-white">TipsterPortal</span>
                <span className="block text-[10px] text-slate-500 font-mono">CENTRO DE OPERACIONES</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-5 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative ${
                    isActive 
                      ? 'bg-slate-800/50 text-white nav-item-active' 
                      : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : ''}`} strokeWidth={1.5} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-[#0f172a] border-r border-slate-800/80">
          {/* Logo */}
          <div className="flex h-16 items-center px-5 border-b border-slate-800/80">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div className="ml-2.5">
              <span className="text-base font-bold text-white">TipsterPortal</span>
              <span className="block text-[10px] text-slate-500 font-mono tracking-wider">CENTRO DE OPERACIONES</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative ${
                    isActive 
                      ? 'bg-slate-800/50 text-white nav-item-active' 
                      : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : ''}`} strokeWidth={1.5} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* User section */}
          <div className="p-3 border-t border-slate-800/80">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.nombre || user.email.split('@')[0]}</p>
                <div className="mt-0.5">{getPlanBadge()}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors w-full px-3 py-2.5 mt-2 rounded-lg hover:bg-slate-800/30 text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top bar mobile */}
        <div className="sticky top-0 z-40 lg:hidden bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800">
          <div className="flex h-14 items-center justify-between px-4">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500 p-1 rounded">
                <Trophy className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm">TipsterPortal</span>
            </div>
            <div className="w-5"></div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
