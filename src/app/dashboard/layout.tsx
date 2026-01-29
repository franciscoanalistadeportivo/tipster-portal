'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, LayoutDashboard, Users, Calendar, Lightbulb, 
  LogOut, Menu, X, User, Crown, ChevronRight
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
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-navy-300">Cargando...</p>
        </div>
      </div>
    );
  }

  const getPlanBadge = () => {
    switch (user.plan) {
      case 'FREE_TRIAL':
        return <span className="badge-info text-xs">Prueba Gratis</span>;
      case 'PREMIUM':
        return <span className="badge-success text-xs flex items-center gap-1"><Crown className="h-3 w-3" /> Premium</span>;
      case 'EXPIRED':
        return <span className="badge-danger text-xs">Expirado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Sidebar Mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-navy-900 border-r border-navy-800">
          <div className="flex h-16 items-center justify-between px-6 border-b border-navy-800">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-1.5 rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-display font-bold text-white">
                Tipster<span className="text-emerald-400">Portal</span>
              </span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-navy-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 bg-navy-900 border-r border-navy-800">
          <div className="flex h-16 items-center px-6 border-b border-navy-800">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-1.5 rounded-lg">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-lg font-display font-bold text-white">
              Tipster<span className="text-emerald-400">Portal</span>
            </span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>
          
          {/* User section */}
          <div className="p-4 border-t border-navy-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-800/50 mb-3">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.nombre || user.email}</p>
                {getPlanBadge()}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-navy-400 hover:text-white transition-colors w-full px-3 py-2 rounded-lg hover:bg-navy-800"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top bar mobile */}
        <div className="sticky top-0 z-40 lg:hidden bg-navy-900/80 backdrop-blur-md border-b border-navy-800">
          <div className="flex h-16 items-center justify-between px-4">
            <button onClick={() => setSidebarOpen(true)} className="text-navy-400 hover:text-white">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-1.5 rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-white">TipsterPortal</span>
            </div>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
