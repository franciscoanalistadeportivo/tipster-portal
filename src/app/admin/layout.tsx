'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, FileText, Users, Trophy, Settings,
  Shield, LogOut, Menu, X, Lock
} from 'lucide-react';

// ============================================
// TIPOS Y CONTEXTO AUTH
// ============================================
interface AdminUser {
  id: number;
  email: string;
  is_admin?: boolean;
}

interface AuthContextType {
  user: AdminUser | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://franciscoanalistadeportivo.pythonanywhere.com';

// ============================================
// FETCH HELPER
// ============================================
export async function adminFetch(
  endpoint: string, 
  options: RequestInit = {},
  accessToken: string | null
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return fetch(`${API_URL}${endpoint}`, { ...options, headers });
}

// ============================================
// AUTH PROVIDER
// ============================================
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_access_token');
    const savedUser = localStorage.getItem('admin_user');
    
    if (savedToken && savedUser) {
      setAccessToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.access_token) {
        setAccessToken(data.access_token);
        setUser(data.user);
        
        localStorage.setItem('admin_access_token', data.access_token);
        localStorage.setItem('admin_refresh_token', data.refresh_token || '');
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// NAVIGATION
// ============================================
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Landing Page', href: '/admin/landing', icon: FileText },
  { name: 'Tipsters', href: '/admin/tipsters', icon: Trophy },
  { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
  { name: 'Configuración', href: '/admin/config', icon: Settings },
  { name: 'Seguridad', href: '/admin/seguridad', icon: Shield },
];

// ============================================
// ADMIN LAYOUT CONTENT
// ============================================
function AdminLayoutContent({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Admin Panel</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${isActive ? 'bg-teal-500/20 text-teal-400' : 'text-gray-400 hover:bg-slate-700/50 hover:text-white'}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold">{user.email.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.email}</p>
              <p className="text-xs text-gray-400">Administrador</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="h-16 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <Link href="/" target="_blank" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
            Ver sitio →
          </Link>
        </header>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// ============================================
// MAIN LAYOUT EXPORT
// ============================================
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
