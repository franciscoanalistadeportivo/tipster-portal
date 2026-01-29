'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Users, Calendar, Target, AlertTriangle } from 'lucide-react';
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

        // Encontrar el top tipster
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

  // Calcular días restantes de suscripción
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {user?.nombre || 'Usuario'} 👋
        </h1>
        <p className="text-gray-600">
          Bienvenido al Director de Riesgos
        </p>
      </div>

      {/* Alerta de suscripción */}
      {user?.plan === 'FREE_TRIAL' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Período de Prueba</p>
              <p className="text-sm text-blue-700">Te quedan {getDiasRestantes()} días de prueba gratis</p>
            </div>
          </div>
          <Link href="/dashboard/suscripcion" className="btn-primary text-sm">
            Suscribirse
          </Link>
        </div>
      )}

      {user?.plan === 'EXPIRED' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Suscripción Expirada</p>
              <p className="text-sm text-red-700">Renueva tu suscripción para continuar</p>
            </div>
          </div>
          <Link href="/dashboard/suscripcion" className="btn-primary text-sm bg-red-600 hover:bg-red-700">
            Renovar Ahora
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tipsters Activos</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalTipsters}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Apuestas Hoy</p>
              <p className="text-3xl font-bold text-gray-900">{data.apuestasHoy}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Tipster</p>
              <p className="text-lg font-bold text-gray-900">{data.topTipster?.alias || '-'}</p>
              {data.topTipster && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  ${data.topTipster.ganancia.toLocaleString()}
                </p>
              )}
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Alertas</p>
              <p className="text-3xl font-bold text-gray-900">{data.alertas.length}</p>
              {data.alertas.length > 0 && (
                <p className="text-sm text-red-600">Tipsters en mala racha</p>
              )}
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/dashboard/apuestas" className="card hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-lg group-hover:bg-green-200 transition-colors">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ver Apuestas de Hoy</h3>
              <p className="text-gray-600">Revisa todas las apuestas activas</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/recomendaciones" className="card hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-4 rounded-lg group-hover:bg-yellow-200 transition-colors">
              <Target className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recomendaciones IA</h3>
              <p className="text-gray-600">Top tipsters y apuestas seguras</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Alertas de mala racha */}
      {data.alertas.length > 0 && (
        <div className="card border-l-4 border-red-500">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Tipsters en Mala Racha (Evitar)
          </h3>
          <div className="space-y-2">
            {data.alertas.map((alerta, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="font-medium">{alerta.alias}</span>
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
