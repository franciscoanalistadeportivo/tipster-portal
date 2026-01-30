'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Target, Trophy, Zap, 
  Brain, Calendar, Filter, ChevronLeft, ChevronRight,
  DollarSign, Percent, Activity, Shield, AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Area, AreaChart, CartesianGrid 
} from 'recharts';
import { tipstersAPI } from '@/lib/api';

// ==============================================================================
// TIPOS E INTERFACES
// ==============================================================================

interface TipsterDetail {
  tipster: {
    id: number;
    alias: string;
    deporte: string;
  };
  estadisticas: {
    total_apuestas: number;
    ganadas: number;
    perdidas: number;
    porcentaje_acierto: number;
    ganancia_total: number;
    mejor_racha: number;
    racha_actual: number;
  };
  historial: Apuesta[];
}

interface Apuesta {
  fecha: string;
  apuesta: string;
  cuota: number;
  stake_tipster: number;
  stake_ia: number;
  resultado: string;
  ganancia_neta: number;
  filtro_claude: string;
  analisis: string;
  tipo_mercado?: string;
  racha_actual?: number;
}

interface ConsejoIA {
  mercadoMaestro: string;
  winRateMaestro: number;
  mercadoEvitar: string;
  winRateEvitar: number;
  consejo: string;
}

// ==============================================================================
// UTILIDADES DE SEGURIDAD
// ==============================================================================

const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .slice(0, 500);
};

const sanitizeNumber = (value: unknown): number => {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.max(-999999999, Math.min(999999999, num));
};

const formatCurrency = (value: number): string => {
  const safe = sanitizeNumber(value);
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(safe);
};

// ==============================================================================
// CONSTANTES KELLY + RACHA
// ==============================================================================

const STAKES_KELLY = {
  euforia: { minRacha: 2, stake: 20592, emoji: '🔥', nombre: 'Euforia', color: '#22C55E' },
  base: { minRacha: 0, stake: 15840, emoji: '⚖️', nombre: 'Base', color: '#3B82F6' },
  seguridad: { minRacha: -2, stake: 12672, emoji: '⚠️', nombre: 'Seguridad', color: '#FFDD57' },
  proteccion: { minRacha: -999, stake: 5000, emoji: '🛡️', nombre: 'Protección', color: '#EF4444' },
};

const BANCA_BASE = 500000;

const calcularStakeKelly = (racha: number, banca: number = BANCA_BASE) => {
  const factor = banca / BANCA_BASE;
  if (racha >= 2) return { ...STAKES_KELLY.euforia, stake: Math.round(STAKES_KELLY.euforia.stake * factor) };
  if (racha >= 0) return { ...STAKES_KELLY.base, stake: Math.round(STAKES_KELLY.base.stake * factor) };
  if (racha >= -2) return { ...STAKES_KELLY.seguridad, stake: Math.round(STAKES_KELLY.seguridad.stake * factor) };
  return { ...STAKES_KELLY.proteccion, stake: Math.round(STAKES_KELLY.proteccion.stake * factor) };
};

// ==============================================================================
// COMPONENTE: WIN RATE CIRCLE
// ==============================================================================

const WinRateCircle = ({ percentage }: { percentage: number }) => {
  const safePercentage = Math.max(0, Math.min(100, sanitizeNumber(percentage)));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;
  
  const getColor = () => {
    if (safePercentage >= 65) return '#00D1B2';
    if (safePercentage >= 50) return '#FFDD57';
    return '#EF4444';
  };
  
  return (
    <div className="relative w-24 h-24">
      <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke="#334155"
          strokeWidth="6"
        />
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white font-mono">{safePercentage}%</span>
      </div>
    </div>
  );
};

// ==============================================================================
// COMPONENTE: CARD MÉTRICA
// ==============================================================================

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  subValue?: string;
  className?: string;
}

