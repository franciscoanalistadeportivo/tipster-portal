'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
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

    // Validaciones
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
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Trophy className="h-10 w-10 text-yellow-400" />
            <span className="text-3xl font-bold text-white">Tipster Portal</span>
          </Link>
        </div>

        {/* Card de Registro */}
        <div className="card animate-fadeIn">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Crear Cuenta
            </h1>
            <p className="text-gray-600 mt-1">
              <span className="text-green-600 font-semibold">5 días gratis</span> sin compromiso
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Tu nombre"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="tu@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {/* Indicadores de contraseña */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className={`flex items-center gap-2 text-sm ${passwordChecks.length ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="h-4 w-4" />
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${passwordChecks.letter ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="h-4 w-4" />
                    <span>Al menos una letra</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${passwordChecks.number ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="h-4 w-4" />
                    <span>Al menos un número</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
              {confirmPassword.length > 0 && (
                <div className={`flex items-center gap-2 text-sm mt-2 ${passwordChecks.match ? 'text-green-600' : 'text-red-500'}`}>
                  <CheckCircle className="h-4 w-4" />
                  <span>{passwordChecks.match ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
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

          <p className="text-xs text-gray-500 text-center mt-4">
            Al registrarte aceptas nuestros términos de servicio y política de privacidad
          </p>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Volver */}
        <div className="text-center mt-6">
          <Link href="/" className="text-primary-200 hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
