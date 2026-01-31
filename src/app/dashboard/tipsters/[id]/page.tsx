'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, Flame, Snowflake, AlertTriangle, AlertCircle, 
  Info, Search, Calendar, BarChart3, DollarSign, TrendingUp,
  CheckCircle, XCircle, Clock, Filter
} from 'lucide-react';
import { tipstersAPI } from '@/lib/api';

// ============================================================================
// TIPOS
// ============================================================================
interface Apuesta {
  id: number;
  fecha: string;
  apuesta: string;
  tipo_mercado: string;
  cuota: number;
  stake: number;
  stake_ia?: number;
  resultado: 'GANADA' | 'PERDIDA' | 'PENDIENTE' | 'NULA';
  ganancia_neta: number;
  racha_actual?: number;
}

interface Alerta {
  id: number;
  nivel: 'INFO' | 'PRECAUCION' | 'ALERTA' | 'CRITICO';
  mensaje: string;
  recomendacion: string;
}

interface Estrategia {
  estrategia_activa: string;
  estrategia_recomendada?: string;
  porcentaje_kelly: number;
  stake_minimo: number;
  stake_maximo: number;
  win_rate?: number;
  cuota_promedio?: number;
  yield_calculado?: number;
  notas?: string;
}

interface TipsterDetalle {
  tipster: { id: number; alias: string; deporte: string };
  estadisticas: {
    total_apuestas: number;
    ganadas: number;
    perdidas: number;
    porcentaje_acierto: number;
    ganancia_total: number;
    racha_actual: number;
    tipo_racha?: string;
    mejor_racha: number;
    cuota_promedio?: number;
    roi?: number;
    yield_total?: number;
  };
  estrategia: Estrategia;
  alertas?: Alerta[];
  historial: Apuesta[];
}

// ============================================================================
// HELPERS
// ============================================================================
const getDeporteIcon = (deporte: string) => {
  const icons: Record<string, string> = {
    'Futbol': '⚽', 'Tenis': '🎾', 'NBA': '🏀', 'Baloncesto': '🏀',
    'Voleibol': '🏐', 'Mixto': '🎯', 'eSports': '🎮'
  };
  return icons[deporte] || '🎯';
};

// Normalizar porcentaje Kelly (puede venir como 0.40 o como 40)
const normalizeKelly = (value: number): number => {
  if (value <= 1) return value * 100; // 0.40 → 40
  return value; // ya es 40
};

// Obtener el valor Kelly para cálculos (necesita ser decimal)
const getKellyDecimal = (value: number): number => {
  if (value > 1) return value / 100; // 40 → 0.40
  return value; // ya es 0.40
};

const getEstrategiaColor = (tipo: string): string => {
  const colors: Record<string, string> = {
    'KELLY': '#3B82F6',
    'RACHAS': '#F59E0B',
    'HIBRIDA': '#00D1B2',
    'FLAT': '#94A3B8',
    'CONSERVADOR': '#10B981',
    'PORCENTAJE_FIJO': '#8B5CF6'
  };
  return colors[tipo] || '#94A3B8';
};

const getEstrategiaDescription = (tipo: string): string => {
  const descriptions: Record<string, string> = {
    'KELLY': 'Criterion Kelly - Stakes óptimos matemáticos',
    'RACHAS': 'Ajusta stakes según rachas positivas/negativas',
    'HIBRIDA': 'Combina Kelly + Rachas + Análisis por mercado',
    'FLAT': 'Stakes fijos sin variación',
    'CONSERVADOR': 'Stakes reducidos para minimizar riesgo',
    'PORCENTAJE_FIJO': 'Porcentaje fijo de la banca'
  };
  return descriptions[tipo] || 'Estrategia personalizada';
};