const MetricCard = ({ icon, label, value, color = '#FFFFFF', subValue, className = '' }: MetricCardProps) => (
  <div className={`bg-[#1E293B] rounded-2xl p-5 border border-[#334155] hover:border-[#00D1B2]/50 
                   transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#00D1B2]/10 ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      <div className="p-2 rounded-lg bg-[#0F172A]" style={{ color }}>
        {icon}
      </div>
      <span className="text-xs text-[#94A3B8] uppercase tracking-wide">{sanitizeInput(String(label))}</span>
    </div>
    <p className="text-3xl font-bold font-mono" style={{ color }}>
      {typeof value === 'number' ? value.toLocaleString() : sanitizeInput(String(value))}
    </p>
    {subValue && (
      <p className="text-xs text-[#94A3B8] mt-1">{sanitizeInput(subValue)}</p>
    )}
  </div>
);

// ==============================================================================
// COMPONENTE: CONSEJO IA
// ==============================================================================

const ConsejoIACard = ({ historial }: { historial: Apuesta[] }) => {
  const consejo = useMemo((): ConsejoIA => {
    if (!historial || historial.length < 5) {
      return {
        mercadoMaestro: 'Datos insuficientes',
        winRateMaestro: 0,
        mercadoEvitar: '-',
        winRateEvitar: 0,
        consejo: 'Necesitas más apuestas para análisis'
      };
    }

    // Agrupar por tipo de mercado
    const porMercado: Record<string, { ganadas: number; total: number }> = {};
    
    historial.forEach(ap => {
      const tipo = ap.tipo_mercado || 'OTRO';
      if (!porMercado[tipo]) {
        porMercado[tipo] = { ganadas: 0, total: 0 };
      }
      porMercado[tipo].total++;
      if (ap.resultado === 'GANADA') {
        porMercado[tipo].ganadas++;
      }
    });

    // Calcular win rates
    const mercados = Object.entries(porMercado)
      .filter(([_, stats]) => stats.total >= 3)
      .map(([mercado, stats]) => ({
        mercado,
        winRate: Math.round((stats.ganadas / stats.total) * 100),
        total: stats.total
      }))
      .sort((a, b) => b.winRate - a.winRate);

    if (mercados.length === 0) {
      return {
        mercadoMaestro: 'Datos insuficientes',
        winRateMaestro: 0,
        mercadoEvitar: '-',
        winRateEvitar: 0,
        consejo: 'Necesitas más variedad de mercados'
      };
    }

    const mejor = mercados[0];
    const peor = mercados[mercados.length - 1];

    return {
      mercadoMaestro: mejor.mercado,
      winRateMaestro: mejor.winRate,
      mercadoEvitar: peor.mercado !== mejor.mercado ? peor.mercado : '-',
      winRateEvitar: peor.mercado !== mejor.mercado ? peor.winRate : 0,
      consejo: `Especialista en ${mejor.mercado} (${mejor.winRate}%)${peor.mercado !== mejor.mercado ? `. Evitar: ${peor.mercado}` : ''}`
    };
  }, [historial]);

  return (
    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-5 border border-[#00D1B2]/30 
                    hover:border-[#00D1B2] transition-all duration-300 col-span-2 md:col-span-1">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-[#00D1B2]/20">
          <Brain className="h-5 w-5 text-[#00D1B2]" />
        </div>
        <span className="text-xs text-[#00D1B2] uppercase tracking-wide font-bold">Consejo IA</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#94A3B8]">Mercado Maestro</span>
          <span className="text-sm font-bold text-[#00D1B2]">
            {sanitizeInput(consejo.mercadoMaestro)} ({consejo.winRateMaestro}%)
          </span>
        </div>
        
        {consejo.mercadoEvitar !== '-' && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Evitar</span>
            <span className="text-sm font-bold text-[#EF4444]">
              {sanitizeInput(consejo.mercadoEvitar)} ({consejo.winRateEvitar}%)
            </span>
          </div>
        )}
        
        <div className="pt-2 border-t border-[#334155]">
          <p className="text-xs text-[#94A3B8] italic">
            💡 {sanitizeInput(consejo.consejo)}
          </p>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// COMPONENTE: GRÁFICO DE RENDIMIENTO
// ==============================================================================

const GraficoRendimiento = ({ historial }: { historial: Apuesta[] }) => {
  const datos = useMemo(() => {
    if (!historial || historial.length === 0) return [];
    
    let acumulado = 0;
    return historial
      .slice()
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .map((ap, index) => {
        acumulado += sanitizeNumber(ap.ganancia_neta);
        return {
          fecha: ap.fecha,
          ganancia: acumulado,
          index: index + 1
        };
      });
  }, [historial]);

  if (datos.length < 2) {
    return (
      <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155]">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#00D1B2]" />
          Rendimiento
        </h3>
        <p className="text-[#94A3B8] text-center py-8">Necesitas más apuestas para ver el gráfico</p>
      </div>
    );
  }

  const isPositive = datos[datos.length - 1]?.ganancia >= 0;

  return (
    <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155]">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-[#00D1B2]" />
        Rendimiento Acumulado
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datos}>
            <defs>
              <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#00D1B2' : '#EF4444'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isPositive ? '#00D1B2' : '#EF4444'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="fecha" 
              stroke="#64748B"
              tick={{ fill: '#64748B', fontSize: 10 }}
              tickFormatter={(value) => {
                const parts = value.split('/');
                return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : value;
              }}
            />
            <YAxis 
              stroke="#64748B"
              tick={{ fill: '#64748B', fontSize: 10 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1E293B', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}
              formatter={(value: number) => [formatCurrency(value), 'Ganancia']}
            />
            <Area 
              type="monotone" 
              dataKey="ganancia" 
              stroke={isPositive ? '#00D1B2' : '#EF4444'}
              strokeWidth={2}
              fill="url(#colorGanancia)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ==============================================================================
// COMPONENTE: SIMULADOR DE BANCA
// ==============================================================================

const SimuladorBanca = ({ historial, tipsterNombre }: { historial: Apuesta[], tipsterNombre: string }) => {
  const [banca, setBanca] = useState(500000);
  
  const simulacion = useMemo(() => {
    if (!historial || historial.length === 0) {
      return { ganancia: 0, balance: banca, rendimiento: 0, apuestas: 0 };
    }

    const factor = banca / BANCA_BASE;
    let balance = banca;
    let racha = 0;

    historial.forEach(ap => {
      if (ap.resultado === 'PENDIENTE') return;
      
      const stakeInfo = calcularStakeKelly(racha, banca);
      const stake = stakeInfo.stake;
      
      if (ap.resultado === 'GANADA') {
        balance += stake * (sanitizeNumber(ap.cuota) - 1);
        racha = racha >= 0 ? racha + 1 : 1;
      } else if (ap.resultado === 'PERDIDA') {
        balance -= stake;
        racha = racha <= 0 ? racha - 1 : -1;
      }
    });

    const ganancia = balance - banca;
    const rendimiento = (ganancia / banca) * 100;

    return {
      ganancia,
      balance,
      rendimiento,
      apuestas: historial.filter(a => a.resultado !== 'PENDIENTE').length
    };
  }, [historial, banca]);

  const handleBancaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const num = parseInt(value) || 0;
    setBanca(Math.min(Math.max(num, 10000), 100000000));
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-6 border border-[#FFDD57]/30">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-[#FFDD57]" />
        Simulador de Banca - {sanitizeInput(tipsterNombre)}
      </h3>
      
      {/* Input Banca */}
      <div className="mb-6">
        <label className="text-xs text-[#94A3B8] block mb-2">Tu Banca Inicial</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">$</span>
          <input
            type="text"
            value={banca.toLocaleString()}
            onChange={handleBancaChange}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl py-3 pl-8 pr-4 text-white font-mono
                       focus:border-[#FFDD57] focus:outline-none transition-colors"
            maxLength={15}
          />
        </div>
      </div>

      {/* Stakes Kelly */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {Object.entries(STAKES_KELLY).map(([key, info]) => {
          const factor = banca / BANCA_BASE;
          const stake = Math.round(info.stake * factor);
          return (
            <div key={key} className="bg-[#0F172A] rounded-lg p-3 border border-[#334155]">
              <div className="flex items-center gap-2 mb-1">
                <span>{info.emoji}</span>
                <span className="text-xs text-[#94A3B8]">{info.nombre}</span>
              </div>
              <p className="text-sm font-bold font-mono" style={{ color: info.color }}>
                {formatCurrency(stake)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Resultado Simulación */}
      <div className="bg-[#0F172A] rounded-xl p-4 border border-[#334155]">
        <p className="text-xs text-[#94A3B8] mb-3">Resultado Simulado ({simulacion.apuestas} apuestas)</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#94A3B8]">Balance Final</p>
            <p className={`text-xl font-bold font-mono ${simulacion.balance >= banca ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
              {formatCurrency(simulacion.balance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#94A3B8]">Ganancia</p>
            <p className={`text-xl font-bold font-mono ${simulacion.ganancia >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
              {simulacion.ganancia >= 0 ? '+' : ''}{formatCurrency(simulacion.ganancia)}
            </p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-[#334155]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Rendimiento</span>
            <span className={`text-lg font-bold font-mono ${simulacion.rendimiento >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
              {simulacion.rendimiento >= 0 ? '+' : ''}{simulacion.rendimiento.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// COMPONENTE: TABLA DE HISTORIAL
// ==============================================================================

const TablaHistorial = ({ historial, banca }: { historial: Apuesta[], banca: number }) => {
  const [filtro, setFiltro] = useState<'todos' | 'ganadas' | 'perdidas' | 'pendientes'>('todos');
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;

  const historialFiltrado = useMemo(() => {
    if (filtro === 'todos') return historial;
    if (filtro === 'ganadas') return historial.filter(a => a.resultado === 'GANADA');
    if (filtro === 'perdidas') return historial.filter(a => a.resultado === 'PERDIDA');
    return historial.filter(a => a.resultado === 'PENDIENTE');
  }, [historial, filtro]);

  const totalPaginas = Math.ceil(historialFiltrado.length / porPagina);
  const historialPaginado = historialFiltrado.slice((pagina - 1) * porPagina, pagina * porPagina);

  const getResultadoBadge = (resultado: string) => {
    switch (resultado) {
      case 'GANADA':
        return 'px-3 py-1 rounded-full text-xs font-bold bg-[#00D1B2]/20 text-[#00D1B2] border border-[#00D1B2]/30';
      case 'PERDIDA':
        return 'px-3 py-1 rounded-full text-xs font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30';
      default:
        return 'px-3 py-1 rounded-full text-xs font-bold bg-[#FFDD57]/20 text-[#FFDD57] border border-[#FFDD57]/30';
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#00D1B2]" />
          Historial de Apuestas
          <span className="text-sm text-[#94A3B8] font-normal">({historialFiltrado.length})</span>
        </h3>
        
        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'todos', label: 'Todas' },
            { key: 'ganadas', label: 'Ganadas' },
            { key: 'perdidas', label: 'Perdidas' },
            { key: 'pendientes', label: 'Pendientes' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => { setFiltro(f.key as typeof filtro); setPagina(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtro === f.key
                  ? 'bg-[#00D1B2] text-white'
                  : 'bg-[#0F172A] text-[#94A3B8] hover:bg-[#334155]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="pb-4 text-left text-xs font-semibold text-[#94A3B8]">Fecha</th>
              <th className="pb-4 text-left text-xs font-semibold text-[#94A3B8]">Apuesta</th>
              <th className="pb-4 text-left text-xs font-semibold text-[#94A3B8]">Cuota</th>
              <th className="pb-4 text-left text-xs font-semibold text-[#94A3B8]">Tipo</th>
              <th className="pb-4 text-left text-xs font-semibold text-[#94A3B8]">Tu Stake</th>
              <th className="pb-4 text-left text-xs font-semibold text-[#94A3B8]">Resultado</th>
              <th className="pb-4 text-left text-xs font-semibold text-[#94A3B8]">Tu Ganancia</th>
              <th className="pb-4 text-left text-xs font-semibold text-[#94A3B8]">IA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {historialPaginado.map((apuesta, index) => {
              const racha = apuesta.racha_actual || 0;
              const stakeInfo = calcularStakeKelly(racha, banca);
              const gananciaSimulada = apuesta.resultado === 'GANADA' 
                ? stakeInfo.stake * (sanitizeNumber(apuesta.cuota) - 1)
                : apuesta.resultado === 'PERDIDA' 
                  ? -stakeInfo.stake 
                  : 0;

              return (
                <tr key={index} className="hover:bg-[#0F172A]/50 transition-colors">
                  <td className="py-4 text-sm text-white font-mono">
                    {sanitizeInput(apuesta.fecha)}
                  </td>
                  <td className="py-4 text-sm text-white max-w-xs">
                    <span className="block truncate" title={apuesta.apuesta}>
                      {sanitizeInput(apuesta.apuesta)}
                    </span>
                  </td>
                  <td className="py-4 text-sm font-bold text-[#FFDD57] font-mono">
                    {sanitizeNumber(apuesta.cuota).toFixed(2)}
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-1 rounded text-xs bg-[#0F172A] text-[#94A3B8]">
                      {sanitizeInput(apuesta.tipo_mercado || 'N/A')}
                    </span>
                  </td>
                  <td className="py-4 text-sm font-mono" style={{ color: stakeInfo.color }}>
                    {stakeInfo.emoji} {formatCurrency(stakeInfo.stake)}
                  </td>
                  <td className="py-4">
                    <span className={getResultadoBadge(apuesta.resultado)}>
                      {sanitizeInput(apuesta.resultado)}
                    </span>
                  </td>
                  <td className={`py-4 text-sm font-bold font-mono ${
                    gananciaSimulada >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'
                  }`}>
                    {apuesta.resultado !== 'PENDIENTE' && (
                      <>{gananciaSimulada >= 0 ? '+' : ''}{formatCurrency(gananciaSimulada)}</>
                    )}
                  </td>
                  <td className="py-4">
                    {apuesta.filtro_claude === 'APROBADA' ? (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#00D1B2]/20 text-[#00D1B2]">
                        ✓ IA
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#EF4444]/20 text-[#EF4444]">
                        ✗ IA
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#334155]">
          <button
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#0F172A] text-[#94A3B8] 
                       hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          <span className="text-sm text-[#94A3B8]">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#0F172A] text-[#94A3B8] 
                       hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ==============================================================================
// COMPONENTE PRINCIPAL
// ==============================================================================

export default function TipsterDetailPage() {
  const params = useParams();
  const tipsterId = params.id as string;
  
  const [data, setData] = useState<TipsterDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bancaSimulador, setBancaSimulador] = useState(500000);

  useEffect(() => {
    const fetchTipster = async () => {
      try {
        // Validar ID
        const id = parseInt(tipsterId);
        if (isNaN(id) || id < 1 || id > 999999) {
          setError('ID de tipster inválido');
          setIsLoading(false);
          return;
        }

        const response = await tipstersAPI.getById(id);
        setData(response);
      } catch (err) {
        console.error('Error fetching tipster:', err);
        setError('Error al cargar datos del tipster');
      } finally {
        setIsLoading(false);
      }
    };

    if (tipsterId) {
      fetchTipster();
    }
  }, [tipsterId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-[#EF4444] mx-auto mb-4" />
        <p className="text-[#94A3B8]">{error || 'Tipster no encontrado'}</p>
        <Link href="/dashboard/tipsters" className="text-[#00D1B2] hover:underline mt-4 inline-block">
          Volver a tipsters
        </Link>
      </div>
    );
  }

  const { tipster, estadisticas, historial } = data;

  const getRachaColor = (racha: number) => {
    if (racha >= 3) return 'text-[#00D1B2] bg-[#00D1B2]/20 border-[#00D1B2]/30';
    if (racha >= 0) return 'text-[#3B82F6] bg-[#3B82F6]/20 border-[#3B82F6]/30';
    if (racha >= -2) return 'text-[#FFDD57] bg-[#FFDD57]/20 border-[#FFDD57]/30';
    return 'text-[#EF4444] bg-[#EF4444]/20 border-[#EF4444]/30';
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Back Button */}
      <Link 
        href="/dashboard/tipsters" 
        className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Volver a Tipsters</span>
      </Link>

      {/* Header Impactante */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-2xl p-6 border border-[#334155]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar Grande */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00D1B2] to-[#0891B2] 
                            flex items-center justify-center shadow-lg shadow-[#00D1B2]/20">
              <span className="text-3xl font-bold text-white">
                {tipster.alias.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white">{sanitizeInput(tipster.alias)}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-[#0F172A] text-[#94A3B8] rounded-full text-sm border border-[#334155]">
                  {sanitizeInput(tipster.deporte)}
                </span>
                <WinRateCircle percentage={estadisticas.porcentaje_acierto} />
              </div>
            </div>
          </div>

          {/* Racha Badge Grande */}
          <div className={`px-6 py-4 rounded-2xl border ${getRachaColor(estadisticas.racha_actual)}`}>
            <p className="text-xs font-medium opacity-80 text-center">Racha Actual</p>
            <p className="text-4xl font-bold font-mono text-center">
              {estadisticas.racha_actual >= 0 ? '+' : ''}{estadisticas.racha_actual}
            </p>
          </div>
        </div>
      </div>

      {/* 7 Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <MetricCard 
          icon={<Target className="h-5 w-5" />}
          label="Total"
          value={estadisticas.total_apuestas}
          color="#FFFFFF"
        />
        <MetricCard 
          icon={<TrendingUp className="h-5 w-5" />}
          label="Ganadas"
          value={estadisticas.ganadas}
          color="#00D1B2"
        />
        <MetricCard 
          icon={<TrendingDown className="h-5 w-5" />}
          label="Perdidas"
          value={estadisticas.perdidas}
          color="#EF4444"
        />
        <MetricCard 
          icon={<Percent className="h-5 w-5" />}
          label="Acierto"
          value={`${estadisticas.porcentaje_acierto}%`}
          color="#3B82F6"
        />
        <MetricCard 
          icon={<Trophy className="h-5 w-5" />}
          label="Mejor Racha"
          value={`+${estadisticas.mejor_racha}`}
          color="#FFDD57"
        />
        <MetricCard 
          icon={<Zap className="h-5 w-5" />}
          label="Ganancia"
          value={formatCurrency(estadisticas.ganancia_total)}
          color={estadisticas.ganancia_total >= 0 ? '#00D1B2' : '#EF4444'}
          className="col-span-2 md:col-span-1"
        />
        <ConsejoIACard historial={historial} />
      </div>

      {/* Gráfico de Rendimiento */}
      <GraficoRendimiento historial={historial} />

      {/* Simulador de Banca */}
      <SimuladorBanca historial={historial} tipsterNombre={tipster.alias} />

      {/* Tabla de Historial */}
      <TablaHistorial historial={historial} banca={bancaSimulador} />
    </div>
  );
}
