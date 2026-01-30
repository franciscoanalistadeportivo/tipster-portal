'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ============================================
// COMPONENTES AUXILIARES
// ============================================

// Logo SVG Minimalista estilo Terminal
const LogoSVG = ({ className = "", color = "#00FF88" }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12L24 4L40 12V36L24 44L8 36V12Z" stroke={color} strokeWidth="2" fill="none" />
    <path d="M24 4V44" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
    <path d="M8 12L40 36" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
    <path d="M40 12L8 36" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
    <circle cx="24" cy="24" r="6" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2" />
    <circle cx="24" cy="24" r="2" fill={color} />
  </svg>
);

// Contador animado
const AnimatedCounter = ({ value, suffix = "" }: { value: string; suffix?: string }) => {
  const [displayed, setDisplayed] = useState("0");
  
  useEffect(() => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ''));
    const duration = 2000;
    const steps = 60;
    const increment = numValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(current).toLocaleString());
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{displayed}{suffix}</span>;
};

// Ticker de ganancias en vivo
const LiveTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const gains = [
    { user: "M***el", amount: "+$45,200", time: "hace 2 min" },
    { user: "J***os", amount: "+$12,800", time: "hace 5 min" },
    { user: "A***na", amount: "+$78,500", time: "hace 8 min" },
    { user: "C***lo", amount: "+$23,100", time: "hace 12 min" },
    { user: "R***go", amount: "+$156,000", time: "hace 15 min" },
  ];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % gains.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex items-center gap-3 bg-[#00FF88]/5 border border-[#00FF88]/20 rounded px-4 py-2">
      <span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" />
      <span className="text-[#00FF88] text-sm font-mono">
        {gains[currentIndex].user} ganó <span className="font-bold">{gains[currentIndex].amount}</span>
      </span>
      <span className="text-[#94A3B8]/50 text-xs">{gains[currentIndex].time}</span>
    </div>
  );
};

