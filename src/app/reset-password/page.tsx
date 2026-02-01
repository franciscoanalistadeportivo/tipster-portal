'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, AlertCircle, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://franciscoanalistadeportivo.pythonanywhere.com';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token inválido o faltante');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
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

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
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

        {/* Card */}
        <div className="bg-[#1E293B] rounded-2xl p-8 border border-white/10 shadow-xl">
          {success ? (
            // Mensaje de éxito
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00D1B2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-[#00D1B2]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                ¡Contraseña actualizada!
              </h1>
              <p className="text-[#94A3B8] mb-6">
                Tu contraseña ha sido restablecida correctamente. Serás redirigido al inicio de sesión...
              </p>
              <div className="flex items-center justify-center gap-2 text-[#64748B]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Redirigiendo...</span>
              </div>
            </div>
          ) : (
            // Formulario
            <>
              <h1 className="text-2xl font-bold text-white text-center mb-2">
                Nueva contraseña
              </h1>
              <p className="text-[#94A3B8] text-center mb-8">
                Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {!token ? (
                <div className="text-center">
                  <p className="text-[#94A3B8] mb-4">
                    El enlace no es válido o ha expirado.
                  </p>
                  <Link 
                    href="/forgot-password"
                    className="text-[#00D1B2] hover:text-[#00B89F] transition-colors"
                  >
                    Solicitar nuevo enlace
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                      Nueva contraseña
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
                    <p className="text-xs text-[#64748B] mt-2">
                      Mínimo 8 caracteres, al menos una letra y un número
                    </p>
                  </div>

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

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#00D1B2] hover:bg-[#00B89F] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      'Restablecer contraseña'
                    )}
                  </button>
                </form>
              )}

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00D1B2]" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
