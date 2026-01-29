'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Mail, Lock, User, AlertCircle, Loader2, CheckCircle, ArrowLeft, Gift } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function RegistroPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validación de contraseña en tiempo real
  const passwordChecks = {
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /\d/.test(password),
    match: password === confirmPassword && password.length > 0,
  };

  const isPasswordValid = passwordChecks.length && passwordChecks.letter && passwordChecks.number;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('La contraseña no cumple los requisitos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register(email, password, nombre);
      setUser(response.user);
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Error al registrarse';
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

        {/* Card de Registro */}
        <div className="card-light animate-fadeInUp">
          {/* Badge 5 días gratis */}
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500/10 to-gold-600/10 border border-gold-500/30 rounded-xl px-4 py-3 mb-6">
            <Gift className="h-5 w-5 text-gold-500" />
            <span className="text-gold-600 font-semibold">5 días de prueba gratis</span>
          </div>

          <h1 className="text-2xl font-display font-bold text-navy-900 text-center mb-2">
            Crear Cuenta
          </h1>
          <p className="text-navy-500 text-center mb-8">
            Comienza tu período de prueba gratuito
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
                Nombre
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-navy-50 border border-navy-200 rounded-xl text-navy-900 placeholder-navy-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="Tu nombre"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

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
              
              {/* Indicadores de contraseña */}
              {password.length > 0 && (
                <div className="mt-3 space-y-2 bg-navy-50 rounded-xl p-3">
                  <div className={`flex items-center gap-2 text-sm ${passwordChecks.length ? 'text-emerald-600' : 'text-navy-400'}`}>
                    <CheckCircle className={`h-4 w-4 ${passwordChecks.length ? 'text-emerald-500' : 'text-navy-300'}`} />
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${passwordChecks.letter ? 'text-emerald-600' : 'text-navy-400'}`}>
                    <CheckCircle className={`h-4 w-4 ${passwordChecks.letter ? 'text-emerald-500' : 'text-navy-300'}`} />
                    <span>Al menos una letra</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${passwordChecks.number ? 'text-emerald-600' : 'text-navy-400'}`}>
                    <CheckCircle className={`h-4 w-4 ${passwordChecks.number ? 'text-emerald-500' : 'text-navy-300'}`} />
                    <span>Al menos un número</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-navy-50 border border-navy-200 rounded-xl text-navy-900 placeholder-navy-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
              {confirmPassword.length > 0 && (
                <div className={`flex items-center gap-2 text-sm mt-2 ${passwordChecks.match ? 'text-emerald-600' : 'text-red-500'}`}>
                  <CheckCircle className={`h-4 w-4 ${passwordChecks.match ? 'text-emerald-500' : 'text-red-400'}`} />
                  <span>{passwordChecks.match ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              disabled={isLoading || !isPasswordValid || !passwordChecks.match}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta Gratis'
              )}
            </button>
          </form>

          <p className="text-xs text-navy-400 text-center mt-4">
            Al registrarte aceptas nuestros términos de servicio y política de privacidad
          </p>

          <div className="mt-6 pt-6 border-t border-navy-100 text-center">
            <p className="text-navy-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                Inicia sesión
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
