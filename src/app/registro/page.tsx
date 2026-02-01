'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function RegistroPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const formatTelefono = (value: string) => {
    // Solo permitir números y +
    const cleaned = value.replace(/[^\d+]/g, '');
    return cleaned.slice(0, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!/[A-Za-z]/.test(password)) {
      setError('La contraseña debe contener al menos una letra');
      return;
    }

    if (!/\d/.test(password)) {
      setError('La contraseña debe contener al menos un número');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register(email, password, nombre, telefono);
      setUser(response.user);
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Error al crear la cuenta';
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

        {/* Card de Registro */}
        <div className="bg-[#1E293B] rounded-2xl p-8 border border-white/10 shadow-xl">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Crear cuenta
          </h1>
          <p className="text-[#94A3B8] text-center mb-6">
            Únete a NeuroTips y mejora tus apuestas
          </p>

          {/* Badge Trial */}
          <div className="bg-[#00D1B2]/10 border border-[#00D1B2]/30 rounded-xl p-3 mb-6 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-[#00D1B2] flex-shrink-0" />
            <p className="text-sm text-[#00D1B2]">
              <span className="font-semibold">3 días gratis</span> - Sin tarjeta de crédito
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#64748B]" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-[#0F172A] border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:ring-2 focus:ring-[#00D1B2] focus:border-transparent outline-none transition-all"
                  placeholder="Tu nombre"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Teléfono <span className="text-[#64748B]">(opcional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#64748B]" />
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(formatTelefono(e.target.value))}
                  className="w-full px-4 py-3 pl-12 bg-[#0F172A] border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:ring-2 focus:ring-[#00D1B2] focus:border-transparent outline-none transition-all"
                  placeholder="+56 9 1234 5678"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#64748B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-[#0F172A] border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:ring-2 focus:ring-[#00D1B2] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Mínimo 8 caracteres, al menos una letra y un número
              </p>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#64748B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-[#0F172A] border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:ring-2 focus:ring-[#00D1B2] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Términos */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terminos"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/10 bg-[#0F172A] text-[#00D1B2] focus:ring-[#00D1B2] focus:ring-offset-0"
                disabled={isLoading}
              />
              <label htmlFor="terminos" className="text-sm text-[#94A3B8]">
                Acepto los{' '}
                <Link href="/terminos" className="text-[#00D1B2] hover:underline">
                  términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link href="/privacidad" className="text-[#00D1B2] hover:underline">
                  política de privacidad
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#00D1B2] hover:bg-[#00B89F] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isLoading || !aceptaTerminos}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta gratis'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-[#94A3B8]">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-[#00D1B2] hover:text-[#00B89F] font-semibold transition-colors">
                Inicia sesión
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
