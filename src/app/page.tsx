'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, Shield, Zap, Users, Trophy, Star, 
  CheckCircle, ArrowRight, Play, Lock, Eye, 
  Target, Sparkles, ChevronRight, BadgeCheck, 
  Flame, Crown, Rocket, Calculator, Brain,
  DollarSign, PiggyBank, Award, Clock,
  BarChart2
} from 'lucide-react';

// ============================================
// CONFIGURACIÓN DINÁMICA
// Cambia estos valores según agregues/quites tipsters
// ============================================
const CONFIG = {
  totalTipsters: 24,        // Actualiza cuando agregues/quites
  precioCanal: 30000,       // Precio promedio por canal individual
  precioPortal: 15000,      // Tu precio mensual
  winRatePromedio: 73,      // Win rate promedio
  gananciasTotal: '847M',   // Ganancias totales generadas
  usuariosActivos: '12,450' // Usuarios activos
};

// Calcula ahorro automáticamente
const AHORRO_MENSUAL = (CONFIG.totalTipsters * CONFIG.precioCanal) - CONFIG.precioPortal;

// ============================================
// DATOS DE DEMOSTRACIÓN
// ============================================
const DEMO_WINS = [
  { user: 'Carlos M.', amount: 245000, sport: '⚽', time: '2min' },
  { user: 'Andrea L.', amount: 180000, sport: '🎾', time: '5min' },
  { user: 'Miguel R.', amount: 520000, sport: '🏀', time: '8min' },
  { user: 'Sofia P.', amount: 95000, sport: '⚽', time: '12min' },
  { user: 'Juan D.', amount: 310000, sport: '⚽', time: '15min' },
];

const TESTIMONIALS = [
  {
    name: 'Roberto C.',
    role: 'Apostador desde 2024',
    image: '👨‍💼',
    text: 'En 3 meses recuperé mi inversión del año. Los análisis de IA son increíblemente precisos.',
    profit: '+$1.2M',
    rating: 5
  },
  {
    name: 'Patricia M.',
    role: 'Trader deportivo',
    image: '👩‍💻',
    text: 'Pagaba más de $100.000 en varios canales. Ahora tengo todos los mejores tipsters por $15.000. Increíble.',
    profit: '+$850K',
    rating: 5
  },
  {
    name: 'Fernando L.',
    role: 'Inversor',
    image: '👨‍🔬',
    text: 'El simulador de banca me salvó. Antes apostaba sin control, ahora tengo gestión profesional.',
    profit: '+$2.1M',
    rating: 5
  },
  {
    name: 'Diego A.',
    role: 'Nuevo miembro',
    image: '🧑‍💻',
    text: '¡En mi primer mes +$300K! No lo podía creer.',
    profit: '+$300K',
    rating: 5
  }
];

// Función para formatear números con puntos
const formatNumber = (num: number) => num.toLocaleString('es-CL');

// Componente Ticker
function WinsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DEMO_WINS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const win = DEMO_WINS[currentIndex];
  
  return (
    <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-full px-4 py-2 flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
      </span>
      <span className="text-emerald-400 text-sm font-medium">GANANCIA EN VIVO</span>
      <span className="text-white font-bold">{win.user}</span>
      <span className="text-emerald-400 font-mono font-bold">+${win.amount.toLocaleString()}</span>
      <span>{win.sport}</span>
      <span className="text-gray-400 text-sm">hace {win.time}</span>
    </div>
  );
}