// Countdown Timer
const CountdownTimer = () => {
  const [time, setTime] = useState({ hours: 23, minutes: 59, seconds: 59 });
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        else { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-1 rounded">{String(time.hours).padStart(2, '0')}</span>
      <span className="text-[#FFD700]">:</span>
      <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-1 rounded">{String(time.minutes).padStart(2, '0')}</span>
      <span className="text-[#FFD700]">:</span>
      <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-1 rounded">{String(time.seconds).padStart(2, '0')}</span>
    </div>
  );
};

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function LandingPage() {
  const [cuposRestantes, setCuposRestantes] = useState(47);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCuposRestantes(prev => Math.max(12, prev - Math.floor(Math.random() * 2)));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased">
      
      {/* ============================================ */}
      {/* HEADER STICKY */}
      {/* ============================================ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoSVG className="h-8 w-8" />
            <span className="font-semibold text-lg tracking-tight">
              tipster<span className="text-[#00FF88]">.pro</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm text-[#94A3B8]">
            <a href="#como-funciona" className="hover:text-white transition">Cómo Funciona</a>
            <a href="#tipsters" className="hover:text-white transition">Tipsters</a>
            <a href="#precios" className="hover:text-white transition">Precios</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#94A3B8] hover:text-white transition">
              Iniciar Sesión
            </Link>
            <Link href="/registro" className="bg-[#00FF88] hover:bg-[#00E07A] text-[#050505] text-sm font-semibold px-5 py-2.5 rounded transition">
              Prueba Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Efecto de grid sutil */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(#00FF88 1px, transparent 1px), linear-gradient(90deg, #00FF88 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        
        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge de urgencia */}
          <div className="inline-flex items-center gap-3 bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-full px-4 py-2 mb-8">
            <span className="text-[#FFD700] text-xs font-semibold uppercase tracking-wider">Oferta Limitada</span>
            <CountdownTimer />
            <span className="text-[#94A3B8] text-xs">• Solo {cuposRestantes} cupos</span>
          </div>
          
          {/* Headline Principal */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Sigue a los mejores
            <br />
            <span className="text-[#00FF88]">tipsters verificados</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#94A3B8] max-w-2xl mx-auto mb-8 leading-relaxed">
            Accede a picks de alta confianza analizados por IA.
            <br className="hidden md:block" />
            Estadísticas en tiempo real. Resultados comprobables.
          </p>
          
          {/* Stats rápidos */}
          <div className="flex flex-wrap justify-center gap-8 mb-10 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#00FF88] font-mono font-bold text-2xl">
                <AnimatedCounter value="847" suffix="K" />
              </span>
              <span className="text-[#94A3B8]">ganados este mes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono font-bold text-2xl">78%</span>
              <span className="text-[#94A3B8]">win rate promedio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono font-bold text-2xl">24</span>
              <span className="text-[#94A3B8]">tipsters activos</span>
            </div>
          </div>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/registro" className="group bg-[#00FF88] hover:bg-[#00E07A] text-[#050505] font-semibold px-8 py-4 rounded text-lg transition flex items-center gap-2">
              Comenzar Gratis
              <svg className="w-5 h-5 group-hover:translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <span className="text-[#94A3B8] text-sm">5 días gratis • Sin tarjeta</span>
          </div>
          
          {/* Ticker en vivo */}
          <div className="flex justify-center">
            <LiveTicker />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SOCIAL PROOF - LOGOS/NÚMEROS */}
      {/* ============================================ */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white font-mono">12,450+</p>
              <p className="text-[#94A3B8] text-sm mt-1">Apostadores activos</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-[#00FF88] font-mono">$2.4M</p>
              <p className="text-[#94A3B8] text-sm mt-1">Ganancias totales</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white font-mono">1,847</p>
              <p className="text-[#94A3B8] text-sm mt-1">Picks este mes</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white font-mono">4.9<span className="text-[#FFD700]">★</span></p>
              <p className="text-[#94A3B8] text-sm mt-1">Valoración usuarios</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CÓMO FUNCIONA */}
      {/* ============================================ */}
      <section id="como-funciona" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#00FF88] text-sm font-semibold uppercase tracking-wider mb-3">Simple y efectivo</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Cómo funciona</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-8 hover:border-[#00FF88]/30 transition group">
              <div className="w-12 h-12 bg-[#00FF88]/10 rounded flex items-center justify-center text-[#00FF88] font-mono font-bold text-xl mb-6 group-hover:bg-[#00FF88]/20 transition">
                01
              </div>
              <h3 className="text-xl font-semibold mb-3">Regístrate gratis</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Crea tu cuenta en 30 segundos. Sin tarjeta de crédito. 5 días de acceso completo gratis.
              </p>
            </div>
            
            {/* Paso 2 */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-8 hover:border-[#00FF88]/30 transition group">
              <div className="w-12 h-12 bg-[#00FF88]/10 rounded flex items-center justify-center text-[#00FF88] font-mono font-bold text-xl mb-6 group-hover:bg-[#00FF88]/20 transition">
                02
              </div>
              <h3 className="text-xl font-semibold mb-3">Elige tipsters</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Explora estadísticas detalladas de cada tipster. ROI, racha, historial completo verificado.
              </p>
            </div>
            
            {/* Paso 3 */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-8 hover:border-[#00FF88]/30 transition group">
              <div className="w-12 h-12 bg-[#00FF88]/10 rounded flex items-center justify-center text-[#00FF88] font-mono font-bold text-xl mb-6 group-hover:bg-[#00FF88]/20 transition">
                03
              </div>
              <h3 className="text-xl font-semibold mb-3">Recibe picks</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Accede a las apuestas del día con análisis IA. Probabilidades, EV+ y nivel de confianza.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TIPSTERS DESTACADOS */}
      {/* ============================================ */}
      <section id="tipsters" className="py-24 px-6 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#00FF88] text-sm font-semibold uppercase tracking-wider mb-3">Resultados verificados</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Top Tipsters del Mes</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Tipster 1 - TOP */}
            <div className="relative bg-[#050505] border-2 border-[#FFD700]/50 rounded-lg p-6 overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FFD700] text-[#050505] text-xs font-bold px-3 py-1 rounded-bl">
                🥇 #1
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#FFD700]/10 rounded-full flex items-center justify-center text-2xl">
                  ⚽
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Goleador Pro</h3>
                  <p className="text-[#94A3B8] text-sm">Fútbol</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-[#00FF88] font-mono font-bold text-lg">+32%</p>
                  <p className="text-[#94A3B8] text-xs">ROI</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-mono font-bold text-lg">78%</p>
                  <p className="text-[#94A3B8] text-xs">Win Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-[#00FF88] font-mono font-bold text-lg">+8</p>
                  <p className="text-[#94A3B8] text-xs">Racha</p>
                </div>
              </div>
              <div className="h-12 bg-[#00FF88]/5 rounded flex items-center justify-center">
                <svg width="100%" height="30" viewBox="0 0 200 30">
                  <polyline
                    points="0,25 20,22 40,18 60,20 80,15 100,12 120,14 140,8 160,10 180,5 200,3"
                    fill="none"
                    stroke="#00FF88"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
            
            {/* Tipster 2 */}
            <div className="bg-[#050505] border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-2xl">
                  🎾
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Ace Master</h3>
                  <p className="text-[#94A3B8] text-sm">Tenis</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-[#00FF88] font-mono font-bold text-lg">+25%</p>
                  <p className="text-[#94A3B8] text-xs">ROI</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-mono font-bold text-lg">71%</p>
                  <p className="text-[#94A3B8] text-xs">Win Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-[#00FF88] font-mono font-bold text-lg">+5</p>
                  <p className="text-[#94A3B8] text-xs">Racha</p>
                </div>
              </div>
              <div className="h-12 bg-[#00FF88]/5 rounded flex items-center justify-center">
                <svg width="100%" height="30" viewBox="0 0 200 30">
                  <polyline
                    points="0,20 30,18 60,22 90,15 120,12 150,14 180,8 200,10"
                    fill="none"
                    stroke="#00FF88"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
            
            {/* Tipster 3 */}
            <div className="bg-[#050505] border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-2xl">
                  🏀
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Slam Dunk</h3>
                  <p className="text-[#94A3B8] text-sm">NBA</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-[#00FF88] font-mono font-bold text-lg">+28%</p>
                  <p className="text-[#94A3B8] text-xs">ROI</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-mono font-bold text-lg">68%</p>
                  <p className="text-[#94A3B8] text-xs">Win Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-[#00FF88] font-mono font-bold text-lg">+3</p>
                  <p className="text-[#94A3B8] text-xs">Racha</p>
                </div>
              </div>
              <div className="h-12 bg-[#00FF88]/5 rounded flex items-center justify-center">
                <svg width="100%" height="30" viewBox="0 0 200 30">
                  <polyline
                    points="0,15 40,18 80,12 120,15 160,8 200,6"
                    fill="none"
                    stroke="#00FF88"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link href="/registro" className="text-[#00FF88] text-sm font-medium hover:underline">
              Ver los 24 tipsters →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* ANÁLISIS IA */}
      {/* ============================================ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#00FF88] text-sm font-semibold uppercase tracking-wider mb-3">Tecnología exclusiva</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Análisis con <span className="text-[#00FF88]">Inteligencia Artificial</span>
              </h2>
              <p className="text-[#94A3B8] mb-6 leading-relaxed">
                Nuestro sistema analiza cada pick con algoritmos avanzados. Calculamos probabilidad real, 
                Expected Value (EV+) y nivel de riesgo para cada apuesta.
              </p>
              <ul className="space-y-3">
                {[
                  "Probabilidad real vs cuota del mercado",
                  "Filtro EV+ (Expected Value positivo)",
                  "Clasificación de riesgo automática",
                  "Historial verificado de cada tipster"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-[#00FF88]">✓</span>
                    <span className="text-[#94A3B8]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Mock de análisis */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" />
                <span className="text-[#00FF88] text-xs font-mono uppercase">Análisis en vivo</span>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[#050505] rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Lyon vs PAOK</span>
                    <span className="bg-[#00FF88]/10 text-[#00FF88] text-xs px-2 py-1 rounded">APROBADA</span>
                  </div>
                  <p className="text-[#94A3B8] text-sm mb-3">Más de 2.5 goles @ 1.72</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/5 rounded p-2">
                      <p className="text-[#00FF88] font-mono font-bold">82%</p>
                      <p className="text-[#94A3B8] text-[10px]">Prob. Real</p>
                    </div>
                    <div className="bg-white/5 rounded p-2">
                      <p className="text-[#00FF88] font-mono font-bold">+41%</p>
                      <p className="text-[#94A3B8] text-[10px]">EV+</p>
                    </div>
                    <div className="bg-white/5 rounded p-2">
                      <p className="text-white font-mono font-bold">BAJO</p>
                      <p className="text-[#94A3B8] text-[10px]">Riesgo</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-white/5 pt-4">
                  <p className="text-[#94A3B8] text-xs">
                    <span className="text-[#FFD700]">🧠 Veredicto IA:</span> Alta probabilidad basada en historial 
                    de ambos equipos. Lyon promedia 3.2 goles/partido en casa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TESTIMONIOS */}
      {/* ============================================ */}
      <section className="py-24 px-6 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#00FF88] text-sm font-semibold uppercase tracking-wider mb-3">Comunidad</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Lo que dicen nuestros miembros</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Carlos M.", gain: "+$234,500", text: "Llevaba años apostando solo. Desde que sigo a Goleador Pro, mi bankroll creció 3x en 2 meses." },
              { name: "María P.", gain: "+$89,200", text: "El análisis de IA me ayuda a filtrar las apuestas. Ya no apuesto por impulso, solo picks con EV+." },
              { name: "Roberto S.", gain: "+$156,800", text: "Probé gratis y el primer día gané. Ahora soy premium y no me arrepiento. 100% recomendado." },
            ].map((testimonial, i) => (
              <div key={i} className="bg-[#050505] border border-white/5 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#00FF88]/10 rounded-full flex items-center justify-center text-[#00FF88] font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="text-[#00FF88] text-sm font-mono">{testimonial.gain}</p>
                  </div>
                </div>
                <p className="text-[#94A3B8] text-sm leading-relaxed">"{testimonial.text}"</p>
                <div className="flex gap-1 mt-4">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-[#FFD700]">★</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PRECIOS */}
      {/* ============================================ */}
      <section id="precios" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#00FF88] text-sm font-semibold uppercase tracking-wider mb-3">Inversión</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Un solo plan, acceso total</h2>
            <p className="text-[#94A3B8]">Sin trucos. Sin niveles. Todo incluido.</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="relative bg-[#0A0A0A] border-2 border-[#00FF88] rounded-lg p-8">
              {/* Badge popular */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00FF88] text-[#050505] text-sm font-bold px-4 py-1 rounded">
                ACCESO COMPLETO
              </div>
              
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-white">$15.000</span>
                  <span className="text-[#94A3B8]">/mes</span>
                </div>
                <p className="text-[#94A3B8] text-sm mt-2">CLP • Cancela cuando quieras</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  "Acceso a los 24 tipsters",
                  "Picks ilimitados",
                  "Análisis IA completo",
                  "Estadísticas en tiempo real",
                  "Alertas de apuestas",
                  "Historial verificado",
                  "Soporte prioritario"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-[#00FF88]">✓</span>
                    <span className="text-[#94A3B8] text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/registro" className="block w-full bg-[#00FF88] hover:bg-[#00E07A] text-[#050505] font-semibold py-4 rounded text-center transition">
                Comenzar 5 días gratis
              </Link>
              
              <p className="text-center text-[#94A3B8] text-xs mt-4">
                Sin tarjeta de crédito • Cancela en cualquier momento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA FINAL */}
      {/* ============================================ */}
      <section className="py-24 px-6 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto text-center">
          <LogoSVG className="h-16 w-16 mx-auto mb-8" color="#00FF88" />
          
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            ¿Listo para ganar?
          </h2>
          <p className="text-[#94A3B8] mb-8 max-w-xl mx-auto">
            Únete a los 12,450+ apostadores que ya están ganando con picks verificados y análisis IA.
          </p>
          
          <Link href="/registro" className="inline-flex items-center justify-center gap-2 bg-[#00FF88] hover:bg-[#00E07A] text-[#050505] px-10 py-5 rounded text-lg font-semibold transition">
            Comenzar Gratis Ahora
          </Link>
          
          <p className="mt-6 text-[#94A3B8] text-sm">
            5 días gratis • Sin tarjeta • Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-[#050505] border-t border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              <LogoSVG className="h-8 w-8" />
              <span className="font-semibold">tipster<span className="text-[#00FF88]">.pro</span></span>
            </div>
            <div className="flex gap-6 text-sm text-[#94A3B8]">
              <a href="#" className="hover:text-white transition">Términos</a>
              <a href="#" className="hover:text-white transition">Privacidad</a>
              <a href="#" className="hover:text-white transition">Contacto</a>
            </div>
          </div>
          <div className="text-center text-[#94A3B8] text-sm">
            <p>© 2026 Tipster.pro • Todos los derechos reservados</p>
            <p className="text-xs mt-2 text-[#94A3B8]/50">
              El juego responsable es importante. Solo para mayores de 18 años.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
