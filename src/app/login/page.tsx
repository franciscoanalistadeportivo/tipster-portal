'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, TrendingUp,
  Shield, Zap, Crown, CheckCircle, MessageCircle, Phone,
  Brain, Target, BarChart3, Users
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || '';

// ─── Stats animadas ───
const STATS = [
  { value: '68%', label: 'Win Rate', icon: Target, color: '#00D1B2' },
  { value: '24', label: 'Tipsters IA', icon: Brain, color: '#0EA5E9' },
  { value: '+1.5K', label: 'Miembros', icon: Users, color: '#FFBB00' },
  { value: '95%', label: 'Satisfacción', icon: TrendingUp, color: '#A78BFA' },
];

const FEATURES = [
  { text: 'Análisis con Inteligencia Artificial', icon: Brain },
  { text: 'Picks verificados con historial real', icon: CheckCircle },
  { text: 'Alertas en tiempo real por Telegram', icon: Zap },
  { text: 'Sala VIP con picks exclusivos', icon: Crown },
];

const TESTIMONIALS = [
  { name: 'Carlos M.', text: 'El análisis de IA cambió completamente mi forma de apostar. Resultados reales.', profit: '+$340K' },
  { name: 'Diego R.', text: 'La Sala VIP vale cada peso. Los picks tienen una efectividad brutal.', profit: '+$180K' },
  { name: 'Andrés P.', text: 'El canal de Telegram es oro. Alertas al instante y análisis detallado.', profit: '+$95K' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
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
    <div className="min-h-screen flex" style={{ background: '#0B0F1A' }}>

      {/* ════════════════════════════════════════════════════ */}
      {/* LEFT PANEL - Marketing / Social Proof               */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(145deg, #0B0F1A 0%, #0F172A 50%, #0B1120 100%)',
        }}>

        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,209,178,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,178,0.5) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }} />

          {/* Glowing orbs */}
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0,209,178,0.08) 0%, transparent 70%)',
              animation: mounted ? 'float 8s ease-in-out infinite' : 'none',
            }} />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,187,0,0.06) 0%, transparent 70%)',
              animation: mounted ? 'float 10s ease-in-out 2s infinite reverse' : 'none',
            }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)',
              animation: mounted ? 'float 12s ease-in-out 4s infinite' : 'none',
            }} />

          {/* Animated lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="20%" x2="40%" y2="60%" stroke="#00D1B2" strokeWidth="0.5" strokeDasharray="4 8">
              <animate attributeName="stroke-dashoffset" values="0;100" dur="20s" repeatCount="indefinite" />
            </line>
            <line x1="60%" y1="10%" x2="30%" y2="80%" stroke="#FFBB00" strokeWidth="0.5" strokeDasharray="4 8">
              <animate attributeName="stroke-dashoffset" values="0;100" dur="25s" repeatCount="indefinite" />
            </line>
            <line x1="80%" y1="30%" x2="50%" y2="90%" stroke="#0EA5E9" strokeWidth="0.5" strokeDasharray="4 8">
              <animate attributeName="stroke-dashoffset" values="0;100" dur="18s" repeatCount="indefinite" />
            </line>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-20px)', transition: 'all 0.8s ease' }}>
            <img src="/logo.png" alt="NeuroTips" className="w-14 h-14 rounded-xl"
              style={{ boxShadow: '0 0 30px rgba(0,209,178,0.3)' }} />
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{
                background: 'linear-gradient(135deg, #00D1B2, #0EA5E9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>NeuroTips</h1>
              <p className="text-[10px] text-[#64748B] tracking-[0.2em] uppercase">Análisis con IA</p>
            </div>
          </div>

          {/* Headline */}
          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.2s' }}>
            <h2 className="text-5xl font-black text-white leading-[1.1] mb-6" style={{ fontFamily: 'system-ui' }}>
              Decisiones
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #00D1B2, #FFBB00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>inteligentes,</span>
              <br />
              resultados
              <br />
              <span className="text-[#FFBB00]">rentables.</span>
            </h2>
            <p className="text-[#94A3B8] text-lg leading-relaxed max-w-md">
              La plataforma de análisis deportivo impulsada por inteligencia artificial
              que está cambiando las reglas del juego.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-4 gap-4 my-10"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.4s' }}>
          {STATS.map((stat, i) => (
            <div key={i} className="rounded-xl p-4 text-center"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid rgba(100, 116, 139, 0.15)',
                backdropFilter: 'blur(10px)',
              }}>
              <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-3 mb-8"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.5s' }}>
          {FEATURES.map((feat, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0, 209, 178, 0.1)' }}>
                <feat.icon className="w-4 h-4 text-[#00D1B2]" />
              </div>
              <p className="text-sm text-[#CBD5E1]">{feat.text}</p>
            </div>
          ))}
        </div>

        {/* Testimonial carousel */}
        <div className="relative z-10"
          style={{ opacity: mounted ? 1 : 0, transition: 'all 0.8s ease 0.6s' }}>
          <div className="rounded-xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
              border: '1px solid rgba(100, 116, 139, 0.15)',
            }}>
            <div className="flex items-start gap-3">
              <div className="text-3xl opacity-20 text-[#00D1B2]">&ldquo;</div>
              <div className="flex-1">
                <p className="text-sm text-[#CBD5E1] italic leading-relaxed mb-3"
                  style={{ transition: 'all 0.5s ease' }}>
                  {TESTIMONIALS[activeTestimonial].text}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#64748B]">— {TESTIMONIALS[activeTestimonial].name}</p>
                  <span className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(0, 209, 178, 0.15)', color: '#00D1B2' }}>
                    {TESTIMONIALS[activeTestimonial].profit}
                  </span>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex gap-1.5 justify-center mt-4">
              {TESTIMONIALS.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    background: i === activeTestimonial ? '#00D1B2' : 'rgba(100, 116, 139, 0.3)',
                    width: i === activeTestimonial ? '16px' : '6px',
                  }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL - Login Form                            */}
      {/* ════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center px-6 py-12 relative"
        style={{
          background: 'linear-gradient(180deg, #0F172A 0%, #0B0F1A 100%)',
        }}>

        {/* Subtle glow */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,209,178,0.3), transparent)' }} />

        <div className="w-full max-w-sm"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease 0.3s' }}>

          {/* Mobile logo (hidden on desktop) */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-10">
            <img src="/logo.png" alt="NeuroTips" className="w-14 h-14 rounded-xl"
              style={{ boxShadow: '0 0 30px rgba(0,209,178,0.3)' }} />
            <div>
              <h1 className="text-2xl font-black" style={{
                background: 'linear-gradient(135deg, #00D1B2, #0EA5E9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>NeuroTips</h1>
              <p className="text-[10px] text-[#64748B] tracking-[0.2em] uppercase">Análisis con IA</p>
            </div>
          </div>

          {/* Welcome */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Bienvenido</h2>
            <p className="text-[#64748B] text-sm">Ingresa a tu cuenta para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] group-focus-within:text-[#00D1B2] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="tu@email.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-[#475569] outline-none transition-all"
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(100, 116, 139, 0.2)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(0, 209, 178, 0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(100, 116, 139, 0.2)'}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] group-focus-within:text-[#00D1B2] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white placeholder-[#475569] outline-none transition-all"
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(100, 116, 139, 0.2)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(0, 209, 178, 0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(100, 116, 139, 0.2)'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link href="/recuperar" className="text-xs text-[#00D1B2] hover:text-[#00E8C8] transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg p-3 text-xs text-red-400 flex items-center gap-2"
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <Shield className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              style={{
                background: 'linear-gradient(135deg, #00D1B2, #0EA5E9)',
                color: '#FFF',
                boxShadow: '0 4px 20px rgba(0, 209, 178, 0.3)',
              }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px" style={{ background: 'rgba(100, 116, 139, 0.15)' }} />
            <span className="text-[10px] text-[#475569] uppercase tracking-wider">O continúa con</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(100, 116, 139, 0.15)' }} />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <a href="https://t.me/IaNeuroTips" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
              style={{
                background: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                color: '#0EA5E9',
              }}>
              <MessageCircle className="w-4 h-4" />
              Telegram
            </a>
            <a href="https://wa.me/56978516119?text=Hola%20NeuroTips%20quiero%20info" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                color: '#22C55E',
              }}>
              <Phone className="w-4 h-4" />
              WhatsApp
            </a>
          </div>

          {/* Register CTA */}
          <div className="text-center space-y-4">
            <p className="text-sm text-[#64748B]">
              ¿No tienes cuenta?{' '}
              <Link href="/registro" className="font-bold text-[#00D1B2] hover:text-[#00E8C8] transition-colors">
                Regístrate gratis
              </Link>
            </p>

            {/* Premium CTA */}
            <Link href="/registro"
              className="block w-full py-3 rounded-xl text-xs font-bold text-center transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 187, 0, 0.08), rgba(249, 115, 22, 0.05))',
                border: '1px solid rgba(255, 187, 0, 0.2)',
                color: '#FFBB00',
              }}>
              <span className="flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />
                Empieza con 5 días Premium gratis
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/" className="text-[10px] text-[#475569] hover:text-[#94A3B8] transition-colors">
              ← Volver al inicio
            </Link>
            <span className="text-[#1E293B]">·</span>
            <span className="text-[10px] text-[#475569]">
              <Shield className="w-3 h-3 inline mr-1" />
              Conexión segura SSL
            </span>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(2deg); }
        }

        /* Smooth input autofill styling */
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #1E293B inset !important;
          -webkit-text-fill-color: #FFF !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
