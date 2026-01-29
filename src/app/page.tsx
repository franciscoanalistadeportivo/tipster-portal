'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, Shield, Zap, Users, Trophy, Star, 
  CheckCircle, ArrowRight, Lock, Eye, 
  Target, Sparkles, ChevronRight, BadgeCheck, 
  Flame, Crown, Rocket, Calculator, Brain,
  DollarSign, PiggyBank, Award, Clock
} from 'lucide-react';

// ============================================
// TIPOS
// ============================================
interface SiteConfig {
  landing?: Record<string, string | number>;
  pricing?: Record<string, string | number>;
  general?: Record<string, string>;
  testimonios?: Array<{
    id: number;
    nombre: string;
    rol: string;
    imagen: string;
    texto: string;
    profit: string;
    rating: number;
  }>;
  pricing_features?: Array<{
    id: number;
    icono: string;
    titulo: string;
  }>;
}

// ============================================
// API URL
// ============================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://franciscoanalistadeportivo.pythonanywhere.com';

// ============================================
// COMPONENTES
// ============================================

// Ticker de ganancias (demo)
const DEMO_WINS = [
  { user: 'Carlos M.', amount: 245000, sport: '⚽', time: '2min' },
  { user: 'Andrea L.', amount: 180000, sport: '🎾', time: '5min' },
  { user: 'Miguel R.', amount: 520000, sport: '🏀', time: '8min' },
];

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
    </div>
  );
}

