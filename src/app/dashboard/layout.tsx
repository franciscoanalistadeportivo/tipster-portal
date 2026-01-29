'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, LayoutDashboard, Users, Calendar, Lightbulb, 
  LogOut, Menu, X, User, Crown
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const getPlanBadge = () => {
    switch (user.plan) {
      case 'FREE_TRIAL':
        return <span className="badge-info">Prueba Gratis</span>;
      case 'PREMIUM':
        return <span className="badge-success flex items-center gap-1"><Crown className="h-3 w-3" /> Premium</span>;
      case 'EXPIRED':
        return <span className="badge-danger">Expirado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar Mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-primary-900">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <span className="text-xl font-bold text-white">Tipster Portal</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary-700 text-white' 
                      : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-primary-900">
          <div className="flex h-16 items-center px-4">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <span className="ml-2 text-xl font-bold text-white">Tipster Portal</span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary-700 text-white' 
                      : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* User section */}
          <div className="p-4 border-t border-primary-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary-700 p-2 rounded-full">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.nombre || user.email}</p>
                {getPlanBadge()}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-primary-300 hover:text-white transition-colors w-full px-2 py-2"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top bar mobile */}
        <div className="sticky top-0 z-40 lg:hidden bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary-600" />
              <span className="font-bold text-gray-900">Tipster Portal</span>
            </div>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
