'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, TrendingDown, Users, Calendar, Target, AlertTriangle, 
  ChevronRight, Zap, Trophy, Clock, Star, ArrowUpRight, Brain,
  Flame, Shield, Eye, Activity, BarChart3
} from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface DashboardData {
  totalTipsters: number;
  apuestasHoy: number;
  topTipster: { alias: string; ganancia: number } | null;
  alertas: { alias: string; racha: number }[];
  apuestasRecientes: any[];
}

// ============================================================================
// FRASES ROTATIVAS NEUROTIPS
// ============================================================================
const FRASES_NEUROTIPS = [
  "Hacemos lo que el ojo humano no ve",
  "Datos que ganan apuestas",
  "Tu ventaja empieza aquí",
  "Análisis inteligente, decisiones rentables",
  "El poder de la IA en cada apuesta",
];

const FraseRotativa = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % FRASES_NEUROTIPS.length);
        setFade(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span 
      className="transition-all duration-400"
      style={{ 
        opacity: fade ? 1 : 0,
        color: '#00D1B2',
        fontStyle: 'italic',
        fontSize: '14px'
      }}
    >
      &quot;{FRASES_NEUROTIPS[index]}&quot;
    </span>
  );
};

// ============================================================================
// COUNTDOWN TIMER
// ============================================================================
const CountdownTimer = ({ days }: { days: number }) => {
  const [timeLeft, setTimeLeft] = useState({ days, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        else if (days > 0) { days--; hours = 23; minutes = 59; seconds = 59; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="countdown-box">{timeLeft.days}d</div>
      <span className="text-gold-400">:</span>
      <div className="countdown-box">{String(timeLeft.hours).padStart(2, '0')}h</div>
      <span className="text-gold-400">:</span>
      <div className="countdown-box">{String(timeLeft.minutes).padStart(2, '0')}m</div>
      <span className="text-gold-400">:</span>
      <div className="countdown-box">{String(timeLeft.seconds).padStart(2, '0')}s</div>
    </div>
  );
};

// ============================================================================
// MINI SPARKLINE
// ============================================================================
const MiniSparkline = ({ positive = true }: { positive?: boolean }) => {
  const points = positive 
    ? "0,20 10,18 20,15 30,12 40,14 50,8 60,5"
    : "0,5 10,8 20,12 30,10 40,15 50,18 60,20";
  
  return (
    <svg width="60" height="25" viewBox="0 0 60 25">
      <defs>
        <linearGradient id={`spark-${positive ? 'up' : 'dn'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={positive ? '#00D1B2' : '#EF4444'} stopOpacity="0.4" />
          <stop offset="100%" stopColor={positive ? '#00D1B2' : '#EF4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points + ' 60,25 0,25'} fill={`url(#spark-${positive ? 'up' : 'dn'})`} />
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#00D1B2' : '#EF4444'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

// ============================================================================
// BARRA DE PROGRESO ANIMADA (para pendientes)
// ============================================================================
const ProgressBarPendiente = () => (
  <div style={{ 
    width: '100%', height: '4px', borderRadius: '2px',
    background: 'rgba(255, 187, 0, 0.15)', overflow: 'hidden', marginTop: '8px'
  }}>
    <div style={{
      width: '60%', height: '100%', borderRadius: '2px',
      background: 'linear-gradient(90deg, #F59E0B, #FFDD57)',
      animation: 'pendienteProgress 2s ease-in-out infinite alternate'
    }} />
  </div>
);

// ============================================================================
// INSIGHTS IA - Genera insights dinámicos
// ============================================================================
const generarInsights = (data: DashboardData) => {
  const insights: { emoji: string; texto: string; tipo: 'positivo' | 'neutral' | 'precaucion' }[] = [];
  
  if (data.alertas.length > 0) {
    const nombres = data.alertas.slice(0, 2).map(a => a.alias).join(', ');
    insights.push({
      emoji: '⚠️',
      texto: `${nombres} en racha negativa. Reducir exposición.`,
      tipo: 'precaucion'
    });
  }
  
  if (data.topTipster && data.topTipster.ganancia > 0) {
    insights.push({
      emoji: '🔥',
      texto: `${data.topTipster.alias} lidera con +$${Math.abs(data.topTipster.ganancia).toLocaleString()}. Buen momento.`,
      tipo: 'positivo'
    });
  }
  
  if (data.apuestasHoy > 0) {
    insights.push({
      emoji: '📊',
      texto: `${data.apuestasHoy} apuestas activas hoy. Mercado en movimiento.`,
      tipo: 'neutral'
    });
  }

  insights.push({
    emoji: '💡',
    texto: 'Zona óptima de cuotas hoy: 1.50 - 1.75 según tendencias.',
    tipo: 'neutral'
  });

  return insights.slice(0, 4);
};

// ============================================================================
// PÁGINA DASHBOARD
// ============================================================================
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<DashboardData>({
    totalTipsters: 0, apuestasHoy: 0, topTipster: null, alertas: [], apuestasRecientes: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await dashboardAPI.getData();
        setData({
          totalTipsters: dashboardData.tipsters?.total || 0,
          apuestasHoy: dashboardData.apuestas?.total || 0,
          topTipster: dashboardData.topTipster || null,
          alertas: dashboardData.alertas || [],
          apuestasRecientes: (dashboardData.apuestas?.apuestas || []).slice(0, 5)
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDiasRestantes = () => {
    if (!user?.suscripcion_hasta) return 5;
    const hasta = new Date(user.suscripcion_hasta);
    const hoy = new Date();
    return Math.max(0, Math.ceil((hasta.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  const diasRestantes = getDiasRestantes();
  const insights = generarInsights(data);
  const pendientes = data.apuestasRecientes.filter(a => a.resultado === 'PENDIENTE');
  const resueltas = data.apuestasRecientes.filter(a => a.resultado !== 'PENDIENTE');

  return (
    <div className="space-y-5 animate-fadeIn pb-20 lg:pb-6">

      {/* ============================================================ */}
      {/* HEADER: Logo + Saludo + Frase Rotativa                       */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <img 
              src="/logo-icon.png" 
              alt="NeuroTips" 
              style={{ width: '40px', height: '40px', borderRadius: '10px' }}
            />
            <div>
              <h1 className="text-2xl font-bold text-white">
                ¡Hola, {user?.nombre || 'Apostador'}!
              </h1>
              <FraseRotativa />
            </div>
          </div>
        </div>
        {user?.plan === 'PREMIUM' && (
          <div className="badge-gold flex items-center gap-1.5">
            <Trophy className="h-4 w-4" />
            Miembro Premium
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* TRIAL BANNER                                                  */}
      {/* ============================================================ */}
      {user?.plan === 'FREE_TRIAL' && (
        <div className="trial-banner animate-fadeInUp">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#FFDD57]/10">
                <Clock className="h-7 w-7 text-[#FFDD57]" />
              </div>
              <div>
                <p className="text-[#FFDD57] font-bold text-lg">🔥 Período de Prueba Activo</p>
                <p className="text-[#94A3B8] text-sm">Suscríbete hoy y mantén el acceso ilimitado</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <CountdownTimer days={diasRestantes} />
              <Link href="/dashboard/suscripcion" className="btn-pulse whitespace-nowrap">
                Suscribirse Ahora
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* KPI CARDS                                                     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* TIPSTERS ACTIVOS */}
        <div className="stat-card animate-fadeInUp stagger-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-[#00D1B2]/10">
              <Users className="h-5 w-5 text-[#00D1B2]" />
            </div>
            {data.totalTipsters > 0 && (
              <span className="badge-success text-[10px]">Activos</span>
            )}
          </div>
          <p className="text-3xl font-bold text-white font-mono">{data.totalTipsters}</p>
          <p className="text-[#94A3B8] text-sm mt-1">Tipsters Activos</p>
        </div>

        {/* APUESTAS HOY - BORDE DORADO PULSANTE */}
        <div 
          className="animate-fadeInUp stagger-2 rounded-2xl p-5"
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '2px solid rgba(255, 187, 0, 0.5)',
            boxShadow: '0 0 20px rgba(255, 187, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            animation: 'goldPulse 2s ease-in-out infinite'
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255, 187, 0, 0.15)' }}>
              <Calendar className="h-5 w-5 text-[#FFBB00]" />
            </div>
            {data.apuestasHoy > 0 && (
              <span style={{
                background: 'linear-gradient(135deg, #DC2626, #EF4444)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                animation: 'livePulse 1.5s ease-in-out infinite'
              }}>
                <span style={{ 
                  width: '6px', height: '6px', borderRadius: '50%', 
                  background: 'white', display: 'inline-block'
                }} />
                EN VIVO
              </span>
            )}
          </div>
          <p className="text-3xl font-bold font-mono" style={{ color: '#FFBB00' }}>
            {data.apuestasHoy}
          </p>
          <p className="text-sm mt-1" style={{ color: '#D4A843' }}>Apuestas Hoy</p>
        </div>

        {/* TIPSTER DEL MES */}
        <div className="stat-card animate-fadeInUp stagger-3" style={{ borderColor: 'rgba(255, 221, 87, 0.25)' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255, 221, 87, 0.1)' }}>
              <Trophy className="h-5 w-5 text-[#FFDD57]" />
            </div>
            <MiniSparkline positive={true} />
          </div>
          <p className="text-lg font-bold text-white truncate">
            {data.topTipster?.alias || '—'}
          </p>
          {data.topTipster && (
            <p className="text-[#00D1B2] font-mono font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="h-3.5 w-3.5" />
              +${Math.abs(data.topTipster.ganancia).toLocaleString()}
            </p>
          )}
          <p className="text-xs mt-1" style={{ color: '#D4A843' }}>
            👑 Tipster del Mes
          </p>
        </div>

        {/* ALERTAS */}
        <div className="stat-card animate-fadeInUp stagger-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${data.alertas.length > 0 ? 'bg-[#EF4444]/10' : 'bg-[#00D1B2]/10'}`}>
              {data.alertas.length > 0 
                ? <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
                : <Shield className="h-5 w-5 text-[#00D1B2]" />
              }
            </div>
            {data.alertas.length > 0 && (
              <span style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
              }}>
                ¡Atención!
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-white font-mono">{data.alertas.length}</p>
          <p className="text-[#94A3B8] text-sm mt-1">
            {data.alertas.length > 0 ? 'Alertas Activas' : '✅ Sin Alertas'}
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* APUESTAS EN JUEGO - CARDS INDIVIDUALES                       */}
      {/* ============================================================ */}
      <div 
        className="rounded-2xl p-5 border border-white/10 animate-fadeInUp"
        style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255, 187, 0, 0.1)' }}>
              <Activity className="h-5 w-5 text-[#FFBB00]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Apuestas en Juego</h3>
              <p className="text-xs text-[#94A3B8]">
                {pendientes.length > 0 
                  ? `${pendientes.length} pendiente${pendientes.length > 1 ? 's' : ''} · ${resueltas.length} resueltas`
                  : `${data.apuestasHoy} operaciones hoy`
                }
              </p>
            </div>
          </div>
          <Link 
            href="/dashboard/apuestas" 
            className="flex items-center gap-1 text-sm text-[#00D1B2] hover:text-[#00E5C3] transition-colors"
          >
            Ver todas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {data.apuestasRecientes.length > 0 ? (
          <div className="space-y-3">
            {/* PENDIENTES PRIMERO - DESTACADAS */}
            {pendientes.map((apuesta: any, idx: number) => (
              <div 
                key={`p-${idx}`}
                className="rounded-xl p-4 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 187, 0, 0.08) 0%, rgba(255, 221, 87, 0.03) 100%)',
                  border: '1.5px solid rgba(255, 187, 0, 0.35)',
                  animation: 'pendienteBorder 3s ease-in-out infinite'
                }}
              >
                {/* Badge PENDIENTE */}
                <div className="flex items-center justify-between mb-2">
                  <span style={{
                    background: 'linear-gradient(135deg, #F59E0B, #FFBB00)',
                    color: '#000',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    ⏳ PENDIENTE
                  </span>
                  <span className="font-mono font-bold text-[#FFBB00]">
                    @{Number(apuesta.cuota || 0).toFixed(2)}
                  </span>
                </div>
                
                {/* Apuesta */}
                <p className="text-white font-medium text-sm leading-snug mb-1">
                  {apuesta.apuesta}
                </p>
                
                {/* Info extra */}
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Esperando resultado...
                  </span>
                  {apuesta.stake_ia && (
                    <span className="font-mono">Stake: ${Number(apuesta.stake_ia).toLocaleString()}</span>
                  )}
                </div>
                
                {/* Barra de progreso */}
                <ProgressBarPendiente />
              </div>
            ))}

            {/* RESUELTAS */}
            {resueltas.map((apuesta: any, idx: number) => (
              <div 
                key={`r-${idx}`}
                className="rounded-xl p-3"
                style={{
                  background: apuesta.resultado === 'GANADA' 
                    ? 'rgba(0, 209, 178, 0.06)' 
                    : 'rgba(239, 68, 68, 0.06)',
                  border: `1px solid ${apuesta.resultado === 'GANADA' 
                    ? 'rgba(0, 209, 178, 0.2)' 
                    : 'rgba(239, 68, 68, 0.2)'}`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700, flexShrink: 0,
                      background: apuesta.resultado === 'GANADA' ? 'rgba(0, 209, 178, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: apuesta.resultado === 'GANADA' ? '#00D1B2' : '#EF4444'
                    }}>
                      {apuesta.resultado === 'GANADA' ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-white truncate">{apuesta.apuesta}</span>
                  </div>
                  <span className={`text-xs font-bold font-mono ml-2 flex-shrink-0 ${
                    apuesta.resultado === 'GANADA' ? 'text-[#00D1B2]' : 'text-[#EF4444]'
                  }`}>
                    @{Number(apuesta.cuota || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}

            {/* Si no hay apuestas */}
            {data.apuestasRecientes.length === 0 && (
              <p className="text-[#94A3B8] text-sm text-center py-6">
                No hay apuestas hoy. Las apuestas aparecerán aquí cuando se registren.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-10 w-10 text-[#334155] mx-auto mb-3" />
            <p className="text-[#94A3B8] text-sm">No hay apuestas hoy</p>
            <p className="text-[#64748B] text-xs mt-1">Las apuestas se registran desde el bot de Telegram</p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* INSIGHTS IA + RECOMENDACIONES                                */}
      {/* ============================================================ */}
      <div className="grid lg:grid-cols-2 gap-4">
        
        {/* INSIGHTS IA */}
        <div 
          className="rounded-2xl p-5 animate-fadeInUp"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 209, 178, 0.08) 0%, rgba(30, 41, 59, 0.7) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 209, 178, 0.25)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-[#00D1B2]/15">
              <Brain className="h-5 w-5 text-[#00D1B2]" />
            </div>
            <div>
              <h3 className="font-bold text-white">NeuroTips IA</h3>
              <p className="text-xs text-[#94A3B8]">Insights del día</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div 
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{
                  background: insight.tipo === 'positivo' ? 'rgba(0, 209, 178, 0.08)' 
                    : insight.tipo === 'precaucion' ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(59, 130, 246, 0.08)',
                  border: `1px solid ${
                    insight.tipo === 'positivo' ? 'rgba(0, 209, 178, 0.15)' 
                    : insight.tipo === 'precaucion' ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(59, 130, 246, 0.15)'
                  }`
                }}
              >
                <span className="text-lg flex-shrink-0">{insight.emoji}</span>
                <p className="text-sm text-[#E2E8F0] leading-snug">{insight.texto}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RECOMENDACIONES IA */}
        <Link href="/dashboard/recomendaciones" className="card-premium group animate-fadeInUp block">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FFDD57]/10">
                <Zap className="h-6 w-6 text-[#FFDD57]" />
              </div>
              <div>
                <h3 className="font-bold text-white">Recomendaciones IA</h3>
                <p className="text-sm text-[#94A3B8]">Picks de alta confianza</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-[#FFDD57] group-hover:translate-x-1 transition-all" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="badge-ia">
                <Star className="h-3 w-3" />
                IA Approved
              </span>
              <span className="text-xs text-[#94A3B8]">Top picks del día</span>
            </div>
            <p className="text-white text-sm">
              Análisis inteligente basado en rendimiento histórico, EV+ y gestión de banca personalizada.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { icon: Target, label: 'EV+' },
                { icon: BarChart3, label: 'Kelly' },
                { icon: Shield, label: 'Filtro' },
              ].map((item, i) => (
                <div key={i} className="bg-[#0F172A]/50 rounded-lg p-2 text-center">
                  <item.icon className="h-4 w-4 text-[#FFDD57] mx-auto mb-1" />
                  <p className="text-[#94A3B8] text-xs">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* ALERTAS RACHA NEGATIVA                                       */}
      {/* ============================================================ */}
      {data.alertas.length > 0 && (
        <div 
          className="rounded-2xl p-5 animate-fadeInUp"
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderLeft: '4px solid #EF4444',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
            <h3 className="font-bold text-white">⚠️ Zona de Riesgo</h3>
            <span style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              fontSize: '10px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              marginLeft: 'auto',
            }}>
              Precaución
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.alertas.map((alerta, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg"
                style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.15)'
                }}
              >
                <span className="text-sm text-white">{alerta.alias}</span>
                <span className="font-mono text-sm text-[#EF4444] flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {alerta.racha}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#94A3B8] mt-3">
            💡 La IA reduce automáticamente los stakes de estos tipsters
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* RENDIMIENTO GLOBAL                                           */}
      {/* ============================================================ */}
      <div 
        className="rounded-2xl p-5 animate-fadeInUp"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Star className="h-5 w-5 text-[#FFDD57]" />
          <h3 className="font-bold text-white">Rendimiento Global</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(0, 209, 178, 0.08)', border: '1px solid rgba(0, 209, 178, 0.15)' }}>
            <p className="text-2xl font-bold text-[#00D1B2] font-mono">+$847K</p>
            <p className="text-xs text-[#94A3B8] mt-1">Profit este mes</p>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <p className="text-2xl font-bold text-white font-mono">78%</p>
            <p className="text-xs text-[#94A3B8] mt-1">Win Rate Promedio</p>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <p className="text-2xl font-bold text-white font-mono">1,250+</p>
            <p className="text-xs text-[#94A3B8] mt-1">Apuestas Analizadas</p>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255, 221, 87, 0.08)', border: '1px solid rgba(255, 221, 87, 0.15)' }}>
            <p className="text-2xl font-bold text-[#FFDD57] font-mono">+12.3%</p>
            <p className="text-xs text-[#94A3B8] mt-1">Yield Mensual</p>
          </div>
        </div>
        
        {/* Barra visual */}
        <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#94A3B8]">Efectividad del sistema</span>
            <span className="text-xs font-bold text-[#00D1B2]">78%</span>
          </div>
          <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ 
              width: '78%', height: '100%', borderRadius: '3px',
              background: 'linear-gradient(90deg, #00D1B2, #00E5C3)',
              boxShadow: '0 0 10px rgba(0, 209, 178, 0.4)'
            }} />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FOOTER                                                        */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between text-xs text-[#64748B] pt-4 border-t border-slate-800/50">
        <span className="font-mono">
          🧠 NeuroTips v5.0 · Última actualización: hace 2 min
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#00D1B2] rounded-full animate-pulse"></span>
          Sistema Activo
        </span>
      </div>

      {/* ============================================================ */}
      {/* CSS ANIMATIONS                                                */}
      {/* ============================================================ */}
      <style jsx>{`
        @keyframes goldPulse {
          0%, 100% { box-shadow: 0 0 15px rgba(255, 187, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.05); border-color: rgba(255, 187, 0, 0.4); }
          50% { box-shadow: 0 0 25px rgba(255, 187, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.05); border-color: rgba(255, 187, 0, 0.7); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes pendienteBorder {
          0%, 100% { border-color: rgba(255, 187, 0, 0.25); box-shadow: 0 0 0 rgba(255, 187, 0, 0); }
          50% { border-color: rgba(255, 187, 0, 0.5); box-shadow: 0 0 15px rgba(255, 187, 0, 0.08); }
        }
        @keyframes pendienteProgress {
          0% { width: 30%; opacity: 0.5; }
          50% { width: 70%; opacity: 1; }
          100% { width: 30%; opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
