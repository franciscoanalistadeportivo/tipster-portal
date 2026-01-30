'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, TrendingUp, Users, Shield, Star, 
  CheckCircle, ArrowRight, Zap, Target, Clock
} from 'lucide-react';

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
    <div className="inline-flex items-center gap-2 bg-[#00D1B2]/10 border border-[#00D1B2]/30 rounded-full px-4 py-2">
      <span className="w-2 h-2 bg-[#00D1B2] rounded-full animate-pulse" />
      <span className="text-[#00D1B2] text-sm">
        {gains[currentIndex].user} ganó <span className="font-bold">{gains[currentIndex].amount}</span> con {gains[currentIndex].tipster}
      </span>
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/90 backdrop-blur-md border-b border-[#334155]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#00D1B2] p-1.5 rounded-lg">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">TipsterPortal</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[#94A3B8] hover:text-white transition text-sm">
              Iniciar Sesión
            </Link>
            <Link href="/registro" className="btn-primary text-sm py-2 px-4">
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Ticker */}
          <div className="mb-8">
            <GainsTicker />
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Sigue a los mejores
            <span className="text-gradient-teal block">tipsters verificados</span>
          </h1>
          
          <p className="text-xl text-[#94A3B8] mb-8 max-w-2xl mx-auto">
            Accede a picks de alta confianza analizados por IA. 
            Estadísticas en tiempo real. Resultados comprobables.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#00D1B2] font-mono">
                <AnimatedCounter value={847} suffix="K" />
              </p>
              <p className="text-[#94A3B8] text-sm">Ganados este mes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white font-mono">78%</p>
              <p className="text-[#94A3B8] text-sm">Win Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white font-mono">24+</p>
              <p className="text-[#94A3B8] text-sm">Tipsters Activos</p>
            </div>
          </div>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/registro" className="btn-pulse flex items-center gap-2">
              Comenzar 5 Días Gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-[#64748B] text-sm">Sin tarjeta • Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-[#1E293B]/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            ¿Por qué elegirnos?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-elite text-center">
              <div className="w-14 h-14 bg-[#00D1B2]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-[#00D1B2]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Tipsters Verificados</h3>
              <p className="text-[#94A3B8] text-sm">
                Todos los tipsters pasan por un proceso de verificación. Historial 100% transparente.
              </p>
            </div>
            
            <div className="card-elite text-center">
              <div className="w-14 h-14 bg-[#FFDD57]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-7 w-7 text-[#FFDD57]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Análisis con IA</h3>
              <p className="text-[#94A3B8] text-sm">
                Cada pick incluye análisis de probabilidad real, EV+ y nivel de riesgo calculado por IA.
              </p>
            </div>
            
            <div className="card-elite text-center">
              <div className="w-14 h-14 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-7 w-7 text-[#3B82F6]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Estadísticas en Vivo</h3>
              <p className="text-[#94A3B8] text-sm">
                ROI, racha, win rate y más. Datos actualizados en tiempo real para cada tipster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Tipsters */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Top Tipsters del Mes
          </h2>
          <p className="text-[#94A3B8] text-center mb-12">
            Resultados verificados y actualizados diariamente
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Top 1 */}
            <div className="card-premium relative">
              <div className="absolute -top-3 left-4 bg-[#FFDD57] text-[#0F172A] text-xs font-bold px-3 py-1 rounded-full">
                🥇 #1 DEL MES
              </div>
              <div className="pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#FFDD57]/20 rounded-full flex items-center justify-center text-xl">
                    ⚽
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Goleador Pro</h3>
                    <p className="text-[#94A3B8] text-sm">Fútbol</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[#00D1B2] font-mono font-bold">+32%</p>
                    <p className="text-[#64748B] text-xs">ROI</p>
                  </div>
                  <div>
                    <p className="text-white font-mono font-bold">78%</p>
                    <p className="text-[#64748B] text-xs">Win Rate</p>
                  </div>
                  <div>
                    <p className="text-[#00D1B2] font-mono font-bold">+8</p>
                    <p className="text-[#64748B] text-xs">Racha</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top 2 */}
            <div className="card-elite">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl">
                  🎾
                </div>
                <div>
                  <h3 className="font-bold text-white">Ace Master</h3>
                  <p className="text-[#94A3B8] text-sm">Tenis</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[#00D1B2] font-mono font-bold">+25%</p>
                  <p className="text-[#64748B] text-xs">ROI</p>
                </div>
                <div>
                  <p className="text-white font-mono font-bold">71%</p>
                  <p className="text-[#64748B] text-xs">Win Rate</p>
                </div>
                <div>
                  <p className="text-[#00D1B2] font-mono font-bold">+5</p>
                  <p className="text-[#64748B] text-xs">Racha</p>
                </div>
              </div>
            </div>
            
            {/* Top 3 */}
            <div className="card-elite">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl">
                  🏀
                </div>
                <div>
                  <h3 className="font-bold text-white">Slam Dunk</h3>
                  <p className="text-[#94A3B8] text-sm">NBA</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[#00D1B2] font-mono font-bold">+28%</p>
                  <p className="text-[#64748B] text-xs">ROI</p>
                </div>
                <div>
                  <p className="text-white font-mono font-bold">68%</p>
                  <p className="text-[#64748B] text-xs">Win Rate</p>
                </div>
                <div>
                  <p className="text-[#00D1B2] font-mono font-bold">+3</p>
                  <p className="text-[#64748B] text-xs">Racha</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/registro" className="text-[#00D1B2] hover:underline">
              Ver los 24 tipsters →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-[#1E293B]/30">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Un solo plan, acceso total
          </h2>
          <p className="text-[#94A3B8] text-center mb-10">
            Sin trucos. Sin niveles. Todo incluido.
          </p>
          
          <div className="card-hero relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00D1B2] text-white text-sm font-bold px-4 py-1 rounded-full">
              ACCESO COMPLETO
            </div>
            
            <div className="text-center pt-4 mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-white">$15.000</span>
                <span className="text-[#94A3B8]">/mes</span>
              </div>
              <p className="text-[#64748B] text-sm mt-1">CLP • Cancela cuando quieras</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              {[
                "Acceso a los 24+ tipsters",
                "Picks ilimitados",
                "Análisis IA completo",
                "Estadísticas en tiempo real",
                "Alertas de apuestas",
                "Historial verificado",
                "Soporte prioritario"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00D1B2] flex-shrink-0" />
                  <span className="text-[#94A3B8]">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Link href="/registro" className="btn-pulse w-full flex items-center justify-center gap-2">
              Comenzar 5 Días Gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <p className="text-center text-[#64748B] text-xs mt-4">
              Sin tarjeta de crédito • Cancela en cualquier momento
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Lo que dicen nuestros miembros
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Carlos M.", gain: "+$234,500", text: "Llevaba años apostando solo. Desde que sigo a Goleador Pro, mi bankroll creció 3x en 2 meses." },
              { name: "María P.", gain: "+$89,200", text: "El análisis de IA me ayuda a filtrar las apuestas. Ya no apuesto por impulso, solo picks con EV+." },
              { name: "Roberto S.", gain: "+$156,800", text: "Probé gratis y el primer día gané. Ahora soy premium y no me arrepiento. 100% recomendado." },
            ].map((testimonial, i) => (
              <div key={i} className="card-elite">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#00D1B2]/10 rounded-full flex items-center justify-center text-[#00D1B2] font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="text-[#00D1B2] text-sm font-mono">{testimonial.gain}</p>
                  </div>
                </div>
                <p className="text-[#94A3B8] text-sm">"{testimonial.text}"</p>
                <div className="flex gap-1 mt-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 text-[#FFDD57] fill-[#FFDD57]" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-[#1E293B]/30">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#00D1B2] p-3 rounded-xl w-fit mx-auto mb-6">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para ganar?
          </h2>
          <p className="text-[#94A3B8] mb-8">
            Únete a los 12,450+ apostadores que ya están ganando con picks verificados y análisis IA.
          </p>
          <Link href="/registro" className="btn-pulse inline-flex items-center gap-2">
            Comenzar Gratis Ahora
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-[#334155]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#00D1B2]" />
            <span className="font-bold text-white">TipsterPortal</span>
          </div>
          <p className="text-[#64748B] text-sm">
            © 2026 TipsterPortal • Todos los derechos reservados
          </p>
          <p className="text-[#64748B] text-xs">
            El juego responsable es importante. Solo mayores de 18.
          </p>
        </div>
      </footer>
    </div>
  );
}
