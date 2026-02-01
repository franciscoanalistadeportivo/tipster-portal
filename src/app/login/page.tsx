'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo NeuroTips */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <Image
              src="https://raw.githubusercontent.com/franciscoanalistadeportivo/logo/main/Gemini_Generated_Image_7h3boy7h3boy7h3b.png"
              alt="NeuroTips"
              width={180}
              height={60}
              className="h-16 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Card de Login */}
        <div className="bg-[#1E293B] rounded-2xl p-8 border border-white/10 shadow-xl">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-[#94A3B8] text-center mb-8">
            Ingresa a tu cuenta para continuar
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#64748B]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-[#0F172A] border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:ring-2 focus:ring-[#00D1B2] focus:border-transparent outline-none transition-all"
                  placeholder="tu@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#64748B]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-[#0F172A] border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:ring-2 focus:ring-[#00D1B2] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Link Olvidé contraseña */}
            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-sm text-[#00D1B2] hover:text-[#00B89F] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#00D1B2] hover:bg-[#00B89F] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[#94A3B8]">
              ¿No tienes cuenta?{' '}
              <Link href="/registro" className="text-[#00D1B2] hover:text-[#00B89F] font-semibold transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Volver */}
        <div className="text-center mt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#64748B] hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
