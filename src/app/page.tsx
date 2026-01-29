'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, TrendingDown, Users, Calendar, Target, AlertTriangle, 
  ArrowRight, Zap, Activity, ChevronRight, Brain
} from 'lucide-react';
import { tipstersAPI, apuestasAPI, recomendacionesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface DashboardData {
  totalTipsters: number;
  apuestasHoy: number;
  topTipster: { alias: string; ganancia: number } | null;
  alertas: { alias: string; racha: number }[];
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<DashboardData>({
    totalTipsters: 0,
    apuestasHoy: 0,
    topTipster: null,
    alertas: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tipstersRes, apuestasRes, recomendacionesRes] = await Promise.all([
          tipstersAPI.getAll(),
          apuestasAPI.getHoy(),
          recomendacionesAPI.get(),
        ]);

        const tipsters = tipstersRes.tipsters || [];
        const topTipster = tipsters.length > 0 
          ? tipsters.reduce((prev: any, curr: any) => 
              curr.ganancia_total > prev.ganancia_total ? curr : prev
            )
          : null;

        setData({
          totalTipsters: tipsters.length,
          apuestasHoy: apuestasRes.total || 0,
          topTipster: topTipster ? { alias: topTipster.alias, ganancia: topTipster.ganancia_total } : null,
          alertas: recomendacionesRes.evitar || [],
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
    if (!user?.suscripcion_hasta) return 0;
    const hasta = new Date(user.suscripcion_hasta);
    const hoy = new Date();
    const diff = Math.ceil((hasta.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 text-emerald-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Centro de Operaciones
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Bienvenido, <span className="text-slate-300">{user?.nombre || 'Operador'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Sistema Activo
        </div>
      </div>

      {/* Alerta de suscripción */}
      {user?.plan === 'FREE_TRIAL' && (
        <div className="card-ops border-l-4 border-l-amber-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeInUp stagger-1">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-amber-500/10">
              <Calendar className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-amber-400 text-sm">Período de Prueba Activo</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {getDiasRestantes()} días restantes
              </p>
            </div>
          </div>
          <Link href="/dashboard/suscripcion" className="btn-gold text-sm py-2 px-4">
            Actualizar Plan
          </Link>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tipsters Activos */}
        <div className="stat-card animate-fadeInUp stagger-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Tipsters</p>
              <p className="text-3xl font-bold text-white mt-1 font-mono">{data.totalTipsters}</p>
              <p className="text-xs text-slate-500 mt-1">activos</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Apuestas Hoy */}
        <div className="stat-card animate-fadeInUp stagger-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Hoy</p>
              <p className="text-3xl font-bold text-white mt-1 font-mono">{data.apuestasHoy}</p>
              <p className="text-xs text-slate-500 mt-1">apuestas</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Calendar className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Top Tipster */}
        <div className="stat-card animate-fadeInUp stagger-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Top Performer</p>
              <p className="text-lg font-bold text-white mt-1 truncate max-w-[120px]">
                {data.topTipster?.alias || '—'}
              </p>
              {data.topTipster && (
                <p className="text-sm text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +${Math.abs(data.topTipster.ganancia).toLocaleString()}
                </p>
              )}
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Target className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="stat-card animate-fadeInUp stagger-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Alertas</p>
              <p className="text-3xl font-bold text-white mt-1 font-mono">{data.alertas.length}</p>
              <p className="text-xs text-red-400 mt-1">
                {data.alertas.length > 0 ? 'requieren atención' : 'sin alertas'}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${data.alertas.length > 0 ? 'bg-red-500/10' : 'bg-slate-700/50'}`}>
              <AlertTriangle className={`h-5 w-5 ${data.alertas.length > 0 ? 'text-red-400' : 'text-slate-500'}`} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/dashboard/apuestas" className="card-ops group hover:border-emerald-500/30 animate-fadeInUp stagger-3">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <Calendar className="h-6 w-6 text-emerald-400" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                Apuestas del Día
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">Monitor de operaciones activas</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link href="/dashboard/recomendaciones" className="card-ops group hover:border-amber-500/30 animate-fadeInUp stagger-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
              <Brain className="h-6 w-6 text-amber-400" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                Análisis IA
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">Recomendaciones inteligentes</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Alertas de mala racha */}
      {data.alertas.length > 0 && (
        <div className="card-ops border-l-4 border-l-red-500 animate-fadeInUp stagger-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="font-semibold text-white">Tipsters en Mala Racha</h3>
            <span className="badge-danger ml-auto">Evitar</span>
          </div>
          <div className="space-y-2">
            {data.alertas.map((alerta, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-red-500/5 border border-red-500/10 table-row-hover"
              >
                <span className="text-sm text-slate-300">{alerta.alias}</span>
                <span className="font-mono text-sm text-red-400 flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {alerta.racha}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Status */}
      <div className="flex items-center justify-between text-xs text-slate-600 pt-4 border-t border-slate-800/50">
        <span className="font-mono">Última actualización: hace 5 min</span>
        <span className="font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          API conectada
        </span>
      </div>
    </div>
  );
}
