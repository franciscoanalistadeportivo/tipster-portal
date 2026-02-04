'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, TrendingUp,
  Shield, Zap, Crown, CheckCircle, MessageCircle, Phone,
  Brain, Target, BarChart3, Loader2
} from 'lucide-react';
import { authAPI, setTokens } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

// ============================================================================
// OAuth Client IDs
// ============================================================================
const GOOGLE_CLIENT_ID = '644626606903-sm4b1s17p31c53esf4bbk5mm5q639emq.apps.googleusercontent.com';
const FACEBOOK_APP_ID = '696863110114650';

const API = process.env.NEXT_PUBLIC_API_URL || '';

// ─── Stats reales verificadas (547 apuestas, 9 tipsters) ───
const STATS = [
  { value: '71.1%', label: 'Mejor Win Rate', icon: Target, color: '#00D1B2' },
  { value: '+25', label: 'Tipsters IA', icon: Brain, color: '#0EA5E9' },
  { value: '547+', label: 'Apuestas Registradas', icon: BarChart3, color: '#FFBB00' },
  { value: '+8.4%', label: 'ROI Promedio', icon: TrendingUp, color: '#A78BFA' },
];

const FEATURES = [
  { text: 'Análisis con Inteligencia Artificial', icon: Brain },
  { text: 'Picks verificados con historial real', icon: CheckCircle },
  { text: 'Alertas en tiempo real por Telegram', icon: Zap },
  { text: 'Sala VIP con picks exclusivos', icon: Crown },
];

