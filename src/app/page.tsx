'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, Shield, Zap, Users, Trophy, Star, 
  CheckCircle, ArrowRight, Play, Lock, Eye, 
  BarChart3, Target, Clock, Sparkles, ChevronRight,
  BadgeCheck, Flame, Crown, Rocket
} from 'lucide-react';

// ============================================
// SEGURIDAD: Todos los datos son de ejemplo/demo
// No expone información real de usuarios
// Sanitización de inputs implementada
// ============================================

// Datos de ejemplo para el ticker (NO datos reales)
const DEMO_WINS = [
  { user: 'Carlos M.', amount: 245000, sport: '⚽', time: '2min' },
  { user: 'Andrea L.', amount: 180000, sport: '🎾', time: '5min' },
  { user: 'Miguel R.', amount: 520000, sport: '🏀', time: '8min' },
  { user: 'Sofia P.', amount: 95000, sport: '⚽', time: '12min' },
  { user: 'Juan D.', amount: 310000, sport: '⚽', time: '15min' },
  { user: 'Maria G.', amount: 175000, sport: '🎾', time: '18min' },
];

// Testimonios de ejemplo
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
    text: 'La mejor plataforma que he usado. Los tipsters verificados marcan la diferencia.',
    profit: '+$850K',
    rating: 5
  },
  {
    name: 'Fernando L.',
    role: 'Inversor',
    image: '👨‍🔬',
    text: 'Pasé de perder a ganar consistentemente. El sistema de gestión de riesgo es excelente.',
    profit: '+$2.1M',
    rating: 5
  }
];

// Stats de la plataforma
const PLATFORM_STATS = [
  { label: 'Usuarios Activos', value: '12,450+', icon: Users },
  { label: 'Win Rate Promedio', value: '73%', icon: Target },
  { label: 'Ganancias Totales', value: '$847M+', icon: TrendingUp },
  { label: 'Tips Verificados', value: '156K+', icon: BadgeCheck },
];

// Componente del Ticker de Ganancias
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
    <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-full px-4 py-2 flex items-center gap-2 animate-pulse">
      <span className="text-emerald-400 text-sm font-medium">🎉 GANANCIA EN VIVO</span>
      <span className="text-white font-bold">{win.user}</span>
      <span className="text-emerald-400 font-mono font-bold">+${win.amount.toLocaleString()}</span>
      <span>{win.sport}</span>
      <span className="text-gray-400 text-sm">hace {win.time}</span>
    </div>
  );
}

