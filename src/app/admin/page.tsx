'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth, adminFetch } from './layout';
import { 
  AlertTriangle, TrendingUp, TrendingDown, Users, Calendar,
  CheckCircle, XCircle, RefreshCw, Trophy, Target,
  DollarSign, Activity, Clock
} from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================

interface DashboardStats {
  total_usuarios?: number;
  usuarios_activos?: number;
  total_tipsters?: number;
  tipsters_activos?: number;
  total_apuestas?: number;
  apuestas_pendientes?: number;
  profit_total?: number;
  win_rate?: number;
}

interface TipsterStat {
  id: number;
  nombre_real: string;
  alias: string;
  deporte: string;
  total_apuestas: number;
  ganadas: number;
  perdidas: number;
  pendientes: number;
  win_rate: number;
  profit: number;
  roi: number;
  racha_actual: number;
}

interface ApuestaReciente {
  id: number;
  fecha: string;
  tipster_id: number;
  tipster_nombre?: string;
  apuesta: string;
  cuota: number;
  stake_ia: number;
  resultado: string;
  ganancia_neta: number;
  tipo_mercado?: string;
  racha_actual?: number;
}

// ============================================================
// COMPONENTES
// ============================================================

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CL', { 
    style: 'currency', 
    currency: 'CLP', 
    maximumFractionDigits: 0 
  }).format(value);
};

// Tarjeta de estadística
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color = 'teal',
  trend
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number; 
  color?: 'teal' | 'emerald' | 'amber' | 'red' | 'blue' | 'purple';
  trend?: 'up' | 'down' | null;
}) => {
  const colorClasses = {
    teal: 'from-teal-500 to-teal-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={trend === 'up' ? 'text-emerald-400' : 'text-red-400'}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
};

// Badge de resultado
const ResultBadge = ({ resultado }: { resultado: string }) => {
  if (resultado === 'GANADA') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium">
        <CheckCircle className="w-3 h-3" /> GANADA
      </span>
    );
  }
  if (resultado === 'PERDIDA') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium">
        <XCircle className="w-3 h-3" /> PERDIDA
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium">
      <Clock className="w-3 h-3" /> PENDIENTE
    </span>
  );
};

// Badge de racha
const RachaBadge = ({ racha }: { racha: number }) => {
  const color = racha >= 3 ? 'text-amber-400' : racha > 0 ? 'text-emerald-400' : racha === 0 ? 'text-gray-400' : 'text-red-400';
  const emoji = racha >= 3 ? '🔥' : racha > 0 ? '📈' : racha === 0 ? '➡️' : '📉';
  
  return (
    <span className={`font-mono font-bold ${color}`}>
      {emoji} {racha > 0 ? `+${racha}` : racha}
    </span>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function AdminDashboard() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tipsters, setTipsters] = useState<TipsterStat[]>([]);
  const [apuestas, setApuestas] = useState<ApuestaReciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Fetch dashboard stats
      const statsRes = await adminFetch('/api/admin/dashboard/stats', {}, accessToken);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || statsData);
      }

      // Fetch tipsters stats
      const tipstersRes = await adminFetch('/api/admin/tipsters/stats', {}, accessToken);
      if (tipstersRes.ok) {
        const tipstersData = await tipstersRes.json();
        // Ordenar por profit descendente
        const sorted = (tipstersData.data || tipstersData || [])
          .sort((a: TipsterStat, b: TipsterStat) => (b.profit || 0) - (a.profit || 0))
          .slice(0, 10);
        setTipsters(sorted);
      }

      // Fetch apuestas recientes
      const apuestasRes = await adminFetch('/api/admin/apuestas?limit=15', {}, accessToken);
      if (apuestasRes.ok) {
        const apuestasData = await apuestasRes.json();
        setApuestas((apuestasData.data || apuestasData.apuestas || []).slice(0, 10));
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar datos. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh cada 2 minutos
    const interval = setInterval(fetchData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Resumen general del sistema</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Actualizado: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={fetchData}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Users}
          label="Usuarios Registrados" 
          value={stats?.total_usuarios || 0}
          color="blue"
        />
        <StatCard 
          icon={Trophy}
          label="Tipsters Activos" 
          value={stats?.tipsters_activos || stats?.total_tipsters || 0}
          color="purple"
        />
        <StatCard 
          icon={Target}
          label="Total Apuestas" 
          value={stats?.total_apuestas || 0}
          color="teal"
        />
        <StatCard 
          icon={Activity}
          label="Win Rate Global" 
          value={`${(stats?.win_rate || 0).toFixed(1)}%`}
          color="amber"
          trend={(stats?.win_rate || 0) >= 55 ? 'up' : (stats?.win_rate || 0) < 50 ? 'down' : null}
        />
      </div>

      {/* Profit Card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Profit Total Acumulado</p>
            <p className={`text-4xl font-bold ${(stats?.profit_total || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(stats?.profit_total || 0)}
            </p>
          </div>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${(stats?.profit_total || 0) >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            <DollarSign className={`w-8 h-8 ${(stats?.profit_total || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>
        </div>
        {stats?.apuestas_pendientes && stats.apuestas_pendientes > 0 && (
          <p className="text-amber-400 text-sm mt-3 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {stats.apuestas_pendientes} apuestas pendientes
          </p>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Apuestas Recientes */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-400" />
              Apuestas Recientes
            </h2>
            <a href="/admin/apuestas" className="text-teal-400 hover:text-teal-300 text-sm">
              Ver todas →
            </a>
          </div>
          
          <div className="divide-y divide-slate-700">
            {apuestas.length > 0 ? (
              apuestas.map((apuesta) => (
                <div key={apuesta.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-teal-400 font-mono text-sm">#{apuesta.id}</span>
                      {apuesta.racha_actual !== undefined && (
                        <RachaBadge racha={apuesta.racha_actual} />
                      )}
                    </div>
                    <ResultBadge resultado={apuesta.resultado} />
                  </div>
                  <p className="text-white text-sm mb-2 line-clamp-1">{apuesta.apuesta}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      @{apuesta.cuota} • {formatCurrency(apuesta.stake_ia)}
                      {apuesta.tipo_mercado && ` • ${apuesta.tipo_mercado}`}
                    </span>
                    <span className={apuesta.ganancia_neta >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                      {apuesta.ganancia_neta >= 0 ? '+' : ''}{formatCurrency(apuesta.ganancia_neta)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No hay apuestas recientes
              </div>
            )}
          </div>
        </div>

        {/* Top Tipsters */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Top Tipsters por Profit
            </h2>
            <a href="/admin/tipsters" className="text-teal-400 hover:text-teal-300 text-sm">
              Ver todos →
            </a>
          </div>
          
          <div className="divide-y divide-slate-700">
            {tipsters.length > 0 ? (
              tipsters.map((tipster, index) => (
                <div key={tipster.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-amber-500/20 text-amber-400' :
                      index === 1 ? 'bg-gray-400/20 text-gray-300' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-slate-600 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium truncate">{tipster.alias}</span>
                        <span className="text-xs text-gray-500">{tipster.deporte}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span>{tipster.total_apuestas} apuestas</span>
                        <span>WR: {(tipster.win_rate || 0).toFixed(1)}%</span>
                        {tipster.racha_actual !== undefined && (
                          <RachaBadge racha={tipster.racha_actual} />
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${(tipster.profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(tipster.profit || 0)}
                      </p>
                      <p className={`text-xs ${(tipster.roi || 0) >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                        ROI: {(tipster.roi || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No hay datos de tipsters
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