const HIGHLIGHTS = [
  { label: 'Punto de Quiebre', text: 'Racha de 12 victorias consecutivas en tenis. 71.1% Win Rate con +20.8% ROI verificado.', stat: '🎾 #1 Tipster' },
  { label: 'Goleador Pro', text: '100% efectividad en Under Goles. 69% Win Rate general con ROI de +17.8%.', stat: '⚽ Top 2' },
  { label: 'Sistema IA', text: '+25 tipsters monitoreados con IA. Análisis de 547+ apuestas con filtros de valor esperado y stake óptimo.', stat: '🧠 +8.4% ROI' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeHighlight, setActiveHighlight] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  // Social login states
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [fbReady, setFbReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveHighlight((prev) => (prev + 1) % HIGHLIGHTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ════════════════════════════════════════════════════
  // GOOGLE OAUTH
  // ════════════════════════════════════════════════════
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
    if (!response.credential) { setError('No se recibió respuesta de Google'); setSocialLoading(null); return; }
    setSocialLoading('google'); setError('');
    try {
      const data = await authAPI.socialLogin('google', response.credential);
      setUser(data.user);
      if (data.is_new_user) {
        router.push('/comunidad');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión con Google');
    } finally { setSocialLoading(null); }
  };

  const handleGoogleClick = () => {
    if (!googleReady) { setError('Google Sign-In aún no está listo. Intenta de nuevo.'); return; }
    setSocialLoading('google'); setError('');
    try {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setSocialLoading(null);
        }
      });
    } catch (e) { setError('Error al abrir Google Sign-In'); setSocialLoading(null); }
  };

  // ════════════════════════════════════════════════════
  // FACEBOOK OAUTH
  // ════════════════════════════════════════════════════
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).FB) {
      // Load Facebook SDK manually
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/es_LA/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        (window as any).FB.init({ 
          appId: FACEBOOK_APP_ID, 
          cookie: true, 
          xfbml: true, 
          version: 'v18.0' 
        });
        setFbReady(true);
      };
      document.body.appendChild(script);
    } else if ((window as any).FB) {
      setFbReady(true);
    }
  }, []);

  const handleFacebookClick = () => {
    if (!(window as any).FB) { 
      // Try to initialize if not ready
      setError('Cargando Facebook... Intenta de nuevo en 2 segundos.');
      return; 
    }
    setSocialLoading('facebook'); setError('');
    (window as any).FB.login(async (response: any) => {
      if (response.authResponse) {
        try {
          const data = await authAPI.socialLogin('facebook', response.authResponse.accessToken);
          setUser(data.user);
          if (data.is_new_user) {
            router.push('/comunidad');
          } else {
            router.push('/dashboard');
          }
        } catch (err: any) { setError(err.response?.data?.error || 'Error al iniciar sesión con Facebook'); }
      } else { setError('Inicio de sesión con Facebook cancelado'); }
      setSocialLoading(null);
    }, { scope: 'email,public_profile' });
  };

  // ════════════════════════════════════════════════════
  // EMAIL/PASSWORD LOGIN
  // ════════════════════════════════════════════════════
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Completa todos los campos'); return; }
    setLoading(true); setError('');

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        router.push('/dashboard');
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Google Script */}
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => initializeGoogle()} />

      <div className="min-h-screen flex" style={{ background: '#0B0F1A' }}>

        {/* ════════════════════════════════════════════════════ */}
        {/* LEFT PANEL - Marketing / Social Proof               */}
        {/* ════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
          style={{ background: 'linear-gradient(145deg, #0B0F1A 0%, #0F172A 50%, #0B1120 100%)' }}>

          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(0,209,178,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,178,0.5) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
              }} />
            <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(0,209,178,0.08) 0%, transparent 70%)', animation: mounted ? 'float 8s ease-in-out infinite' : 'none' }} />
            <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,187,0,0.06) 0%, transparent 70%)', animation: mounted ? 'float 10s ease-in-out 2s infinite reverse' : 'none' }} />
            <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)', animation: mounted ? 'float 12s ease-in-out 4s infinite' : 'none' }} />
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <line x1="10%" y1="20%" x2="40%" y2="60%" stroke="#00D1B2" strokeWidth="0.5" strokeDasharray="4 8"><animate attributeName="stroke-dashoffset" values="0;100" dur="20s" repeatCount="indefinite" /></line>
              <line x1="60%" y1="10%" x2="30%" y2="80%" stroke="#FFBB00" strokeWidth="0.5" strokeDasharray="4 8"><animate attributeName="stroke-dashoffset" values="0;100" dur="25s" repeatCount="indefinite" /></line>
              <line x1="80%" y1="30%" x2="50%" y2="90%" stroke="#0EA5E9" strokeWidth="0.5" strokeDasharray="4 8"><animate attributeName="stroke-dashoffset" values="0;100" dur="18s" repeatCount="indefinite" /></line>
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-20px)', transition: 'all 0.8s ease' }}>
              <img src="/logo.png" alt="NeuroTips" className="w-14 h-14 rounded-xl" style={{ boxShadow: '0 0 30px rgba(0,209,178,0.3)' }} />
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #00D1B2, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NeuroTips</h1>
                <p className="text-[10px] text-[#64748B] tracking-[0.2em] uppercase">Análisis con IA</p>
              </div>
            </div>
            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.2s' }}>
              <h2 className="text-5xl font-black text-white leading-[1.1] mb-6" style={{ fontFamily: 'system-ui' }}>
                Decisiones<br />
                <span style={{ background: 'linear-gradient(135deg, #00D1B2, #FFBB00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>inteligentes,</span><br />
                resultados<br />
                <span className="text-[#FFBB00]">rentables.</span>
              </h2>
              <p className="text-[#94A3B8] text-lg leading-relaxed max-w-md">
                La plataforma de análisis deportivo impulsada por inteligencia artificial que está cambiando las reglas del juego.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-4 gap-4 my-10"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.4s' }}>
            {STATS.map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl" style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(100, 116, 139, 0.1)' }}>
                <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                <div className="text-xl font-black text-white">{stat.value}</div>
                <div className="text-[10px] text-[#64748B] uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="relative z-10 grid grid-cols-2 gap-3"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.6s' }}>
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(100, 116, 139, 0.08)' }}>
                <feature.icon className="w-4 h-4 text-[#00D1B2]" />
                <span className="text-xs text-[#94A3B8]">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Highlight carousel */}
          <div className="relative z-10 mt-10 p-5 rounded-xl" style={{ background: 'rgba(0, 209, 178, 0.05)', border: '1px solid rgba(0, 209, 178, 0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#00D1B2] uppercase tracking-wider">{HIGHLIGHTS[activeHighlight].label}</span>
              <span className="text-xs text-[#FFBB00] font-bold">{HIGHLIGHTS[activeHighlight].stat}</span>
            </div>
            <p className="text-sm text-[#94A3B8] leading-relaxed">{HIGHLIGHTS[activeHighlight].text}</p>
            <div className="flex gap-1.5 mt-4">
              {HIGHLIGHTS.map((_, i) => (
                <div key={i} className="h-1 rounded-full transition-all duration-300" style={{ width: i === activeHighlight ? '24px' : '8px', background: i === activeHighlight ? '#00D1B2' : 'rgba(100, 116, 139, 0.3)' }} />
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════ */}
        {/* RIGHT PANEL - Login Form                            */}
        {/* ════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <img src="/logo.png" alt="NeuroTips" className="w-16 h-16 mx-auto rounded-xl mb-3" style={{ boxShadow: '0 0 20px rgba(0,209,178,0.2)' }} />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white mb-2">Bienvenido</h2>
              <p className="text-[#64748B] text-sm">Ingresa a tu cuenta para continuar</p>
            </div>

            {/* ★ SOCIAL LOGIN BUTTONS */}
            <div className="space-y-3 mb-6">
              <button onClick={handleGoogleClick} disabled={socialLoading !== null}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                {socialLoading === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>Continuar con Google</span>
              </button>

              <button onClick={handleFacebookClick} disabled={socialLoading !== null}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: '#1877F2', color: 'white' }}>
                {socialLoading === 'facebook' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                <span>Continuar con Facebook</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px" style={{ background: 'rgba(100, 116, 139, 0.15)' }} />
              <span className="text-[10px] text-[#475569] uppercase tracking-wider">O con email</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(100, 116, 139, 0.15)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] group-focus-within:text-[#00D1B2] transition-colors" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="tu@email.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-[#475569] outline-none transition-all"
                    style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(100, 116, 139, 0.2)' }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(0, 209, 178, 0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(100, 116, 139, 0.2)'} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] group-focus-within:text-[#00D1B2] transition-colors" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white placeholder-[#475569] outline-none transition-all"
                    style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(100, 116, 139, 0.2)' }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(0, 209, 178, 0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(100, 116, 139, 0.2)'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8] transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/recuperar" className="text-xs text-[#00D1B2] hover:text-[#00E8C8] transition-colors">¿Olvidaste tu contraseña?</Link>
              </div>

              {error && (
                <div className="rounded-lg p-3 text-xs text-red-400 flex items-center gap-2" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <Shield className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #00D1B2, #0EA5E9)', color: '#FFF', boxShadow: '0 4px 20px rgba(0, 209, 178, 0.3)' }}>
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (<>Iniciar Sesión<ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>

            {/* Community links */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px" style={{ background: 'rgba(100, 116, 139, 0.15)' }} />
              <span className="text-[10px] text-[#475569] uppercase tracking-wider">Comunidad</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(100, 116, 139, 0.15)' }} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <a href="https://t.me/IaNeuroTips" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.25)', color: '#0EA5E9' }}>
                <MessageCircle className="w-4 h-4" />Telegram
              </a>
              <a href="https://wa.me/56978516119?text=Hola%20NeuroTips%20quiero%20info" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', color: '#22C55E' }}>
                <Phone className="w-4 h-4" />WhatsApp
              </a>
            </div>

            {/* Register CTA */}
            <div className="text-center space-y-4">
              <p className="text-sm text-[#64748B]">¿No tienes cuenta? <Link href="/registro" className="font-bold text-[#00D1B2] hover:text-[#00E8C8] transition-colors">Regístrate gratis</Link></p>
              <Link href="/registro" className="block w-full py-3 rounded-xl text-xs font-bold text-center transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, rgba(255, 187, 0, 0.08), rgba(249, 115, 22, 0.05))', border: '1px solid rgba(255, 187, 0, 0.2)', color: '#FFBB00' }}>
                <span className="flex items-center justify-center gap-2"><Crown className="w-4 h-4" />Empieza con 5 días Premium gratis<ArrowRight className="w-3 h-3" /></span>
              </Link>
            </div>

            {/* Footer */}
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/" className="text-[10px] text-[#475569] hover:text-[#94A3B8] transition-colors">← Volver al inicio</Link>
              <span className="text-[#1E293B]">·</span>
              <span className="text-[10px] text-[#475569]"><Shield className="w-3 h-3 inline mr-1" />Conexión segura SSL</span>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(2deg); }
          }
          input:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 30px #1E293B inset !important;
            -webkit-text-fill-color: #FFF !important;
            transition: background-color 5000s ease-in-out 0s;
          }
        `}</style>
      </div>
    </>
  );
}
