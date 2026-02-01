'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

const LOGO_URL = "/logo.png";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://franciscoanalistadeportivo.pythonanywhere.com';

export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono || null,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login?registered=true');
      } else {
        setError(data.error || 'Error al crear la cuenta');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-8">
      {/* Fondo */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(#00FF88 1px, transparent 1px), linear-gradient(90deg, #00FF88 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="w-full max-w-md relative">
        {/* LOGO OPTIMIZADO - Contenedor con borde */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <div className="w-24 h-24 mx-auto mb-3 rounded-2xl overflow-hidden bg-[#0A0A0A] border-2 border-[#00FF88]/30 p-3 shadow-lg shadow-[#00FF88]/10">
              <img 
                src={LOGO_URL} 
                alt="NeuroTips" 
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Crear cuenta</h1>
          <p className="text-[#94A3B8] text-sm">Únete a NeuroTips y mejora tus apuestas</p>
        </div>

        {/* CARD */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8">
          {/* Badge 5 días gratis */}
          <div className="flex items-center justify-center gap-2 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-full px-4 py-2.5 mb-6">
            <CheckCircle className="h-4 w-4 text-[#00FF88]" />
            <span className="text-[#00FF88] font-semibold text-sm">5 días gratis</span>
            <span className="text-[#94A3B8] text-sm">- Sin tarjeta de crédito</span>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-[#64748B] focus:border-[#00FF88] focus:outline-none transition text-sm"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-[#64748B] focus:border-[#00FF88] focus:outline-none transition text-sm"
                required
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                Teléfono <span className="text-[#64748B]">(opcional)</span>
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-[#64748B] focus:border-[#00FF88] focus:outline-none transition text-sm"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-[#64748B] focus:border-[#00FF88] focus:outline-none transition pr-12 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-[#64748B] focus:border-[#00FF88] focus:outline-none transition pr-12 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00FF88] hover:bg-[#00E07A] disabled:bg-[#00FF88]/50 text-[#050505] font-bold py-3.5 rounded-lg transition flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta gratis
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Términos */}
          <p className="text-[#64748B] text-xs text-center mt-5">
            Al registrarte aceptas nuestros{' '}
            <Link href="/terminos" className="text-[#00FF88] hover:underline">
              Términos
            </Link>{' '}
            y{' '}
            <Link href="/privacidad" className="text-[#00FF88] hover:underline">
              Privacidad
            </Link>
          </p>

          {/* Link login */}
          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <p className="text-[#94A3B8] text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-[#00FF88] font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Volver */}
        <div className="text-center mt-5">
          <Link href="/" className="text-[#64748B] hover:text-white transition text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