// Componente Countdown
function TrialCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 5, hours: 23, minutes: 59, seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) { days = 0; hours = 0; minutes = 0; seconds = 0; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <span className="text-amber-400 font-semibold flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Oferta termina en:
      </span>
      <div className="flex gap-1">
        {[
          { value: timeLeft.days, label: 'días' },
          { value: timeLeft.hours, label: 'hrs' },
          { value: timeLeft.minutes, label: 'min' },
          { value: timeLeft.seconds, label: 'seg' }
        ].map((item, i) => (
          <div key={i} className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-2 text-center min-w-[60px]">
            <span className="text-amber-400 font-mono font-bold text-xl block">{String(item.value).padStart(2, '0')}</span>
            <span className="text-amber-400/70 text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de Comparación de Precios
function PriceComparison() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-8">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-teal-400" />
        Compara y Ahorra
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div>
            <span className="text-gray-300">Canales individuales</span>
            <span className="text-gray-500 text-sm block">+$30.000 CLP por cada canal</span>
          </div>
          <span className="text-red-400 font-mono font-bold">💸 Caro</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <div>
            <span className="text-white font-semibold">TipsterPortal</span>
            <span className="text-emerald-400 text-sm block">Múltiples tipsters premium rentables</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold text-xl">${formatNumber(CONFIG.precioPortal)}</span>
        </div>
        <div className="text-center pt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <span className="text-amber-400 font-bold">💰 Un solo pago, todos los tipsters verificados</span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#1E293B] text-white overflow-hidden">
      {/* Fondo con efectos */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-slate-700/50 backdrop-blur-xl bg-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Tipster</span>
              <span className="text-teal-400">Portal</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#por-que" className="text-gray-300 hover:text-white transition-colors">Por Qué Nosotros</a>
            <a href="#como-funciona" className="text-gray-300 hover:text-white transition-colors">Cómo Funciona</a>
            <a href="#tipsters" className="text-gray-300 hover:text-white transition-colors">Tipsters</a>
            <a href="#precios" className="text-gray-300 hover:text-white transition-colors">Precios</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors font-medium">
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40"
            >
              Prueba Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Ticker */}
          <div className={`flex justify-center mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <WinsTicker />
          </div>

          {/* Headline principal */}
          <div className={`text-center max-w-5xl mx-auto mb-12 transition-all duration-700 delay-150 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            
            {/* Badge de valor */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full mb-6">
              <PiggyBank className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-semibold text-sm">Múltiples canales premium por el precio de uno</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Accede a Tipsters Premium </span>
              <br />
              <span className="text-white">por solo </span>
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">${formatNumber(CONFIG.precioPortal)} CLP</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Reunimos los <span className="text-white font-semibold">mejores canales de tipsters rentables</span> en un solo portal con IA. 
              Olvídate de pagar <span className="text-amber-400 font-semibold">+$30.000 por cada canal</span> y accede a todos con <span className="text-teal-400 font-semibold">gestión de banca profesional</span>.
            </p>

            {/* Stats inline */}
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300"><span className="text-white font-bold">{CONFIG.winRatePromedio}%</span> Win Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300"><span className="text-white font-bold">${CONFIG.gananciasTotal}+</span> en ganancias</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300"><span className="text-white font-bold">{CONFIG.usuariosActivos}+</span> usuarios</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300"><span className="text-white font-bold">{CONFIG.totalTipsters}+</span> tipsters</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/registro"
                className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-105 flex items-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                Prueba 5 Días Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <span className="text-gray-400 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Sin tarjeta de crédito
              </span>
            </div>

            {/* Countdown */}
            <div className="flex justify-center">
              <TrialCountdown />
            </div>
          </div>

          {/* Trust badges */}
          <div className={`flex flex-wrap justify-center gap-8 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {[
              { icon: Brain, text: 'Verificado por IA' },
              { icon: Lock, text: 'Pagos Seguros' },
              { icon: Eye, text: 'Estadísticas Públicas' },
              { icon: Zap, text: 'Alertas en Tiempo Real' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400">
                <item.icon className="w-5 h-5 text-teal-400" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por Qué Nosotros */}
      <section id="por-que" className="relative z-10 py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">Propuesta de Valor</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              ¿Por qué <span className="text-teal-400">TipsterPortal</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Olvídate de pagar +$30.000 por cada canal individual. Aquí tienes los mejores tipsters verificados y rentables.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Valor */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 hover:border-amber-400/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-4">
                <DollarSign className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Múltiples Canales, Un Precio</h3>
              <p className="text-gray-400 mb-4">
                Canales individuales cobran <span className="text-amber-400 font-semibold">+$30.000 CLP cada uno</span>. 
                Aquí accedes a todos los tipsters rentables por solo ${formatNumber(CONFIG.precioPortal)}.
              </p>
              <div className="text-amber-400 font-mono font-bold text-2xl">
                Máximo valor
              </div>
            </div>

            {/* Card 2: Sin nombres */}
            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-teal-500/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-4">
                <Eye className="w-7 h-7 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Sin Nombres, Solo Rentabilidad</h3>
              <p className="text-gray-400 mb-4">
                Los tipsters están anonimizados para proteger las fuentes. 
                <span className="text-teal-400 font-semibold"> Estadísticas 100% trazables y verificables.</span>
              </p>
              <div className="text-teal-400 font-mono font-bold text-2xl">
                Transparencia total
              </div>
            </div>

            {/* Card 3: Simulador */}
            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <Calculator className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Tu Asistente Anti-Quiebra</h3>
              <p className="text-gray-400 mb-4">
                Dinos tu banca (ej: $500.000) y nuestra IA te dice 
                <span className="text-emerald-400 font-semibold"> exactamente cuánto apostar en cada pick.</span>
              </p>
              <div className="text-emerald-400 font-mono font-bold text-2xl">
                Gestión profesional
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section id="como-funciona" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">Proceso Profesional</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              Cómo <span className="text-teal-400">Funciona</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Award,
                title: 'Auditoría de Expertos',
                description: 'Nosotros pagamos y auditamos los canales de tipsters premium para que tú no tengas que hacerlo. Solo incluimos los rentables.'
              },
              {
                step: '02',
                icon: Brain,
                title: 'Filtro por IA y Banca',
                description: 'Nuestro sistema procesa los picks y te indica el Stake exacto según tu capital para proteger tu banca.'
              },
              {
                step: '03',
                icon: Zap,
                title: 'Ejecución Inteligente',
                description: 'Recibe la alerta con horario local y replica la jugada con la confianza de una estadística verificada.'
              }
            ].map((item, index) => (
              <div 
                key={item.step}
                className="relative p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-teal-500/30 transition-all duration-300 group"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/30">
                  {item.step}
                </div>
                <div className="mt-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/20 transition-colors">
                    <item.icon className="w-7 h-7 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tipsters Destacados */}
      <section id="tipsters" className="relative z-10 py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">Top Performers</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              Tipsters <span className="text-teal-400">Verificados</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Tipsters con ROI real verificado – sigue solo los rentables
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { rank: 1, name: 'Goleador Pro', sport: '⚽ Fútbol', roi: '+32%', winRate: 78, streak: 8, medal: '🥇' },
              { rank: 2, name: 'Ace Master', sport: '🎾 Tenis', roi: '+28%', winRate: 75, streak: 5, medal: '🥈' },
              { rank: 3, name: 'Slam Dunk', sport: '🏀 NBA', roi: '+25%', winRate: 71, streak: 4, medal: '🥉' },
            ].map((tipster) => (
              <div 
                key={tipster.name}
                className={`relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                  tipster.rank === 1 
                    ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30 shadow-lg shadow-amber-500/10' 
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-teal-500/30'
                }`}
              >
                {tipster.rank === 1 && (
                  <div className="absolute -top-3 -right-3">
                    <Crown className="w-8 h-8 text-amber-400 fill-amber-400/20" />
                  </div>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl">{tipster.medal}</div>
                  <div>
                    <div className="font-bold text-white text-lg">{tipster.name}</div>
                    <div className="text-gray-400 text-sm">{tipster.sport}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-emerald-400 font-bold font-mono text-xl">{tipster.roi}</div>
                    <div className="text-gray-400 text-xs">ROI mensual</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-white font-mono">{tipster.winRate}%</div>
                    <div className="text-gray-400 text-xs">Win Rate</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-400 font-mono">+{tipster.streak}</div>
                    <div className="text-gray-400 text-xs">Racha</div>
                  </div>
                </div>
                <Link 
                  href="/registro"
                  className="block w-full py-3 text-center rounded-xl border border-teal-500/50 text-teal-400 font-semibold hover:bg-teal-500/10 transition-colors"
                >
                  Seguir Tipster
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/registro"
              className="inline-flex items-center gap-2 text-teal-400 font-semibold hover:text-teal-300 transition-colors"
            >
              Ver todos los tipsters ({CONFIG.totalTipsters}+)
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">Testimonios Reales</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              Lo que dicen nuestros <span className="text-teal-400">miembros</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div 
                key={testimonial.name}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{testimonial.name}</div>
                    <div className="text-gray-400 text-xs">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm italic mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div className="text-emerald-400 font-bold font-mono">{testimonial.profit}</div>
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="relative z-10 py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">Precio Transparente</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              Todos los tipsters por <span className="text-teal-400">un solo precio</span>
            </h2>
          </div>

          <div className="max-w-lg mx-auto">
            {/* Comparación de precios */}
            <PriceComparison />

            {/* Card de precio */}
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-teal-500/30 backdrop-blur-xl shadow-2xl shadow-teal-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full text-sm font-bold shadow-lg">
                  🔥 MEJOR VALOR
                </div>
              </div>

              <div className="text-center mb-8 mt-4">
                <div className="text-gray-400 mb-2">Acceso Completo</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold text-white">${formatNumber(CONFIG.precioPortal)}</span>
                  <span className="text-gray-400">CLP/mes</span>
                </div>
                <div className="text-emerald-400 text-sm mt-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  5 días GRATIS para probar
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  `Acceso a ${CONFIG.totalTipsters}+ tipsters premium verificados`,
                  'Análisis de IA en tiempo real',
                  'Simulador de banca profesional',
                  'Alertas instantáneas de picks',
                  'Estadísticas y ROI trazable',
                  'Gestión de riesgo automatizada',
                  'Sin permanencia - Cancela cuando quieras'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/registro"
                className="block w-full py-4 text-center bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40"
              >
                Comenzar Prueba Gratis
              </Link>

              <p className="text-center text-gray-500 text-sm mt-4">
                Sin tarjeta de crédito • Cancela cuando quieras
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Sparkles className="w-12 h-12 text-teal-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Únete a {CONFIG.usuariosActivos}+ apostadores que ya <span className="text-teal-400">ganan consistente</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Activa tu prueba gratis ahora. Sin tarjeta, sin compromiso.
          </p>
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 rounded-xl font-bold text-xl transition-all duration-300 shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-105"
          >
            <Flame className="w-6 h-6" />
            Comenzar Gratis Ahora
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-white">Tipster</span>
                <span className="text-teal-400">Portal</span>
              </span>
            </div>
            <div className="flex items-center gap-8 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>
            <div className="text-gray-500 text-sm">
              © 2026 TipsterPortal. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
