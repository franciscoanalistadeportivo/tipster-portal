'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Users, Calendar, Target, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
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
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
          Hola, {user?.nombre || 'Usuario'} 👋
        </h1>
        <p className="text-navy-400 mt-1">
          Bienvenido al Director de Riesgos
        </p>
      </div>

      {/* Alerta de suscripción */}
      {user?.plan === 'FREE_TRIAL' && (
        <div className="bg-gradient-to-r from-gold-500/10 to-gold-600/10 border border-gold-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gold-500/20 p-3 rounded-xl">
              <Calendar className="h-6 w-6 text-gold-400" />
            </div>
            <div>
              <p className="font-semibold text-gold-400">Período de Prueba</p>
              <p className="text-sm text-gold-300/70">Te quedan {getDiasRestantes()} días de prueba gratis</p>
            </div>
          </div>
          <Link href="/dashboard/suscripcion" className="btn-gold text-sm whitespace-nowrap">
            Suscribirse Ahora
          </Link>
        </div>
      )}

      {user?.plan === 'EXPIRED' && (
        <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-red-500/20 p-3 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-red-400">Suscripción Expirada</p>
              <p className="text-sm text-red-300/70">Renueva tu suscripción para continuar</p>
            </div>
          </div>
          <Link href="/dashboard/suscripcion" className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors whitespace-nowrap">
            Renovar Ahora
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-400">Tipsters Activos</p>
              <p className="text-3xl font-display font-bold text-white mt-1">{data.totalTipsters}</p>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-xl">
              <Users className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-400">Apuestas Hoy</p>
              <p className="text-3xl font-display font-bold text-white mt-1">{data.apuestasHoy}</p>
            </div>
            <div className="bg-gold-500/10 p-3 rounded-xl">
              <Calendar className="h-6 w-6 text-gold-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-400">Top Tipster</p>
              <p className="text-lg font-display font-bold text-white mt-1">{data.topTipster?.alias || '-'}</p>
              {data.topTipster && (
                <p className="text-sm text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4" />
                  ${data.topTipster.ganancia.toLocaleString()}
                </p>
              )}
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-xl">
              <Target className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-navy-400">Alertas</p>
              <p className="text-3xl font-display font-bold text-white mt-1">{data.alertas.length}</p>
              {data.alertas.length > 0 && (
                <p className="text-sm text-red-400 mt-1">Tipsters en mala racha</p>
              )}
            </div>
            <div className="bg-red-500/10 p-3 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/dashboard/apuestas" className="card group hover:border-emerald-500/30">
          <div className="flex items-center gap-5">
            <div className="bg-emerald-500/10 p-4 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
              <Calendar className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display font-bold text-white group-hover:text-emerald-400 transition-colors">
                Ver Apuestas de Hoy
              </h3>
              <p className="text-navy-400 text-sm mt-1">Revisa todas las apuestas activas</p>
            </div>
            <ArrowRight className="h-5 w-5 text-navy-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link href="/dashboard/recomendaciones" className="card group hover:border-gold-500/30">
          <div className="flex items-center gap-5">
            <div className="bg-gold-500/10 p-4 rounded-xl group-hover:bg-gold-500/20 transition-colors">
              <Zap className="h-8 w-8 text-gold-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display font-bold text-white group-hover:text-gold-400 transition-colors">
                Recomendaciones IA
              </h3>
              <p className="text-navy-400 text-sm mt-1">Top tipsters y apuestas seguras</p>
            </div>
            <ArrowRight className="h-5 w-5 text-navy-500 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Alertas de mala racha */}
      {data.alertas.length > 0 && (
        <div className="card border-l-4 border-l-red-500">
          <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Tipsters en Mala Racha (Evitar)
          </h3>
          <div className="space-y-3">
            {data.alertas.map((alerta, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-navy-700/50 last:border-0">
                <span className="font-medium text-white">{alerta.alias}</span>
                <span className="badge-danger flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  Racha {alerta.racha}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
