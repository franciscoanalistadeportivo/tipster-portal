'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Mail, Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);
      setUser(response.user);
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Error al iniciar sesión';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient noise-overlay flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-xl">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-white">
              Tipster<span className="text-emerald-400">Portal</span>
            </span>
          </Link>
        </div>

        {/* Card de Login */}
        <div className="card-light animate-fadeInUp">
          <h1 className="text-2xl font-display font-bold text-navy-900 text-center mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-navy-500 text-center mb-8">
            Ingresa a tu cuenta para continuar
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-navy-50 border border-navy-200 rounded-xl text-navy-900 placeholder-navy-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="tu@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-navy-50 border border-navy-200 rounded-xl text-navy-900 placeholder-navy-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-navy-100 text-center">
            <p className="text-navy-600">
              ¿No tienes cuenta?{' '}
              <Link href="/registro" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Volver */}
        <div className="text-center mt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-navy-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