function TrialCountdown({ dias }: { dias: number }) {
  const [timeLeft, setTimeLeft] = useState({ days: dias, hours: 23, minutes: 59, seconds: 59 });

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

// ============================================
// LANDING PAGE DINÁMICA
// ============================================
export default function LandingPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/api/config/public`);
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error loading config:', error);
      // Usar valores por defecto si falla
      setConfig({
        landing: {
          landing_hero_badge: 'Múltiples canales premium por el precio de uno',
          landing_hero_titulo_1: 'Accede a Tipsters Premium',
          landing_hero_titulo_2: 'por solo',
          landing_hero_subtitulo: 'Reunimos los mejores canales de tipsters rentables en un solo portal con IA.',
          landing_cta_principal: 'Prueba 5 Días Gratis',
          stats_total_tipsters: 24,
          stats_win_rate: 73,
          stats_usuarios_activos: '12,450',
          stats_ganancias_total: '847M'
        },
        pricing: {
          precio_mensual: 15000,
          dias_trial: 5
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helpers para obtener valores de config
  const get = (key: string, defaultValue: string = '') => {
    return config?.landing?.[key]?.toString() || config?.pricing?.[key]?.toString() || defaultValue;
  };

  const getNum = (key: string, defaultValue: number = 0) => {
    const val = config?.landing?.[key] || config?.pricing?.[key];
    return typeof val === 'number' ? val : parseInt(val?.toString() || '0') || defaultValue;
  };

  const formatPrice = (num: number) => num.toLocaleString('es-CL');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1E293B] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E293B] text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
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
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-300 hover:text-white">Iniciar Sesión</Link>
            <Link href="/registro" className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg font-semibold">
              Prueba Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center mb-8">
            <WinsTicker />
          </div>

          <div className="text-center max-w-5xl mx-auto mb-12">
            {/* Badge dinámico */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full mb-6">
              <PiggyBank className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-semibold text-sm">{get('landing_hero_badge')}</span>
            </div>

            {/* Título dinámico */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">{get('landing_hero_titulo_1')} </span>
              <br />
              <span className="text-white">{get('landing_hero_titulo_2')} </span>
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                ${formatPrice(getNum('precio_mensual', 15000))} CLP
              </span>
            </h1>
            
            {/* Subtítulo dinámico */}
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {get('landing_hero_subtitulo')}
            </p>

            {/* Stats dinámicos */}
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300"><span className="text-white font-bold">{get('stats_win_rate', '73')}%</span> Win Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300"><span className="text-white font-bold">${get('stats_ganancias_total', '847M')}+</span> ganancias</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300"><span className="text-white font-bold">{get('stats_usuarios_activos', '12,450')}+</span> usuarios</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300"><span className="text-white font-bold">{get('stats_total_tipsters', '24')}+</span> tipsters</span>
              </div>
            </div>

            {/* CTA dinámico */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/registro"
                className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 rounded-xl font-bold text-lg shadow-2xl shadow-teal-500/30 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                {get('landing_cta_principal', 'Prueba 5 Días Gratis')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <span className="text-gray-400 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {get('landing_cta_secundario', 'Sin tarjeta de crédito')}
              </span>
            </div>

            {/* Countdown dinámico */}
            <div className="flex justify-center">
              <TrialCountdown dias={getNum('dias_trial', 5)} />
            </div>
          </div>
        </div>
      </section>

      {/* Sección Por Qué */}
      <section className="relative z-10 py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{get('porque_titulo', '¿Por qué TipsterPortal?')}</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{get('porque_subtitulo')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: DollarSign, color: 'amber', titleKey: 'porque_card1_titulo', textKey: 'porque_card1_texto' },
              { icon: Eye, color: 'teal', titleKey: 'porque_card2_titulo', textKey: 'porque_card2_texto' },
              { icon: Calculator, color: 'emerald', titleKey: 'porque_card3_titulo', textKey: 'porque_card3_texto' },
            ].map((card, i) => (
              <div key={i} className={`p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-${card.color}-500/30 transition-all`}>
                <div className={`w-14 h-14 rounded-2xl bg-${card.color}-500/20 flex items-center justify-center mb-4`}>
                  <card.icon className={`w-7 h-7 text-${card.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{get(card.titleKey)}</h3>
                <p className="text-gray-400">{get(card.textKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{get('pricing_titulo', 'Todos los tipsters por un solo precio')}</h2>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-teal-500/30 shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full text-sm font-bold">
                  {get('pricing_badge', '🔥 MEJOR VALOR')}
                </div>
              </div>

              <div className="text-center mb-8 mt-4">
                <div className="text-gray-400 mb-2">Acceso Completo</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold text-white">${formatPrice(getNum('precio_mensual', 15000))}</span>
                  <span className="text-gray-400">CLP/mes</span>
                </div>
                <div className="text-emerald-400 text-sm mt-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {getNum('dias_trial', 5)} días GRATIS para probar
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {(config?.pricing_features || []).map((feature, i) => (
                  <li key={feature.id || i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature.titulo}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/registro"
                className="block w-full py-4 text-center bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 rounded-xl font-bold text-lg shadow-lg"
              >
                {get('pricing_cta', 'Comenzar Prueba Gratis')}
              </Link>

              <p className="text-center text-gray-500 text-sm mt-4">
                {get('pricing_garantia', 'Sin tarjeta de crédito • Cancela cuando quieras')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios dinámicos */}
      {config?.testimonios && config.testimonios.length > 0 && (
        <section className="relative z-10 py-24 bg-slate-800/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Lo que dicen nuestros miembros</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {config.testimonios.map((t) => (
                <div key={t.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-xl">
                      {t.imagen}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{t.nombre}</div>
                      <div className="text-gray-400 text-xs">{t.rol}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm italic mb-4">&ldquo;{t.texto}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div className="text-emerald-400 font-bold font-mono">{t.profit}</div>
                    <div className="flex gap-0.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Sparkles className="w-12 h-12 text-teal-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6">{get('cta_final_titulo')}</h2>
          <p className="text-xl text-gray-400 mb-8">{get('cta_final_subtitulo')}</p>
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 rounded-xl font-bold text-xl shadow-2xl hover:scale-105 transition-all"
          >
            <Flame className="w-6 h-6" />
            {get('cta_final_boton', 'Comenzar Gratis Ahora')}
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Tipster</span>
              <span className="text-teal-400">Portal</span>
            </span>
          </div>
          <div className="text-gray-500 text-sm">© 2026 TipsterPortal. Todos los derechos reservados.</div>
        </div>
      </footer>
    </div>
  );
}
