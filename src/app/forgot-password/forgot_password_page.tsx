'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://franciscoanalistadeportivo.pythonanywhere.com';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Error al procesar la solicitud');
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
                ¡Revisa tu correo!
              </h1>
              <p className="text-[#94A3B8] mb-6">
                Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
              </p>
              <p className="text-[#64748B] text-sm mb-6">
                No olvides revisar tu carpeta de spam.
              </p>
              <Link 
                href="/login"
                className="inline-flex items-center gap-2 text-[#00D1B2] hover:text-[#00B89F] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            // Formulario
            <>
              <h1 className="text-2xl font-bold text-white text-center mb-2">
                ¿Olvidaste tu contraseña?
              </h1>
              <p className="text-[#94A3B8] text-center mb-8">
                Ingresa tu email y te enviaremos instrucciones para restablecerla.
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

                <button
                  type="submit"
                  className="w-full py-4 bg-[#00D1B2] hover:bg-[#00B89F] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar instrucciones'
                  )}
                </button>
              </form>

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