// ============================================================================
// COMPONENTE: Barra de Racha
// ============================================================================
const RachaBar = ({ racha, tipo }: { racha: number; tipo: string }) => {
  const isPositive = tipo === 'W' && racha >= 3;
  const isNegative = tipo === 'L' && racha >= 3;
  if (!isPositive && !isNegative) return null;

  const percentage = Math.min((racha / 10) * 100, 100);

  return (
    <div className={`rounded-2xl p-4 border ${
      isPositive 
        ? 'bg-gradient-to-r from-[#00D1B2]/20 to-transparent border-[#00D1B2]/30' 
        : 'bg-gradient-to-r from-[#EF4444]/20 to-transparent border-[#EF4444]/30'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isPositive ? (
            <>
              {[...Array(Math.min(racha, 5))].map((_, i) => (
                <Flame key={i} className="h-5 w-5 text-[#FFDD57] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
              <span className="text-[#00D1B2] font-bold text-lg ml-2">🔥 RACHA W{racha} EN FUEGO</span>
            </>
          ) : (
            <>
              {[...Array(Math.min(racha, 5))].map((_, i) => (
                <Snowflake key={i} className="h-5 w-5 text-[#3B82F6]" />
              ))}
              <span className="text-[#EF4444] font-bold text-lg ml-2">❄️ RACHA FRÍA L{racha}</span>
            </>
          )}
        </div>
        <span className={`font-mono font-bold ${isPositive ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
          {isPositive ? '+' : '-'}{racha}
        </span>
      </div>
      <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${
            isPositive ? 'bg-gradient-to-r from-[#00D1B2] to-[#FFDD57]' : 'bg-gradient-to-r from-[#EF4444] to-[#3B82F6]'
          }`}
          style={{ width: `${percentage}%`, boxShadow: `0 0 12px ${isPositive ? 'rgba(0,209,178,0.5)' : 'rgba(239,68,68,0.5)'}` }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Alertas
// ============================================================================
const AlertasSection = ({ alertas }: { alertas: Alerta[] }) => {
  if (!alertas?.length) return null;

  const config: Record<string, { icon: typeof AlertCircle; color: string; bg: string; border: string }> = {
    CRITICO: { icon: AlertCircle, color: '#EF4444', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/30' },
    ALERTA: { icon: AlertTriangle, color: '#F59E0B', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30' },
    PRECAUCION: { icon: Info, color: '#FFDD57', bg: 'bg-[#FFDD57]/10', border: 'border-[#FFDD57]/30' },
    INFO: { icon: Info, color: '#3B82F6', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30' }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-white font-bold flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-[#FFDD57]" /> Alertas Activas
      </h3>
      {alertas.map((alerta) => {
        const c = config[alerta.nivel] || config.INFO;
        const Icon = c.icon;
        return (
          <div key={alerta.id} className={`rounded-xl p-4 ${c.bg} border ${c.border}`}>
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: c.color }} />
              <div>
                <p className="text-white font-medium">{alerta.mensaje}</p>
                <p className="text-sm text-[#94A3B8] mt-1">{alerta.recomendacion}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// COMPONENTE: Simulador de Ganancias MEJORADO
// ============================================================================
const SimuladorGanancias = ({ estrategia, historial }: { estrategia: Estrategia; historial: Apuesta[] }) => {
  const [banca, setBanca] = useState(500000);
  const [resultado, setResultado] = useState({ ganancia: 0, bancaFinal: 0, retorno: 0 });

  // Normalizar el porcentaje Kelly
  const kellyDisplay = normalizeKelly(estrategia.porcentaje_kelly);
  const kellyDecimal = getKellyDecimal(estrategia.porcentaje_kelly);

  useEffect(() => {
    let bancaSimulada = banca;
    const apuestasResueltas = historial.filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA');
    
    apuestasResueltas.forEach((apuesta) => {
      // Calcular stake usando la estrategia del tipster
      const stakeBase = bancaSimulada * kellyDecimal;
      const stake = Math.max(
        estrategia.stake_minimo, 
        Math.min(stakeBase, estrategia.stake_maximo)
      );
      
      if (apuesta.resultado === 'GANADA') {
        bancaSimulada += stake * (apuesta.cuota - 1);
      } else {
        bancaSimulada -= stake;
      }
    });
    
    setResultado({
      ganancia: bancaSimulada - banca,
      bancaFinal: bancaSimulada,
      retorno: banca > 0 ? ((bancaSimulada - banca) / banca) * 100 : 0
    });
  }, [banca, historial, estrategia, kellyDecimal]);

  const estrategiaColor = getEstrategiaColor(estrategia.estrategia_activa);

  return (
    <div className="rounded-2xl p-6 border border-white/10 h-full" style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)' }}>
      <h3 className="text-white font-bold flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-[#FFDD57]" /> Simulador de Ganancias
      </h3>
      
      {/* Info Estrategia */}
      <div className="mb-4 p-3 rounded-xl bg-[#0F172A]/50">
        <div className="flex items-center gap-2 mb-2">
          <span 
            className="px-2 py-1 rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: estrategiaColor }}
          >
            {estrategia.estrategia_activa}
          </span>
          <span className="text-[#00D1B2] font-medium">Kelly {kellyDisplay}%</span>
        </div>
        <p className="text-xs text-[#64748B]">{getEstrategiaDescription(estrategia.estrategia_activa)}</p>
        <div className="mt-2 flex gap-4 text-xs text-[#94A3B8]">
          <span>Min: ${estrategia.stake_minimo.toLocaleString()}</span>
          <span>Max: ${estrategia.stake_maximo.toLocaleString()}</span>
        </div>
      </div>

      {/* Input Banca */}
      <div className="mb-6">
        <label className="text-sm text-[#94A3B8] mb-2 block">Tu banca inicial</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">$</span>
          <input
            type="number"
            value={banca}
            onChange={(e) => setBanca(Number(e.target.value) || 0)}
            className="w-full pl-8 pr-4 py-3 rounded-xl bg-[#0F172A] border border-white/10 text-white font-mono focus:border-[#00D1B2]/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#94A3B8]" />
            <span className="text-[#94A3B8]">Ganancia</span>
          </div>
          <span className={`font-bold font-mono ${resultado.ganancia >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {resultado.ganancia >= 0 ? '+' : ''}${Math.round(resultado.ganancia).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]/50">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#94A3B8]" />
            <span className="text-[#94A3B8]">Banca final</span>
          </div>
          <span className="font-bold font-mono text-white">
            ${Math.round(resultado.bancaFinal).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]/50">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#94A3B8]" />
            <span className="text-[#94A3B8]">Retorno</span>
          </div>
          <span className={`font-bold font-mono ${resultado.retorno >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {resultado.retorno >= 0 ? '+' : ''}{resultado.retorno.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Gráfico de Rendimiento
// ============================================================================
const GraficoRendimiento = ({ historial, estadisticas }: { historial: Apuesta[]; estadisticas: any }) => {
  const apuestasResueltas = historial
    .filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA')
    .reverse();
  
  if (apuestasResueltas.length < 2) return null;

  // Calcular puntos del gráfico
  let acumulado = 0;
  const puntos = apuestasResueltas.map((a, i) => {
    acumulado += a.ganancia_neta || 0;
    return { x: i, y: acumulado };
  });

  const maxY = Math.max(...puntos.map(p => p.y), 0);
  const minY = Math.min(...puntos.map(p => p.y), 0);
  const rangeY = maxY - minY || 1;

  const width = 100;
  const height = 100;
  const padding = 10;

  const pathPoints = puntos.map((p, i) => {
    const x = padding + (i / (puntos.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((p.y - minY) / rangeY) * (height - 2 * padding);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaPath = pathPoints + ` L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
  const isPositive = acumulado >= 0;

  // Calcular ROI y Cuota Promedio
  const totalStakes = apuestasResueltas.reduce((acc, a) => acc + (a.stake_ia || a.stake || 0), 0);
  const roi = totalStakes > 0 ? (acumulado / totalStakes) * 100 : 0;
  const cuotaPromedio = apuestasResueltas.length > 0 
    ? apuestasResueltas.reduce((acc, a) => acc + a.cuota, 0) / apuestasResueltas.length 
    : 0;
  const yieldCalc = apuestasResueltas.length > 0 ? acumulado / apuestasResueltas.length : 0;

  return (
    <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#00D1B2]" /> Rendimiento
        </h3>
        <div className="flex gap-2">
          {['7D', '30D', 'TODO'].map((periodo) => (
            <button
              key={periodo}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                periodo === 'TODO' 
                  ? 'bg-[#00D1B2] text-white' 
                  : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569]'
              }`}
            >
              {periodo}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico SVG */}
      <div className="h-32 mb-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? '#00D1B2' : '#EF4444'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isPositive ? '#00D1B2' : '#EF4444'} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#areaGradient)" />
          <path 
            d={pathPoints} 
            fill="none" 
            stroke={isPositive ? '#00D1B2' : '#EF4444'} 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className={`text-lg font-bold font-mono ${roi >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
          </p>
          <p className="text-xs text-[#64748B]">ROI</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold font-mono text-white">@{cuotaPromedio.toFixed(2)}</p>
          <p className="text-xs text-[#64748B]">Cuota Prom</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold font-mono ${yieldCalc >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {yieldCalc >= 0 ? '+' : ''}${Math.round(yieldCalc).toLocaleString()}
          </p>
          <p className="text-xs text-[#64748B]">Yield/Apuesta</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold font-mono text-[#FFDD57]">{estadisticas.mejor_racha}</p>
          <p className="text-xs text-[#64748B]">Mejor Racha</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Historial de Apuestas
// ============================================================================
const HistorialApuestas = ({ historial }: { historial: Apuesta[] }) => {
  const [filtro, setFiltro] = useState<'TODAS' | 'GANADA' | 'PERDIDA' | 'PENDIENTE'>('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarTodas, setMostrarTodas] = useState(false);

  const filtradas = historial.filter(a => {
    const matchFiltro = filtro === 'TODAS' || a.resultado === filtro;
    const matchBusqueda = !busqueda || a.apuesta.toLowerCase().includes(busqueda.toLowerCase());
    return matchFiltro && matchBusqueda;
  });

  const mostradas = mostrarTodas ? filtradas : filtradas.slice(0, 10);

  const estilos: Record<string, { icon: string; bg: string }> = {
    'GANADA': { icon: '✓', bg: 'bg-[#00D1B2]/20 text-[#00D1B2]' },
    'PERDIDA': { icon: '✗', bg: 'bg-[#EF4444]/20 text-[#EF4444]' },
    'PENDIENTE': { icon: '○', bg: 'bg-[#F59E0B]/20 text-[#F59E0B]' },
    'NULA': { icon: '—', bg: 'bg-[#64748B]/20 text-[#64748B]' }
  };

  return (
    <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#00D1B2]" /> Historial de Apuestas
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {(['TODAS', 'GANADA', 'PERDIDA', 'PENDIENTE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtro === f 
                  ? f === 'GANADA' ? 'bg-[#00D1B2] text-white' 
                  : f === 'PERDIDA' ? 'bg-[#EF4444] text-white'
                  : f === 'PENDIENTE' ? 'bg-[#F59E0B] text-white'
                  : 'bg-[#00D1B2] text-white'
                  : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569]'
              }`}
            >
              {f === 'TODAS' ? 'Todas' : f === 'GANADA' ? '✓' : f === 'PERDIDA' ? '✗' : '○'}
            </button>
          ))}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#64748B]" />
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-7 pr-3 py-1.5 rounded-lg bg-[#334155] text-white text-xs placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#00D1B2]"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-[#64748B] border-b border-white/10">
              <th className="pb-3 pr-4">Fecha</th>
              <th className="pb-3 pr-4">Apuesta</th>
              <th className="pb-3 pr-4">Tipo</th>
              <th className="pb-3 pr-4 text-center">Cuota</th>
              <th className="pb-3 pr-4 text-center">Result</th>
              <th className="pb-3 text-right">Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {mostradas.map((a, i) => {
              const e = estilos[a.resultado] || estilos.NULA;
              return (
                <tr key={a.id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-4 text-sm text-[#94A3B8]">{a.fecha}</td>
                  <td className="py-3 pr-4 text-sm text-white max-w-[200px] truncate">{a.apuesta}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-1 rounded-lg bg-[#334155] text-[#94A3B8]">
                      {a.tipo_mercado || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-center text-sm font-mono text-white">@{Number(a.cuota || 0).toFixed(2)}</td>
                  <td className="py-3 pr-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${e.bg}`}>
                      {e.icon}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`text-sm font-mono font-bold ${a.ganancia_neta >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
                      {a.resultado !== 'PENDIENTE' && a.resultado !== 'NULA' 
                        ? `${a.ganancia_neta >= 0 ? '+' : ''}$${Math.round(a.ganancia_neta).toLocaleString()}` 
                        : '-'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtradas.length > 10 && !mostrarTodas && (
        <button 
          onClick={() => setMostrarTodas(true)} 
          className="w-full mt-4 py-3 text-center text-[#00D1B2] text-sm font-medium hover:underline"
        >
          Ver todas las apuestas ({filtradas.length})
        </button>
      )}
      
      {filtradas.length === 0 && (
        <p className="text-center text-[#64748B] py-8">No hay apuestas con este filtro</p>
      )}
    </div>
  );
};

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================
export default function TipsterDetallePage() {
  const params = useParams();
  const tipsterId = parseInt(params.id as string);
  const [data, setData] = useState<TipsterDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const response = await tipstersAPI.getById(tipsterId);
        
        if (response) {
          // Mapear la respuesta del backend al formato esperado
          setData({
            tipster: response.tipster,
            estadisticas: {
              ...response.estadisticas,
              tipo_racha: (response.estadisticas?.racha_actual || 0) >= 0 ? 'W' : 'L',
              racha_actual: Math.abs(response.estadisticas?.racha_actual || 0)
            },
            estrategia: {
              estrategia_activa: response.estrategia?.estrategia_activa || 'RACHAS',
              estrategia_recomendada: response.estrategia?.estrategia_recomendada,
              porcentaje_kelly: response.estrategia?.porcentaje_kelly || 0.40,
              stake_minimo: response.estrategia?.stake_minimo || 1000,
              stake_maximo: response.estrategia?.stake_maximo || 5000,
              win_rate: response.estrategia?.win_rate,
              cuota_promedio: response.estrategia?.cuota_promedio,
              yield_calculado: response.estrategia?.yield_calculado,
              notas: response.estrategia?.notas
            },
            alertas: response.alertas || [],
            historial: (response.historial || []).map((h: any) => ({
              id: h.id,
              fecha: h.fecha,
              apuesta: h.apuesta,
              tipo_mercado: h.tipo_mercado,
              cuota: h.cuota,
              stake: h.stake_ia || h.stake || 0,
              stake_ia: h.stake_ia,
              resultado: h.resultado,
              ganancia_neta: h.ganancia_neta || 0,
              racha_actual: h.racha_actual
            }))
          });
        } else {
          setError('No se pudo cargar el tipster');
        }
      } catch (err) {
        console.error('Error fetching tipster:', err);
        setError('Error al cargar los datos. Por favor inicia sesión.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
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
      <div className="text-center py-16">
        <AlertTriangle className="h-12 w-12 text-[#F59E0B] mx-auto mb-4" />
        <p className="text-[#94A3B8] mb-4">{error || 'Tipster no encontrado'}</p>
        <Link href="/dashboard/tipsters" className="text-[#00D1B2] hover:underline">← Volver a Tipsters</Link>
      </div>
    );
  }

  const { tipster, estadisticas, estrategia, alertas, historial } = data;
  const isRentable = estadisticas.ganancia_total > 0;
  const kellyDisplay = normalizeKelly(estrategia.porcentaje_kelly);

  return (
    <div className="space-y-6 animate-fadeIn pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tipsters" className="p-2 rounded-xl hover:bg-white/10 transition-all">
          <ChevronLeft className="h-6 w-6 text-[#94A3B8]" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Detalle del Tipster</h1>
      </div>

      {/* Racha */}
      <RachaBar racha={estadisticas.racha_actual} tipo={estadisticas.tipo_racha || 'W'} />

      {/* Alertas */}
      {alertas && <AlertasSection alertas={alertas} />}

      {/* Info + Simulador */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Card Info */}
        <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" 
                style={{ background: 'linear-gradient(135deg,#1E293B,#334155)', border: '2px solid rgba(255,255,255,0.1)' }}>
                {getDeporteIcon(tipster.deporte)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{tipster.alias}</h2>
                <p className="text-[#94A3B8]">{tipster.deporte}</p>
              </div>
            </div>
            {isRentable && (
              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-[#00D1B2]/20 text-[#00D1B2] border border-[#00D1B2]/30"
                style={{ boxShadow: '0 0 12px rgba(0,209,178,0.3)' }}>
                Rentable
              </span>
            )}
          </div>

          {/* Estrategia Badge */}
          <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-[#0F172A]/50">
            <span 
              className="px-3 py-1 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: getEstrategiaColor(estrategia.estrategia_activa) }}
            >
              {estrategia.estrategia_activa}
            </span>
            <span className="text-[#64748B]">•</span>
            <span className="text-[#00D1B2] font-medium">Kelly {kellyDisplay}%</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-[#0F172A]/50">
              <p className={`text-3xl font-bold font-mono ${
                (estadisticas.porcentaje_acierto || 0) >= 60 ? 'text-[#00D1B2]' : 
                (estadisticas.porcentaje_acierto || 0) >= 50 ? 'text-[#FFDD57]' : 'text-[#EF4444]'
              }`}>
                {Number(estadisticas.porcentaje_acierto || 0).toFixed(1)}%
              </p>
              <p className="text-xs text-[#64748B] mt-1">Win Rate</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[#0F172A]/50">
              <p className="text-3xl font-bold font-mono">
                <span className="text-[#00D1B2]">{estadisticas.ganadas}</span>
                <span className="text-[#64748B]">/</span>
                <span className="text-[#EF4444]">{estadisticas.perdidas}</span>
              </p>
              <p className="text-xs text-[#64748B] mt-1">W/L</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[#0F172A]/50">
              <p className={`text-3xl font-bold font-mono ${isRentable ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
                {isRentable ? '+' : ''}${(Number(estadisticas.ganancia_total || 0) / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-[#64748B] mt-1">Profit</p>
            </div>
          </div>
        </div>

        {/* Simulador */}
        <SimuladorGanancias estrategia={estrategia} historial={historial} />
      </div>

      {/* Gráfico */}
      <GraficoRendimiento historial={historial} estadisticas={estadisticas} />

      {/* Historial */}
      <HistorialApuestas historial={historial} />
    </div>
  );
}
