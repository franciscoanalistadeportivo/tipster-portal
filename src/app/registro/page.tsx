'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Eye, EyeOff, ArrowRight, CheckCircle, Loader2, MessageCircle, Phone } from 'lucide-react';
import { getFingerprint } from '@/lib/fingerprint';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const GOOGLE_CLIENT_ID = '644626606903-sm4b1s17p31c53esf4bbk5mm5q639emq.apps.googleusercontent.com';
const LOGO_URL = "/logo.png";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://franciscoanalistadeportivo.pythonanywhere.com';

export default function RegistroPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    getFingerprint().then(fp => setDeviceFingerprint(fp)).catch(() => {});
    // ★ Detectar WebView de Telegram, Instagram, Facebook, WhatsApp
    const ua = navigator.userAgent || '';
    setIsInAppBrowser(/Telegram|Instagram|FBAN|FBAV|WhatsApp|Line\/|wv|WebView/i.test(ua));
  }, []);

  // Google OAuth
  const initializeGoogle = () => {
    try {
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      setGoogleReady(true);
    } catch (e) { console.error('Google init error:', e); }
  };

  const handleGoogleResponse = async (response: any) => {
    if (!response.credential) { setError('No se recibió respuesta de Google'); setGoogleLoading(false); return; }
    setGoogleLoading(true); setError('');
    try {
      const data = await authAPI.socialLogin('google', response.credential);
      setUser(data.user);
      router.push('/comunidad');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse con Google');
    } finally { setGoogleLoading(false); }
  };

  const handleGoogleClick = () => {
    if (!googleReady) { setError('Google Sign-In cargando... Intenta de nuevo.'); return; }
    setGoogleLoading(true); setError('');
    try {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false);
        }
      });
    } catch (e) { setError('Error al abrir Google Sign-In'); setGoogleLoading(false); }
  };

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
          password: formData.password,
          fingerprint: deviceFingerprint
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        router.push('/comunidad');
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
    <>
      {!isInAppBrowser && (
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => initializeGoogle()} />
      )}

      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-8">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(#00FF88 1px, transparent 1px), linear-gradient(90deg, #00FF88 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="w-full max-w-md relative">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <div className="w-24 h-24 mx-auto mb-3 rounded-2xl overflow-hidden bg-[#0A0A0A] border-2 border-[#00FF88]/30 p-3 shadow-lg shadow-[#00FF88]/10">
                <img src={LOGO_URL} alt="NeuroTips" className="w-full h-full object-contain" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-1">Crear cuenta</h1>
            <p className="text-[#94A3B8] text-sm">Únete a NeuroTips y mejora tus apuestas</p>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-center gap-2 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-full px-4 py-2.5 mb-6">
              <CheckCircle className="h-4 w-4 text-[#00FF88]" />
              <span className="text-[#00FF88] font-semibold text-sm">5 días gratis</span>
              <span className="text-[#94A3B8] text-sm">- Sin tarjeta de crédito</span>
            </div>

            {/* ★ Banner WebView — abrir en navegador externo */}
            {isInAppBrowser && (
              <div className="mb-5 rounded-xl p-4 text-center" style={{
                background: 'rgba(255, 187, 0, 0.08)',
                border: '1px solid rgba(255, 187, 0, 0.25)',
              }}>
                <p className="text-[#FFBB00] text-xs font-bold mb-2">⚠️ Estás en un navegador integrado</p>
                <p className="text-[#94A3B8] text-[11px] mb-3">Google Sign-In no funciona aquí. Abre en tu navegador para usar todas las funciones.</p>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(url, '_system');
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(url).catch(() => {});
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg, #00FF88, #0EA5E9)', color: '#050505' }}
                >
                  🌐 Abrir en navegador
                </button>
                <p className="text-[#64748B] text-[10px] mt-2">O regístrate con email abajo ↓</p>
              </div>
            )}

            {/* Google Button — solo si NO es WebView */}
            {!isInAppBrowser && (
              <button onClick={handleGoogleClick} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-semibold text-sm transition-all hover:bg-white/10 disabled:opacity-50 mb-5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}>
                {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>Registrarse con Google</span>
              </button>
            )}

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[#64748B] text-xs uppercase">o con email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Nombre completo</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Tu nombre"
                  className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-[#64748B] focus:border-[#00FF88] focus:outline-none transition text-sm" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-[#64748B] focus:border-[#00FF88] focus:outline-none transition text-sm" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Teléfono <span className="text-[#64748B]">(opcional)</span></label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+56 9 1234 5678"
                  className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-[#64748B] focus:border-[#00FF88] focus:outline-none transition text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Contraseña</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                    className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-[#64748B] focus:border-[#00FF88] focus:outline-none transition pr-12 text-sm" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Confirmar contraseña</label>
                <div className="relative">
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                    className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-[#64748B] focus:border-[#00FF88] focus:outline-none transition pr-12 text-sm" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading || googleLoading}
                className="w-full bg-[#00FF88] hover:bg-[#00E07A] disabled:bg-[#00FF88]/50 text-[#050505] font-bold py-3.5 rounded-lg transition flex items-center justify-center gap-2 mt-6">
                {isLoading ? (<><Loader2 className="h-5 w-5 animate-spin" />Creando cuenta...</>) : (<>Crear cuenta gratis<ArrowRight className="h-5 w-5" /></>)}
              </button>
            </form>

            <p className="text-[#64748B] text-xs text-center mt-5">
              Al registrarte aceptas nuestros <Link href="/terminos" className="text-[#00FF88] hover:underline">Términos</Link> y <Link href="/privacidad" className="text-[#00FF88] hover:underline">Privacidad</Link>
            </p>

            <div className="mt-5 pt-5 border-t border-white/10 text-center">
              <p className="text-[#94A3B8] text-sm">¿Ya tienes cuenta? <Link href="/login" className="text-[#00FF88] font-semibold hover:underline">Inicia sesión</Link></p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mt-5">
            <a href="https://t.me/IaNeuroTips" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition hover:bg-[#0EA5E9]/10"
              style={{ color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.25)' }}>
              <MessageCircle className="h-3.5 w-3.5" />Telegram
            </a>
            <a href="https://wa.me/56978516119?text=Hola%20NeuroTips%20quiero%20info" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition hover:bg-[#22C55E]/10"
              style={{ color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}>
              <Phone className="h-3.5 w-3.5" />WhatsApp
            </a>
          </div>

          <div className="text-center mt-5">
            <Link href="/" className="text-[#64748B] hover:text-white transition text-sm">← Volver al inicio</Link>
          </div>
        </div>

        <a href="https://wa.me/56978516119?text=Hola%20NeuroTips%20quiero%20info" target="_blank" rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
          style={{ background: '#22C55E', boxShadow: '0 4px 20px rgba(34,197,94,0.4)' }} aria-label="WhatsApp">
          <Phone className="h-6 w-6 text-white" />
        </a>
      </div>
    </>
  );
}
