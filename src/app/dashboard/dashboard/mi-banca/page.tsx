'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Wallet, TrendingUp, TrendingDown, Target, Trophy, Zap,
  ChevronRight, PieChart, Calendar, Award, ArrowUpRight, ArrowDownRight,
  Flame, BarChart3, Clock
} from 'lucide-react';
import { miBancaAPI } from '@/lib/api';

interface BancaEstado {
  onboarding_completo: boolean;
  banca_inicial: number;
  banca_actual: number;
  perfil_riesgo: string;
  meta_mensual: number;
  stats: {
    total_apuestas: number;
    ganadas: number;
    perdidas: number;
    pendientes: number;
    profit_total: number;
    profit_mes: number;
    roi: number;
    win_rate: number;
    racha: number;
    tipo_racha: string;
    progreso_meta: number;
    porcentaje_meta: number;
  };
}

interface HistorialItem {
  fecha: string;
  banca: number;
  profit: number;
  ganadas: number;
  perdidas: number;
}

// Mini gráfico de línea
const MiniChart = ({ data, positive }: { data: number[]; positive: boolean }) => {
  if (data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="120" height="40" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#00D1B2' : '#EF4444'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Barra de progreso circular
const CircularProgress = ({ percentage, size = 80 }: { percentage: number; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1E293B"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={percentage >= 100 ? '#00D1B2' : '#FFDD57'}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-lg font-bold font-mono ${percentage >= 100 ? 'text-[#00D1B2]' : 'text-white'}`}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

export default function MiBancaPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<BancaEstado | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const estadoData = await miBancaAPI.getEstado();
        
        // Si no ha completado onboarding, redirigir a setup
        if (!estadoData.onboarding_completo) {
          router.push('/dashboard/mi-banca/setup');
          return;
        }
        
        setEstado(estadoData);

        // Obtener historial para el gráfico
        const historialData = await miBancaAPI.getHistorial(30);
        setHistorial(historialData.historial || []);
      } catch (error) {
        console.error('Error:', error);
        // Si hay error, probablemente no tiene banca configurada
        router.push('/dashboard/mi-banca/setup');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!estado) return null;

  const { stats } = estado;
  const profitPositivo = stats.profit_total >= 0;
  const bancaData = historial.map(h => h.banca);

  return (
    <div className="space-y-6 animate-fadeIn pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-[#00D1B2]" />
            Mi Banca
          </h1>
          <p className="text-[#94A3B8] mt-1">
            Gestiona tu bankroll de forma inteligente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            estado.perfil_riesgo === 'conservador' ? 'bg-blue-500/10 text-blue-400' :
            estado.perfil_riesgo === 'moderado' ? 'bg-[#FFDD57]/10 text-[#FFDD57]' :
            'bg-[#EF4444]/10 text-[#EF4444]'
          }`}>
            {estado.perfil_riesgo.charAt(0).toUpperCase() + estado.perfil_riesgo.slice(1)}
          </span>
        </div>
      </div>

      {/* Banca Principal */}
      <div className="card-elite border-[#00D1B2]/20 animate-fadeInUp">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-[#94A3B8] text-sm mb-1">Banca Actual</p>
            <p className="text-4xl lg:text-5xl font-bold text-white font-mono">
              ${estado.banca_actual.toLocaleString()}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className={`flex items-center gap-1 ${profitPositivo ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
                {profitPositivo ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span className="font-mono font-bold">
                  {profitPositivo ? '+' : ''}{stats.profit_total.toLocaleString()}
                </span>
              </div>
              <span className="text-[#64748B]">|</span>
              <span className={`font-mono ${stats.roi >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
                {stats.roi >= 0 ? '+' : ''}{stats.roi}% ROI
              </span>
            </div>
          </div>
          
          {/* Mini Chart */}
          <div className="flex-shrink-0">
            {bancaData.length > 1 && (
              <MiniChart data={bancaData} positive={profitPositivo} />
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Win Rate */}
        <div className="stat-card animate-fadeInUp stagger-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-[#00D1B2]/10">
              <Target className="h-5 w-5 text-[#00D1B2]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-mono">{stats.win_rate}%</p>
          <p className="text-[#94A3B8] text-sm mt-1">Win Rate</p>
          <p className="text-xs text-[#64748B] mt-1">{stats.ganadas}/{stats.ganadas + stats.perdidas} ganadas</p>
        </div>

        {/* Racha */}
        <div className="stat-card animate-fadeInUp stagger-2">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${stats.tipo_racha === 'W' ? 'bg-[#00D1B2]/10' : 'bg-[#EF4444]/10'}`}>
              <Flame className={`h-5 w-5 ${stats.tipo_racha === 'W' ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`} />
            </div>
            {stats.racha >= 3 && stats.tipo_racha === 'W' && (
              <span className="text-xs px-2 py-0.5 rounded bg-[#00D1B2]/10 text-[#00D1B2]">🔥 Hot</span>
            )}
          </div>
          <p className={`text-3xl font-bold font-mono ${stats.tipo_racha === 'W' ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {stats.tipo_racha}{stats.racha}
          </p>
          <p className="text-[#94A3B8] text-sm mt-1">Racha Actual</p>
        </div>

        {/* Profit Mes */}
        <div className="stat-card animate-fadeInUp stagger-3">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${stats.profit_mes >= 0 ? 'bg-[#00D1B2]/10' : 'bg-[#EF4444]/10'}`}>
              <TrendingUp className={`h-5 w-5 ${stats.profit_mes >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold font-mono ${stats.profit_mes >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {stats.profit_mes >= 0 ? '+' : ''}${stats.profit_mes.toLocaleString()}
          </p>
          <p className="text-[#94A3B8] text-sm mt-1">Profit del Mes</p>
        </div>

        {/* Pendientes */}
        <div className="stat-card animate-fadeInUp stagger-4">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-[#FFDD57]/10">
              <Clock className="h-5 w-5 text-[#FFDD57]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#FFDD57] font-mono">{stats.pendientes}</p>
          <p className="text-[#94A3B8] text-sm mt-1">Apuestas Activas</p>
        </div>
      </div>

      {/* Meta Mensual + Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Meta Mensual */}
        <div className="card-elite animate-fadeInUp stagger-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FFDD57]/10">
                <Trophy className="h-5 w-5 text-[#FFDD57]" />
              </div>
              <div>
                <h3 className="font-bold text-white">Meta Mensual</h3>
                <p className="text-sm text-[#94A3B8]">+{estado.meta_mensual}% objetivo</p>
              </div>
            </div>
            <CircularProgress percentage={stats.porcentaje_meta} />
          </div>
          <div className="bg-[#1E293B] rounded-lg p-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#94A3B8]">Progreso</span>
              <span className={stats.progreso_meta >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}>
                {stats.progreso_meta >= 0 ? '+' : ''}{stats.progreso_meta}%
              </span>
            </div>
            <div className="h-2 bg-[#0F172A] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.porcentaje_meta >= 100 ? 'bg-[#00D1B2]' : 'bg-[#FFDD57]'
                }`}
                style={{ width: `${Math.min(stats.porcentaje_meta, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          {/* Picks Recomendados */}
          <Link href="/dashboard/mi-banca/picks" className="card-hero group block animate-fadeInUp stagger-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#00D1B2]/10">
                  <Zap className="h-5 w-5 text-[#00D1B2]" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Picks Recomendados</h3>
                  <p className="text-sm text-[#94A3B8]">Stakes calculados para tu banca</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-[#00D1B2] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Mis Apuestas */}
          <Link href="/dashboard/mi-banca/mis-apuestas" className="card-elite group block animate-fadeInUp stagger-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#3B82F6]/10">
                  <BarChart3 className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Mis Apuestas</h3>
                  <p className="text-sm text-[#94A3B8]">{stats.total_apuestas} registradas</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-[#3B82F6] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Estadísticas */}
          <Link href="/dashboard/mi-banca/estadisticas" className="card-elite group block animate-fadeInUp stagger-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10">
                  <PieChart className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Estadísticas</h3>
                  <p className="text-sm text-[#94A3B8]">Análisis detallado</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>
      </div>

      {/* Logros Preview */}
      <Link href="/dashboard/logros" className="card-premium group block animate-fadeInUp">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFDD57]/10">
              <Award className="h-6 w-6 text-[#FFDD57]" />
            </div>
            <div>
              <h3 className="font-bold text-white">Mis Logros</h3>
              <p className="text-sm text-[#94A3B8]">Desbloquea badges y gana puntos</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-[#FFDD57] group-hover:translate-x-1 transition-all" />
        </div>
      </Link>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-[#64748B] pt-4 border-t border-slate-800/50">
        <span>Banca inicial: ${estado.banca_inicial.toLocaleString()}</span>
        <Link href="/dashboard/configuracion" className="text-[#00D1B2] hover:underline">
          Configuración →
        </Link>
      </div>
    </div>
  );
}