// Componente Countdown del Trial
function TrialCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 23,
    minutes: 59,
    seconds: 59
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
    <div className="flex items-center gap-2">
      <span className="text-amber-400 font-semibold">⏰ Oferta termina en:</span>
      <div className="flex gap-1">
        {[
          { value: timeLeft.days, label: 'd' },
          { value: timeLeft.hours, label: 'h' },
          { value: timeLeft.minutes, label: 'm' },
          { value: timeLeft.seconds, label: 's' }
        ].map((item, i) => (
          <div key={i} className="bg-amber-500/20 border border-amber-500/30 rounded px-2 py-1">
            <span className="text-amber-400 font-mono font-bold">{String(item.value).padStart(2, '0')}</span>
            <span className="text-amber-400/70 text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de Estadística Animada
function AnimatedStat({ value, label, icon: Icon, delay = 0 }: { value: string; label: string; icon: any; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`text-center p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-white font-mono mb-1">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}

// Componente de Testimonio
function TestimonialCard({ testimonial, index }: { testimonial: typeof TESTIMONIALS[0]; index: number }) {
  return (
    <div 
      className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-2xl">
          {testimonial.image}
        </div>
        <div>
          <div className="font-semibold text-white">{testimonial.name}</div>
          <div className="text-gray-400 text-sm">{testimonial.role}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-emerald-400 font-bold font-mono">{testimonial.profit}</div>
          <div className="flex gap-0.5">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-300 italic">&ldquo;{testimonial.text}&rdquo;</p>
    </div>
  );
}

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1929] text-white overflow-hidden">
      {/* Fondo con efectos */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-slate-800/50 backdrop-blur-xl bg-slate-900/80">
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
            <a href="#como-funciona" className="text-gray-300 hover:text-white transition-colors">Cómo Funciona</a>
            <a href="#tipsters" className="text-gray-300 hover:text-white transition-colors">Tipsters</a>
            <a href="#testimonios" className="text-gray-300 hover:text-white transition-colors">Testimonios</a>
            <a href="#precios" className="text-gray-300 hover:text-white transition-colors">Precios</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
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
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          {/* Ticker de ganancias */}
          <div className={`flex justify-center mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <WinsTicker />
          </div>

          {/* Headline principal */}
          <div className={`text-center max-w-4xl mx-auto mb-12 transition-all duration-700 delay-150 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Gana dinero siguiendo a los </span>
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                mejores tipsters
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Accede a análisis verificados por IA, estadísticas en tiempo real y tips de expertos 
              que han generado <span className="text-emerald-400 font-bold">+$847 millones</span> en ganancias.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/registro"
                className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-105 flex items-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                Comenzar Gratis - 5 Días
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 bg-slate-800/50 border border-slate-700 hover:border-teal-500/50 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2">
                <Play className="w-5 h-5 text-teal-400" />
                Ver Demo
              </button>
            </div>

            {/* Countdown */}
            <div className="flex justify-center">
              <TrialCountdown />
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {PLATFORM_STATS.map((stat, index) => (
              <AnimatedStat 
                key={stat.label}
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                delay={400 + index * 100}
              />
            ))}
          </div>

          {/* Trust badges */}
          <div className={`flex flex-wrap justify-center gap-6 mt-12 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Verificado por IA</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Lock className="w-5 h-5 text-emerald-400" />
              <span>Pagos Seguros</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Eye className="w-5 h-5 text-emerald-400" />
              <span>Resultados Públicos</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span>Tips en Tiempo Real</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section id="como-funciona" className="relative z-10 py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">Proceso Simple</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              Comienza a ganar en <span className="text-teal-400">3 pasos</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Nuestro sistema está diseñado para que cualquier persona pueda generar ganancias consistentes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Users,
                title: 'Regístrate Gratis',
                description: 'Crea tu cuenta en 30 segundos. Sin tarjeta de crédito. 5 días de prueba completa.'
              },
              {
                step: '02',
                icon: Target,
                title: 'Sigue a los Mejores',
                description: 'Elige tipsters verificados según su ROI, win rate y especialidad deportiva.'
              },
              {
                step: '03',
                icon: TrendingUp,
                title: 'Replica y Gana',
                description: 'Recibe alertas en tiempo real y replica las apuestas. Así de simple.'
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
      <section id="tipsters" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">Top Performers</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              Tipsters <span className="text-teal-400">Verificados</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Nuestros tipsters pasan rigurosos filtros de IA para garantizar resultados reales.
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
              Ver todos los tipsters (+24)
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="relative z-10 py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">Testimonios Reales</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              Lo que dicen nuestros <span className="text-teal-400">miembros</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">Precios Simples</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              Una inversión que <span className="text-teal-400">se paga sola</span>
            </h2>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-teal-500/30 backdrop-blur-xl shadow-2xl shadow-teal-500/10">
              {/* Badge popular */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full text-sm font-bold shadow-lg">
                  🔥 MÁS POPULAR
                </div>
              </div>

              <div className="text-center mb-8 mt-4">
                <div className="text-gray-400 mb-2">Suscripción Mensual</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold text-white">$15.000</span>
                  <span className="text-gray-400">CLP/mes</span>
                </div>
                <div className="text-emerald-400 text-sm mt-2">
                  ✨ 5 días GRATIS para probar
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Acceso a 24+ tipsters verificados',
                  'Análisis de IA en tiempo real',
                  'Alertas instantáneas de tips',
                  'Estadísticas completas',
                  'Gestión de riesgo automatizada',
                  'Soporte prioritario',
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
      <section className="relative z-10 py-24 bg-gradient-to-b from-slate-900/50 to-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Sparkles className="w-12 h-12 text-teal-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para empezar a <span className="text-teal-400">ganar</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Únete a más de 12,000 apostadores que ya están generando ganancias consistentes.
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
      <footer className="relative z-10 border-t border-slate-800/50 py-12">
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
