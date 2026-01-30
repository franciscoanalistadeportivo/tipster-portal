'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, TrendingDown, Users, Calendar, Target, AlertTriangle, 
  ChevronRight, Zap, Trophy, Clock, Star, ArrowUpRight
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

// Componente Countdown
const CountdownTimer = ({ days }: { days: number }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: days,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
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

// Componente Mini Sparkline
const MiniSparkline = ({ positive = true }: { positive?: boolean }) => {
  const points = positive 
    ? "0,20 10,18 20,15 30,12 40,14 50,8 60,5"
    : "0,5 10,8 20,12 30,10 40,15 50,18 60,20";
  
  return (
    <svg width="60" height="25" viewBox="0 0 60 25">
      <polyline
        points={points}
        className={positive ? 'sparkline-up' : 'sparkline-down'}
      />
    </svg>
  );
};

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<DashboardData>({
    totalTipsters: 0,
    apuestasHoy: 0,
    topTipster: null,
    alertas: [],
    apuestasRecientes: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Usa el endpoint público que combina todos los datos
        const dashboardData = await dashboardAPI.getData();
        
        setData({
          totalTipsters: dashboardData.tipsters?.total || 0,
          apuestasHoy: dashboardData.apuestas?.total || 0,
          topTipster: dashboardData.topTipster || null,
          alertas: dashboardData.alertas || [],
          apuestasRecientes: (dashboardData.apuestas?.apuestas || []).slice(0, 3)
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
    const diff = Math.ceil((hasta.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  const diasRestantes = getDiasRestantes();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Personalizado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            ¡Hola, {user?.nombre || 'Apostador'}! 👋
          </h1>
          <p className="text-[#94A3B8] mt-1">
            Bienvenido al <span className="text-[#00D1B2]">Club de Tipsters Premium</span>
          </p>
        </div>
        {user?.plan === 'PREMIUM' && (
          <div className="badge-gold flex items-center gap-1.5">
            <Trophy className="h-4 w-4" />
            Miembro Premium
          </div>
        )}
      </div>

      {/* Trial Banner con Countdown */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tipsters Activos */}
        <div className="stat-card animate-fadeInUp stagger-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-[#00D1B2]/10">
              <Users className="h-5 w-5 text-[#00D1B2]" />
            </div>
            <span className="badge-success text-[10px]">+3 nuevo</span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">{data.totalTipsters}</p>
          <p className="text-[#94A3B8] text-sm mt-1">Tipsters Activos</p>
        </div>

        {/* Apuestas Hoy */}
        <div className="stat-card animate-fadeInUp stagger-2">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-[#3B82F6]/10">
              <Calendar className="h-5 w-5 text-[#3B82F6]" />
            </div>
            {data.apuestasHoy > 0 && (
              <span className="badge-live">LIVE</span>
            )}
          </div>
          <p className="text-3xl font-bold text-white font-mono">{data.apuestasHoy}</p>
          <p className="text-[#94A3B8] text-sm mt-1">Apuestas Hoy</p>
        </div>

        {/* Top Performer */}
        <div className="stat-card animate-fadeInUp stagger-3 border-[#FFDD57]/20">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-[#FFDD57]/10">
              <Trophy className="h-5 w-5 text-[#FFDD57]" />
            </div>
            <MiniSparkline positive={true} />
          </div>
          <p className="text-lg font-bold text-white truncate">{data.topTipster?.alias || '—'}</p>
          {data.topTipster && (
            <p className="text-[#00D1B2] font-mono font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4" />
              +${Math.abs(data.topTipster.ganancia).toLocaleString()}
            </p>
          )}
          <p className="text-[#94A3B8] text-xs mt-1">Top Performer</p>
        </div>

        {/* Alertas */}
        <div className="stat-card animate-fadeInUp stagger-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${data.alertas.length > 0 ? 'bg-[#EF4444]/10' : 'bg-slate-700/50'}`}>
              <AlertTriangle className={`h-5 w-5 ${data.alertas.length > 0 ? 'text-[#EF4444]' : 'text-slate-500'}`} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-mono">{data.alertas.length}</p>
          <p className="text-[#94A3B8] text-sm mt-1">
            {data.alertas.length > 0 ? 'Tipsters en Racha Negativa' : 'Sin Alertas'}
          </p>
        </div>
      </div>

      {/* Quick Actions + Preview */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Apuestas de Hoy Card */}
        <Link href="/dashboard/apuestas" className="card-hero group animate-fadeInUp stagger-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#00D1B2]/10">
                <Calendar className="h-6 w-6 text-[#00D1B2]" />
              </div>
              <div>
                <h3 className="font-bold text-white">Apuestas de Hoy</h3>
                <p className="text-sm text-[#94A3B8]">{data.apuestasHoy} operaciones activas</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-[#00D1B2] group-hover:translate-x-1 transition-all" />
          </div>
          
          {/* Preview de apuestas */}
          {data.apuestasRecientes.length > 0 ? (
            <div className="space-y-2">
              {data.apuestasRecientes.map((apuesta: any, idx: number) => (
                <div key={idx} className={`flex items-center justify-between p-2.5 rounded-lg ${
                  apuesta.resultado === 'GANADA' ? 'bg-[#00D1B2]/5' :
                  apuesta.resultado === 'PERDIDA' ? 'bg-[#EF4444]/5' : 'bg-slate-800/50'
                }`}>
                  <span className="text-sm text-white truncate max-w-[60%]">{apuesta.apuesta}</span>
                  <span className={`text-xs font-bold font-mono ${
                    apuesta.resultado === 'GANADA' ? 'text-[#00D1B2]' :
                    apuesta.resultado === 'PERDIDA' ? 'text-[#EF4444]' : 'text-[#FFDD57]'
                  }`}>
                    {apuesta.resultado === 'GANADA' ? '+' : apuesta.resultado === 'PERDIDA' ? '-' : ''}
                    @{apuesta.cuota}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#94A3B8] text-sm text-center py-4">No hay apuestas hoy</p>
          )}
        </Link>

        {/* Recomendaciones IA Card */}
        <Link href="/dashboard/recomendaciones" className="card-premium group animate-fadeInUp stagger-4">
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
              Análisis inteligente basado en rendimiento histórico y EV+
            </p>
          </div>
        </Link>
      </div>

      {/* Alertas Mala Racha */}
      {data.alertas.length > 0 && (
        <div className="card-elite border-l-4 border-l-[#EF4444] animate-fadeInUp stagger-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
            <h3 className="font-bold text-white">Zona de Riesgo</h3>
            <span className="badge-danger ml-auto">Evitar</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.alertas.map((alerta, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg bg-[#EF4444]/5 border border-[#EF4444]/10"
              >
                <span className="text-sm text-white">{alerta.alias}</span>
                <span className="font-mono text-sm text-[#EF4444] flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {alerta.racha}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Proof */}
      <div className="card-elite animate-fadeInUp">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-[#FFDD57]" />
          <h3 className="font-bold text-white">Ganancias de Miembros</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#00D1B2] font-mono">+$847K</p>
            <p className="text-xs text-[#94A3B8]">Este mes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">78%</p>
            <p className="text-xs text-[#94A3B8]">Win Rate Promedio</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">1,250+</p>
            <p className="text-xs text-[#94A3B8]">Apuestas Analizadas</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[#64748B] pt-4 border-t border-slate-800/50">
        <span className="font-mono">Última actualización: hace 2 min</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#00D1B2] rounded-full animate-pulse"></span>
          Sistema Activo
        </span>
      </div>
    </div>
  );
}
