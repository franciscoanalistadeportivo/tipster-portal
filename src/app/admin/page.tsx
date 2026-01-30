'use client';

import { useState, useEffect } from 'react';
import { Users, Trophy, TrendingUp, Shield, Activity, DollarSign } from 'lucide-react';
import { useAuth, adminFetch } from './layout';

interface DashboardStats {
  usuarios: { total: number; premium: number; trial: number };
  tipsters: number;
  apuestas: number;
  actividad: { logins_24h: number; ataques_24h: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken } = useAuth();

  useEffect(() => {
    loadStats();
  }, [accessToken]);

  const loadStats = async () => {
    if (!accessToken) return;
    try {
      const response = await adminFetch('/api/admin/dashboard/stats', {}, accessToken);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Usuarios Totales', value: stats?.usuarios?.total || 0, icon: Users, color: 'teal' },
    { title: 'Premium Activos', value: stats?.usuarios?.premium || 0, icon: DollarSign, color: 'emerald' },
    { title: 'En Trial', value: stats?.usuarios?.trial || 0, icon: Activity, color: 'amber' },
    { title: 'Tipsters Activos', value: stats?.tipsters || 0, icon: Trophy, color: 'purple' },
    { title: 'Total Apuestas', value: stats?.apuestas || 0, icon: TrendingUp, color: 'blue' },
    { title: 'Logins 24h', value: stats?.actividad?.logins_24h || 0, icon: Shield, color: 'gray' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-1">{card.value.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
                <card.icon className="w-6 h-6 text-teal-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {(stats?.actividad?.ataques_24h ?? 0) > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-400" />
            <div>
              <p className="text-red-400 font-semibold">Alerta de Seguridad</p>
              <p className="text-gray-400 text-sm">{stats?.actividad?.ataques_24h} intentos de ataque detectados en las últimas 24 horas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
