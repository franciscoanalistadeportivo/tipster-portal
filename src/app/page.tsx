'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, Star, CheckCircle, ArrowRight, Zap, Target, 
  Brain, Eye, Lock, BarChart3, Menu, X, Crown
} from 'lucide-react';

const LOGO_URL = "/logo.png";
const LOGO_ICON = "/logo-icon.png";

// Contador animado
const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Ticker de ganancias
const GainsTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const gains = [
    { user: "M***el", amount: "+$45,200", tipster: "Goleador Pro" },
    { user: "J***os", amount: "+$12,800", tipster: "Ace Master" },
    { user: "A***na", amount: "+$78,500", tipster: "Slam Dunk" },
    { user: "C***lo", amount: "+$23,100", tipster: "Goleador Pro" },
  ];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % gains.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="inline-flex items-center gap-2 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-full px-3 sm:px-4 py-2">
      <span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" />
      <span className="text-[#00FF88] text-xs sm:text-sm">
        {gains[currentIndex].user} ganó <span className="font-bold">{gains[currentIndex].amount}</span> con {gains[currentIndex].tipster}
      </span>
    </div>
  );
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* ========== HEADER MOBILE-FIRST ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            
            {/* LOGO + TEXTO */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img 
                src={LOGO_ICON}
                alt="NeuroTips"
                style={{ width: '36px', height: '36px', maxWidth: '36px', maxHeight: '36px' }}
                className="rounded-lg flex-shrink-0"
              />
              <span className="font-bold text-white whitespace-nowrap" style={{ fontSize: '16px' }}>
                Neuro<span className="text-[#00FF88]">Tips</span>
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-[#94A3B8] hover:text-white transition text-sm px-3 py-2">
                Iniciar Sesión
              </Link>
              <Link href="/registro" className="bg-[#00FF88] hover:bg-[#00E07A] text-[#050505] font-semibold text-sm py-2.5 px-5 rounded-lg transition">
                Comenzar Gratis
              </Link>
            </div>

            {/* MOBILE - Botón hamburguesa */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* MOBILE MENU DESPLEGABLE */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 py-4 space-y-3">
              <Link 
                href="/login" 
                className="block w-full text-center py-3 text-white border border-white/20 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/registro" 
                className="block w-full text-center py-3 bg-[#00FF88] text-[#050505] font-bold rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Comenzar Gratis
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 relative">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(#00FF88 1px, transparent 1px), linear-gradient(90deg, #00FF88 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        
        <div className="max-w-4xl mx-auto text-center relative">
          {/* Ticker */}
          <div className="mb-6 sm:mb-8">
            <GainsTicker />
          </div>
          
          {/* HEADLINE */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Hacemos lo que el
            <span className="text-[#00FF88] block">ojo humano no ve</span>
          </h1>
          
          {/* SUBTÍTULO */}
          <p className="text-base sm:text-xl text-[#94A3B8] mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
            Nuestro algoritmo detecta patrones de éxito y señales de riesgo 
            antes de que coloques tu dinero.
          </p>

          {/* FRASE IMPACTANTE */}
          <p className="text-base sm:text-lg text-white font-medium mb-8 sm:mb-10 max-w-xl mx-auto border-l-4 border-[#00FF88] pl-4 text-left">
            "No te damos picks; te damos una <span className="text-[#00FF88]">ventaja competitiva injusta</span>."
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#00FF88] font-mono">
                <AnimatedCounter value={847} suffix="K" />
              </p>
              <p className="text-[#94A3B8] text-xs sm:text-sm">Ganados este mes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white font-mono">78%</p>
              <p className="text-[#94A3B8] text-xs sm:text-sm">Win Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white font-mono">24+</p>
              <p className="text-[#94A3B8] text-xs sm:text-sm">Tipsters Analizados</p>
            </div>
          </div>
          
          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <Link href="/registro" className="w-full sm:w-auto bg-[#00FF88] hover:bg-[#00E07A] text-[#050505] font-bold py-4 px-8 rounded-lg transition flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,255,136,0.3)]">
              Comenzar 5 Días Gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-[#64748B] text-sm">Sin tarjeta • Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* ========== PROPUESTA DE VALOR ========== */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-b from-[#050505] to-[#0A0A0A]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#00FF88]/10 to-transparent border border-[#00FF88]/20 rounded-2xl p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <div className="bg-[#00FF88]/20 p-3 rounded-xl">
                <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-[#00FF88]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  ¿Qué hacemos diferente?
                </h2>
                <p className="text-[#94A3B8] text-sm sm:text-base">
                  Seguimos a 24+ tipsters de Telegram y WhatsApp. Registramos TODAS sus apuestas 
                  (las buenas y las malas) y nuestra IA encuentra los patrones que ellos mismos no ven.
                </p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-[#00FF88] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white text-sm">100% Transparente</h4>
                  <p className="text-[#64748B] text-xs mt-1">No borramos apuestas perdidas como hacen otros</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white text-sm">IA Predictiva</h4>
                  <p className="text-[#64748B] text-xs mt-1">Detectamos en qué mercados rinde mejor cada tipster</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-[#3B82F6] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white text-sm">Stake Óptimo</h4>
                  <p className="text-[#64748B] text-xs mt-1">Te decimos cuánto apostar según el historial real</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3 sm:mb-4">
            Tu ventaja competitiva
          </h2>
          <p className="text-[#94A3B8] text-center mb-10 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
            Mientras otros apuestan a ciegas, tú tendrás datos reales y estrategias probadas
          </p>
          
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#00FF88]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-[#00FF88]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">Historial Verificado</h3>
              <p className="text-[#94A3B8] text-xs sm:text-sm">
                Cada apuesta registrada con fecha, cuota y resultado. Sin trucos ni datos falsos.
              </p>
            </div>
            
            <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FFD700]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-[#FFD700]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">Análisis de Rachas</h3>
              <p className="text-[#94A3B8] text-xs sm:text-sm">
                Sabemos cuándo un tipster está en racha ganadora y cuándo es mejor esperar.
              </p>
            </div>
            
            <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 sm:h-7 sm:w-7 text-[#3B82F6]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">Filtro por EV+</h3>
              <p className="text-[#94A3B8] text-xs sm:text-sm">
                Solo ves las apuestas con valor esperado positivo. Adiós al ruido.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TOP TIPSTERS ========== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3 sm:mb-4">
            Top Tipsters del Mes
          </h2>
          <p className="text-[#94A3B8] text-center mb-8 sm:mb-10 text-sm sm:text-base">
            Resultados verificados y actualizados diariamente
          </p>
          
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Top 1 */}
            <div className="bg-gradient-to-b from-[#00FF88]/10 to-[#050505] border border-[#00FF88]/30 rounded-xl p-5 sm:p-6 relative">
              <div className="absolute -top-3 left-4 bg-[#00FF88] text-[#050505] text-xs font-bold px-3 py-1 rounded-full">
                🏆 #1 DEL MES
              </div>
              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center text-lg sm:text-xl">
                  ⚽
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">Goleador Pro</h3>
                  <p className="text-[#94A3B8] text-xs sm:text-sm">Fútbol</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[#00FF88] font-mono font-bold text-sm sm:text-base">+32%</p>
                  <p className="text-[#64748B] text-xs">ROI</p>
                </div>
                <div>
                  <p className="text-white font-mono font-bold text-sm sm:text-base">78%</p>
                  <p className="text-[#64748B] text-xs">Win Rate</p>
                </div>
                <div>
                  <p className="text-[#00FF88] font-mono font-bold text-sm sm:text-base">+8</p>
                  <p className="text-[#64748B] text-xs">Racha</p>
                </div>
              </div>
            </div>
            
            {/* Top 2 */}
            <div className="bg-[#050505] border border-white/10 rounded-xl p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full flex items-center justify-center text-lg sm:text-xl">
                  🎾
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">Ace Master</h3>
                  <p className="text-[#94A3B8] text-xs sm:text-sm">Tenis</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[#00FF88] font-mono font-bold text-sm sm:text-base">+25%</p>
                  <p className="text-[#64748B] text-xs">ROI</p>
                </div>
                <div>
                  <p className="text-white font-mono font-bold text-sm sm:text-base">71%</p>
                  <p className="text-[#64748B] text-xs">Win Rate</p>
                </div>
                <div>
                  <p className="text-[#00FF88] font-mono font-bold text-sm sm:text-base">+5</p>
                  <p className="text-[#64748B] text-xs">Racha</p>
                </div>
              </div>
            </div>
            
            {/* Top 3 */}
            <div className="bg-[#050505] border border-white/10 rounded-xl p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full flex items-center justify-center text-lg sm:text-xl">
                  🏀
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">Slam Dunk</h3>
                  <p className="text-[#94A3B8] text-xs sm:text-sm">NBA</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[#00FF88] font-mono font-bold text-sm sm:text-base">+28%</p>
                  <p className="text-[#64748B] text-xs">ROI</p>
                </div>
                <div>
                  <p className="text-white font-mono font-bold text-sm sm:text-base">68%</p>
                  <p className="text-[#64748B] text-xs">Win Rate</p>
                </div>
                <div>
                  <p className="text-[#00FF88] font-mono font-bold text-sm sm:text-base">+3</p>
                  <p className="text-[#64748B] text-xs">Racha</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6 sm:mt-8">
            <Link href="/registro" className="text-[#00FF88] hover:underline text-sm sm:text-base">
              Ver los 24 tipsters →
            </Link>
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3 sm:mb-4">
            Elige tu plan
          </h2>
          <p className="text-[#94A3B8] text-center mb-8 sm:mb-10 text-sm sm:text-base">
            Sin trucos. Acceso total. Cancela cuando quieras.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {/* MENSUAL */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5 sm:p-6">
              <p className="text-white font-bold text-lg mb-1">Mensual</p>
              <p className="text-[#64748B] text-xs mb-4">30 días</p>
              <div className="mb-5">
                <span className="text-3xl sm:text-4xl font-bold text-white font-mono">$15.000</span>
                <span className="text-[#64748B] text-sm"> /mes</span>
                <p className="text-[#64748B] text-xs mt-1">CLP · o $17 USDT</p>
              </div>
              <ul className="space-y-2 mb-5">
                {['Todos los tipsters', 'Picks con IA', 'Alertas Telegram'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#94A3B8]">
                    <CheckCircle className="h-3.5 w-3.5 text-[#00FF88] flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/registro" className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition border border-[#00FF88]/30 text-[#00FF88] hover:bg-[#00FF88]/10">
                Comenzar Gratis
              </Link>
            </div>

            {/* TRIMESTRAL - POPULAR */}
            <div className="bg-[#0A0A0A] border-2 border-[#00FF88] rounded-xl p-5 sm:p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00FF88] text-[#050505] text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                ⭐ MÁS POPULAR
              </div>
              <p className="text-white font-bold text-lg mb-1 mt-2">Trimestral</p>
              <p className="text-[#64748B] text-xs mb-4">90 días</p>
              <div className="mb-2">
                <span className="text-3xl sm:text-4xl font-bold text-white font-mono">$39.000</span>
                <p className="text-[#64748B] text-xs mt-1">CLP · o $43 USDT</p>
              </div>
              <span className="inline-block mb-4 px-2 py-0.5 rounded text-[10px] font-bold bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30">
                Ahorra 13%
              </span>
              <ul className="space-y-2 mb-5">
                {['Todo lo del plan Mensual', 'Soporte prioritario', 'Estadísticas avanzadas'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#94A3B8]">
                    <CheckCircle className="h-3.5 w-3.5 text-[#00FF88] flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/registro" className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition bg-[#00FF88] hover:bg-[#00E07A] text-[#050505]">
                Comenzar Gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* ANUAL */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5 sm:p-6">
              <p className="text-white font-bold text-lg mb-1">Anual</p>
              <p className="text-[#64748B] text-xs mb-4">365 días</p>
              <div className="mb-2">
                <span className="text-3xl sm:text-4xl font-bold text-white font-mono">$120.000</span>
                <p className="text-[#64748B] text-xs mt-1">CLP · o $130 USDT</p>
              </div>
              <span className="inline-block mb-4 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30">
                Ahorra 33%
              </span>
              <ul className="space-y-2 mb-5">
                {['Acceso completo', 'Academia incluida', 'Mejor precio por mes'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#94A3B8]">
                    <CheckCircle className="h-3.5 w-3.5 text-[#00FF88] flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/registro" className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition border border-[#00FF88]/30 text-[#00FF88] hover:bg-[#00FF88]/10">
                Comenzar Gratis
              </Link>
            </div>
          </div>
          
          <p className="text-center text-[#64748B] text-xs mt-6">
            5 días gratis · Sin tarjeta de crédito · Transferencia bancaria o crypto
          </p>
        </div>
      </section>

      {/* ========== SALA VIP TEASER ========== */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-6 sm:p-10 relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(255,187,0,0.08), rgba(249,115,22,0.05), rgba(10,10,10,0.9))',
            border: '1px solid rgba(255,187,0,0.25)',
          }}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-5xl sm:text-6xl">🔥</div>
              <div className="text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{
                  background: 'rgba(255,187,0,0.15)',
                  border: '1px solid rgba(255,187,0,0.3)',
                }}>
                  <Crown className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span className="text-[#FFD700] text-xs font-bold">SALA VIP</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Picks exclusivos de tipsters internacionales
                </h3>
                <p className="text-[#94A3B8] text-sm mb-4">
                  Accede a pronósticos premium de $20-50 USD, verificados por nuestra IA. 
                  Máximo 5 al mes para mantener la exclusividad.
                </p>
                <Link href="/registro" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition" style={{
                  background: 'linear-gradient(135deg, #FFBB00, #F97316)',
                  color: '#000',
                }}>
                  Desbloquear Sala VIP
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">
            Lo que dicen nuestros miembros
          </h2>
          
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { name: "Carlos M.", gain: "+$234,500", text: "Por fin veo los datos reales de cada tipster. Ya no me engañan con capturas editadas.", color: "bg-emerald-500" },
              { name: "María P.", gain: "+$89,200", text: "El filtro de EV+ cambió mi forma de apostar. Solo entro cuando los números tienen sentido.", color: "bg-blue-500" },
              { name: "Roberto S.", gain: "+$156,800", text: "La función de rachas es brutal. Sé exactamente cuándo un tipster está en su mejor momento.", color: "bg-amber-500" },
            ].map((testimonial, i) => (
              <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{testimonial.name}</p>
                    <p className="text-[#00FF88] text-xs sm:text-sm font-mono">{testimonial.gain}</p>
                  </div>
                </div>
                <p className="text-[#94A3B8] text-xs sm:text-sm">"{testimonial.text}"</p>
                <div className="flex gap-1 mt-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-3 w-3 sm:h-4 sm:w-4 text-[#FFD700] fill-[#FFD700]" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0A0A0A]">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo limpio */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 rounded-2xl overflow-hidden bg-[#050505] border border-[#00FF88]/30 p-2 shadow-lg shadow-[#00FF88]/20">
            <img 
              src={LOGO_ICON} 
              alt="NeuroTips" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
            ¿Listo para tu ventaja injusta?
          </h2>
          <p className="text-[#94A3B8] mb-6 sm:mb-8 text-sm sm:text-base">
            Únete a los 12,450+ apostadores que ya dejaron de apostar a ciegas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/registro" className="w-full sm:w-auto bg-[#00FF88] hover:bg-[#00E07A] text-[#050505] font-bold py-4 px-8 rounded-lg transition inline-flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,255,136,0.3)]">
              Comenzar Gratis Ahora
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/dashboard/suscripcion" className="w-full sm:w-auto font-bold py-4 px-8 rounded-lg transition inline-flex items-center justify-center gap-2" style={{
              background: 'linear-gradient(135deg, rgba(255,187,0,0.15), rgba(249,115,22,0.1))',
              border: '1px solid rgba(255,187,0,0.4)',
              color: '#FFBB00',
            }}>
              <Crown className="h-5 w-5" />
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-8 sm:py-10 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FF88]/20 to-[#FFD700]/20 border border-[#00FF88]/30 flex items-center justify-center">
              <span className="text-[#00FF88] font-bold">N</span>
            </div>
            <span className="font-bold text-white text-sm sm:text-base">
              Neuro<span className="text-[#00FF88]">Tips</span>
            </span>
          </div>
          <p className="text-[#64748B] text-xs sm:text-sm text-center">
            © 2026 NeuroTips • Todos los derechos reservados
          </p>
          <p className="text-[#64748B] text-xs text-center">
            Juego responsable. Solo +18.
          </p>
        </div>
      </footer>
    </div>
  );
}
