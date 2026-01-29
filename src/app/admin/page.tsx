'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Trophy, FileText, Shield, TrendingUp, 
  AlertTriangle, Clock, Activity, DollarSign,
  UserCheck, UserX, Eye
} from 'lucide-react';
import { useAuth, adminFetch } from './layout';

interface DashboardStats {
  usuarios: {
    total: number;
    premium: number;
    trial: number;
  };
  tipsters: number;
  apuestas: number;
  actividad: {
    logins_24h: number;
    ataques_24h: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken, csrfToken } = useAuth();

  useEffect(() => {
    loadStats();
  }, [accessToken]);

  const loadStats = async () => {
    if (!accessToken) return;
    
    try {
      const response = await adminFetch('/api/admin/dashboard/stats', {}, accessToken, csrfToken);
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
    {
      title: 'Usuarios Totales',
      value: stats?.usuarios.total || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12% este mes'
    },
    {
      title: 'Usuarios Premium',
      value: stats?.usuarios.premium || 0,
      icon: UserCheck,
      color: 'from-emerald-500 to-emerald-600',
      change: `${stats?.usuarios.trial || 0} en trial`
    },
    {
      title: 'Tipsters Activos',
      value: stats?.tipsters || 0,
      icon: Trophy,
      color: 'from-amber-500 to-amber-600',
      change: 'Verificados por IA'
    },
    {
      title: 'Total Apuestas',
      value: stats?.apuestas || 0,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      change: 'Registradas'
    },
  ];

  const activityCards = [
    {
      title: 'Logins (24h)',
      value: stats?.actividad.logins_24h || 0,
      icon: Activity,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10'
    },
    {
      title: 'Intentos de Ataque',
      value: stats?.actividad.ataques_24h || 0,
      icon: AlertTriangle,
      color: stats?.actividad.ataques_24h ? 'text-red-400' : 'text-emerald-400',
      bgColor: stats?.actividad.ataques_24h ? 'bg-red-500/10' : 'bg-emerald-500/10'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Resumen general del sistema</p>
        </div>
        <button 
          onClick={loadStats}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div 
            key={card.title}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{card.value.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">{card.title}</div>
            <div className="text-xs text-gray-500 mt-2">{card.change}</div>
          </div>
        ))}
      </div>

      {/* Activity & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            Actividad Reciente (24h)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {activityCards.map((card) => (
              <div key={card.title} className={`${card.bgColor} rounded-xl p-4`}>
                <div className="flex items-center gap-3">
                  <card.icon className={`w-8 h-8 ${card.color}`} />
                  <div>
                    <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                    <div className="text-gray-400 text-sm">{card.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Acciones Rápidas
          </h2>
          <div className="space-y-3">
            <a 
              href="/admin/landing" 
              className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-teal-400" />
                <span className="text-white">Editar Landing Page</span>
              </div>
              <span className="text-gray-400 group-hover:text-white">→</span>
            </a>
            <a 
              href="/admin/usuarios" 
              className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-white">Gestionar Usuarios</span>
              </div>
              <span className="text-gray-400 group-hover:text-white">→</span>
            </a>
            <a 
              href="/admin/tipsters" 
              className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-white">Administrar Tipsters</span>
              </div>
              <span className="text-gray-400 group-hover:text-white">→</span>
            </a>
            <a 
              href="/admin/seguridad" 
              className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-red-400" />
                <span className="text-white">Logs de Seguridad</span>
              </div>
              <span className="text-gray-400 group-hover:text-white">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Estado del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: 'API Backend', status: 'online', color: 'emerald' },
            { name: 'Base de Datos', status: 'online', color: 'emerald' },
            { name: 'Bot Telegram', status: 'online', color: 'emerald' },
            { name: 'Rate Limiting', status: 'activo', color: 'amber' },
          ].map((service) => (
            <div key={service.name} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className={`w-3 h-3 rounded-full bg-${service.color}-500 animate-pulse`}></div>
              <div>
                <div className="text-white text-sm font-medium">{service.name}</div>
                <div className={`text-${service.color}-400 text-xs capitalize`}>{service.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
