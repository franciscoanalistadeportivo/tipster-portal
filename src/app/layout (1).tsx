'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, LayoutDashboard, Users, Calendar, Zap, 
  LogOut, Menu, X, User, Crown, Shield
} from 'lucide-react';
import { authAPI, loadTokens, clearTokens, isAuthenticated } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tipsters', href: '/dashboard/tipsters', icon: Users },
  { name: 'Apuestas', href: '/dashboard/apuestas', icon: Calendar },
  { name: 'IA Picks', href: '/dashboard/recomendaciones', icon: Zap },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, setUser]);

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#94A3B8]">Cargando...</p>
        </div>
      </div>
    );
  }

  const getPlanBadge = () => {
    switch (user.plan) {
      case 'FREE_TRIAL':
        return (
          <span className="badge-gold text-[10px] flex items-center gap-1">
            <Shield className="h-3 w-3" />
            TRIAL
          </span>
        );
      case 'PREMIUM':
        return (
          <span className="badge-success text-[10px] flex items-center gap-1">
            <Crown className="h-3 w-3" />
            PREMIUM
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="badge-danger text-[10px]">EXPIRADO</span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/70" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 w-72 bg-[#0F172A] border-r border-[#334155]">
          <div className="flex h-16 items-center justify-between px-5 border-b border-[#334155]">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#00D1B2] p-1.5 rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-white">TipsterPortal</span>
                <span className="block text-[10px] text-[#FFDD57] font-mono">ELITE VAULT</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-[#94A3B8] hover:text-white">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive ? 'nav-active' : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-[#0F172A] border-r border-[#334155]">
          {/* Logo */}
          <div className="flex h-16 items-center px-5 border-b border-[#334155]">
            <div className="bg-[#00D1B2] p-1.5 rounded-lg">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div className="ml-2.5">
              <span className="text-base font-bold text-white">TipsterPortal</span>
              <span className="block text-[10px] text-[#FFDD57] font-mono tracking-wider">ELITE VAULT</span>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive ? 'nav-active' : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* User Section */}
          <div className="p-4 border-t border-[#334155]">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1E293B]">
              <div className="bg-gradient-to-br from-[#00D1B2] to-[#00B89C] p-2 rounded-lg">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.nombre || user.email.split('@')[0]}
                </p>
                <div className="mt-0.5">{getPlanBadge()}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors w-full px-4 py-3 mt-2 rounded-xl hover:bg-[#1E293B]"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Top Bar */}
        <div className="sticky top-0 z-40 lg:hidden bg-[#0F172A]/95 backdrop-blur-md border-b border-[#334155]">
          <div className="flex h-14 items-center justify-between px-4">
            <button onClick={() => setSidebarOpen(true)} className="text-[#94A3B8] hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-[#00D1B2] p-1 rounded">
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

        {/* Mobile Bottom CTA (Trial only) */}
        {user.plan === 'FREE_TRIAL' && (
          <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#0F172A]/95 backdrop-blur-md border-t border-[#334155] p-3">
            <Link 
              href="/dashboard/suscripcion" 
              className="btn-pulse w-full flex items-center justify-center gap-2"
            >
              <Crown className="h-5 w-5" />
              Suscribirse por $15.000/mes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
