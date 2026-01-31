'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, Flame, Snowflake, AlertTriangle, AlertCircle, 
  Info, Search, Calendar, BarChart3, DollarSign
} from 'lucide-react';
import { tipstersAPI } from '@/lib/api';

interface Apuesta {
  id: number;
  fecha: string;
  apuesta: string;
  tipo_mercado: string;
  cuota: number;
  stake: number;
  resultado: 'GANADA' | 'PERDIDA' | 'PENDIENTE' | 'NULA';
  ganancia_neta: number;
}

interface Alerta {
  id: number;
  nivel: 'INFO' | 'PRECAUCION' | 'ALERTA' | 'CRITICO';
  mensaje: string;
  recomendacion: string;
}

interface Estrategia {
  tipo_estrategia: string;
  porcentaje_kelly: number;
  stake_minimo: number;
  stake_maximo: number;
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
    tipo_racha: string;
    mejor_racha: number;
    cuota_promedio: number;
    roi: number;
    yield_total: number;
  };
  estrategia: Estrategia;
  alertas: Alerta[];
  historial: Apuesta[];
}

const getDeporteIcon = (deporte: string) => {
  const icons: Record<string, string> = {
    'Futbol': '⚽', 'Tenis': '🎾', 'NBA': '🏀', 'Baloncesto': '🏀',
    'Voleibol': '🏐', 'Mixto': '🎯', 'eSports': '🎮'
  };
  return icons[deporte] || '🎯';
};

// Barra de Racha
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
              <span className="text-[#00D1B2] font-bold text-lg ml-2">RACHA W{racha} EN FUEGO</span>
            </>
          ) : (
            <>
              {[...Array(Math.min(racha, 5))].map((_, i) => (
                <Snowflake key={i} className="h-5 w-5 text-[#3B82F6]" />
              ))}
              <span className="text-[#EF4444] font-bold text-lg ml-2">RACHA FRÍA L{racha}</span>
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

// Alertas
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

// Simulador de Ganancias
const SimuladorGanancias = ({ estrategia, historial }: { estrategia: Estrategia; historial: Apuesta[] }) => {
  const [banca, setBanca] = useState(500000);
  const [resultado, setResultado] = useState({ ganancia: 0, bancaFinal: 0, retorno: 0 });

  useEffect(() => {
    let bancaSimulada = banca;
    historial.filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA').forEach((apuesta) => {
      const stakeBase = bancaSimulada * (estrategia.porcentaje_kelly / 100);
      const stake = Math.max(estrategia.stake_minimo, Math.min(stakeBase, estrategia.stake_maximo));
      bancaSimulada += apuesta.resultado === 'GANADA' ? stake * (apuesta.cuota - 1) : -stake;
    });
    setResultado({
      ganancia: bancaSimulada - banca,
      bancaFinal: bancaSimulada,
      retorno: banca > 0 ? ((bancaSimulada - banca) / banca) * 100 : 0
    });
  }, [banca, historial, estrategia]);

  return (
    <div className="rounded-2xl p-6 border border-white/10 h-full" style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)' }}>
      <h3 className="text-white font-bold flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-[#FFDD57]" /> Simulador de Ganancias
      </h3>
      <div className="text-sm text-[#94A3B8] mb-4">
        Estrategia: <span className="text-[#00D1B2] font-medium">{estrategia.tipo_estrategia}</span> • 
        Kelly: <span className="text-white font-medium">{estrategia.porcentaje_kelly}%</span>
      </div>
      <div className="mb-6">
        <label className="text-sm text-[#94A3B8] mb-2 block">Tu banca inicial</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">$</span>
          <input
            type="number"
            value={banca}
            onChange={(e) => setBanca(Number(e.target.value) || 0)}
            className="w-full rounded-xl py-3 pl-8 pr-4 text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#00D1B2]/50"
            style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
      </div>
      <div className="space-y-4">
        {[
          { label: '📈 Ganancia', value: resultado.ganancia, format: (v: number) => `${v >= 0 ? '+' : ''}$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: '📊 Banca final', value: resultado.bancaFinal, format: (v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, neutral: true },
          { label: '🎯 Retorno', value: resultado.retorno, format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%` }
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]/50">
            <span className="text-[#94A3B8]">{item.label}</span>
            <span className={`text-xl font-bold font-mono ${item.neutral ? 'text-white' : item.value >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
              {item.format(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Gráfico de Rendimiento
const GraficoRendimiento = ({ historial, estadisticas }: { historial: Apuesta[]; estadisticas: TipsterDetalle['estadisticas'] }) => {
  const [periodo, setPeriodo] = useState<'7D' | '30D' | 'TODO'>('TODO');

  const puntos = (() => {
    let banca = 500000;
    const pts = [banca];
    [...historial].filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA').reverse().forEach(a => {
      banca += a.ganancia_neta;
      pts.push(banca);
    });
    return pts;
  })();

  const max = Math.max(...puntos), min = Math.min(...puntos), rango = max - min || 1;
  const pathD = `M ${puntos.map((v, i) => `${puntos.length > 1 ? (i / (puntos.length - 1)) * 100 : 0},${50 - ((v - min) / rango) * 50}`).join(' L ')}`;
  const color = puntos[puntos.length - 1] >= puntos[0] ? '#00D1B2' : '#EF4444';

  return (
    <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#3B82F6]" /> Rendimiento
        </h3>
        <div className="flex gap-1">
          {(['7D', '30D', 'TODO'] as const).map(p => (
            <button key={p} onClick={() => setPeriodo(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${periodo === p ? 'bg-[#00D1B2] text-white' : 'text-[#64748B] hover:text-white'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="h-14 mb-4">
        <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${pathD} L 100,50 L 0,50 Z`} fill="url(#areaGrad)" />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        </svg>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'ROI', value: `${estadisticas.roi >= 0 ? '+' : ''}${estadisticas.roi}%`, positive: estadisticas.roi >= 0 },
          { label: 'Cuota Prom', value: `@${estadisticas.cuota_promedio}`, neutral: true },
          { label: 'Yield', value: `${estadisticas.yield_total}%`, positive: estadisticas.yield_total >= 0 },
          { label: 'Mejor Racha', value: estadisticas.mejor_racha, gold: true }
        ].map((m, i) => (
          <div key={i} className="text-center p-2 rounded-lg bg-[#0F172A]/50">
            <p className={`text-lg font-bold font-mono ${m.gold ? 'text-[#FFDD57]' : m.neutral ? 'text-white' : m.positive ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>{m.value}</p>
            <p className="text-[10px] text-[#64748B]">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Historial de Apuestas
const HistorialApuestas = ({ historial }: { historial: Apuesta[] }) => {
  const [filtro, setFiltro] = useState<'todas' | 'GANADA' | 'PERDIDA' | 'PENDIENTE'>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarTodas, setMostrarTodas] = useState(false);

  const filtradas = historial
    .filter(a => filtro === 'todas' || a.resultado === filtro)
    .filter(a => a.apuesta.toLowerCase().includes(busqueda.toLowerCase()));
  const mostradas = mostrarTodas ? filtradas : filtradas.slice(0, 10);

  const estilos: Record<string, { bg: string; icon: string }> = {
    GANADA: { bg: 'bg-[#00D1B2]/10', icon: '✅' },
    PERDIDA: { bg: 'bg-[#EF4444]/10', icon: '❌' },
    PENDIENTE: { bg: 'bg-[#FFDD57]/10', icon: '⏳' },
    NULA: { bg: 'bg-[#64748B]/10', icon: '⚪' }
  };

  return (
    <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#3B82F6]" /> Historial de Apuestas
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[{ key: 'todas', label: 'Todas' }, { key: 'GANADA', label: '✅' }, { key: 'PERDIDA', label: '❌' }, { key: 'PENDIENTE', label: '⏳' }].map(f => (
              <button key={f.key} onClick={() => setFiltro(f.key as typeof filtro)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filtro === f.key ? 'bg-[#00D1B2] text-white' : 'bg-[#0F172A]/50 text-[#64748B] hover:text-white'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="w-32 sm:w-40 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#00D1B2]/50"
              style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} />
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
                  <td className="py-3 pr-4 text-sm text-white">{a.apuesta}</td>
                  <td className="py-3 pr-4"><span className="text-xs px-2 py-1 rounded-lg bg-[#334155] text-[#94A3B8]">{a.tipo_mercado}</span></td>
                  <td className="py-3 pr-4 text-center text-sm font-mono text-white">@{a.cuota}</td>
                  <td className="py-3 pr-4 text-center"><span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${e.bg}`}>{e.icon}</span></td>
                  <td className="py-3 text-right">
                    <span className={`text-sm font-mono font-bold ${a.ganancia_neta >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
                      {a.resultado !== 'PENDIENTE' && a.resultado !== 'NULA' ? `${a.ganancia_neta >= 0 ? '+' : ''}$${a.ganancia_neta.toLocaleString()}` : '-'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filtradas.length > 10 && !mostrarTodas && (
        <button onClick={() => setMostrarTodas(true)} className="w-full mt-4 py-3 text-center text-[#00D1B2] text-sm font-medium hover:underline">
          Ver todas las apuestas ({filtradas.length})
        </button>
      )}
      {filtradas.length === 0 && <p className="text-center text-[#64748B] py-8">No hay apuestas con este filtro</p>}
    </div>
  );
};

// Página Principal
export default function TipsterDetallePage() {
  const params = useParams();
  const tipsterId = parseInt(params.id as string);
  const [data, setData] = useState<TipsterDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await tipstersAPI.getById(tipsterId);
        setData(response);
      } catch {
        // Mock data
        setData({
          tipster: { id: tipsterId, alias: 'Pro Master', deporte: 'Futbol' },
          estadisticas: {
            total_apuestas: 46, ganadas: 33, perdidas: 13, porcentaje_acierto: 71.7,
            ganancia_total: 26720, racha_actual: 5, tipo_racha: 'W', mejor_racha: 8,
            cuota_promedio: 1.65, roi: 12.5, yield_total: 8.3
          },
          estrategia: { tipo_estrategia: 'HIBRIDA', porcentaje_kelly: 40, stake_minimo: 5000, stake_maximo: 50000 },
          alertas: [],
          historial: [
            { id: 1, fecha: '30/01', apuesta: 'Real Madrid ML', tipo_mercado: 'Moneyline', cuota: 1.45, stake: 15000, resultado: 'GANADA', ganancia_neta: 6750 },
            { id: 2, fecha: '29/01', apuesta: 'Over 2.5 goles', tipo_mercado: 'Over/Under', cuota: 1.80, stake: 12000, resultado: 'GANADA', ganancia_neta: 9600 },
            { id: 3, fecha: '28/01', apuesta: 'Barcelona -1', tipo_mercado: 'Handicap', cuota: 2.10, stake: 10000, resultado: 'PERDIDA', ganancia_neta: -10000 },
            { id: 4, fecha: '27/01', apuesta: 'Ambos anotan - Sí', tipo_mercado: 'BTTS', cuota: 1.75, stake: 12000, resultado: 'GANADA', ganancia_neta: 9000 },
            { id: 5, fecha: '26/01', apuesta: 'Liverpool DNB', tipo_mercado: 'DNB', cuota: 1.55, stake: 15000, resultado: 'GANADA', ganancia_neta: 8250 },
            { id: 6, fecha: '25/01', apuesta: 'Chelsea +0.5', tipo_mercado: 'Handicap', cuota: 1.90, stake: 10000, resultado: 'PERDIDA', ganancia_neta: -10000 },
            { id: 7, fecha: '24/01', apuesta: 'Man City -1.5', tipo_mercado: 'Spread', cuota: 2.20, stake: 8000, resultado: 'GANADA', ganancia_neta: 9600 },
            { id: 8, fecha: '23/01', apuesta: 'Arsenal ML', tipo_mercado: 'Moneyline', cuota: 1.60, stake: 15000, resultado: 'GANADA', ganancia_neta: 9000 },
          ]
        });
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

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-[#94A3B8]">Tipster no encontrado</p>
        <Link href="/dashboard/tipsters" className="text-[#00D1B2] hover:underline mt-2 inline-block">← Volver</Link>
      </div>
    );
  }

  const { tipster, estadisticas, estrategia, alertas, historial } = data;
  const isRentable = estadisticas.ganancia_total > 0;

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
      <RachaBar racha={estadisticas.racha_actual} tipo={estadisticas.tipo_racha} />

      {/* Alertas */}
      <AlertasSection alertas={alertas} />

      {/* Info + Simulador */}
      <div className="grid lg:grid-cols-2 gap-6">
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
                style={{ boxShadow: '0 0 12px rgba(0,209,178,0.3)' }}>Rentable</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-[#0F172A]/50">
            <span>📊</span>
            <span className="text-white font-medium">{estrategia.tipo_estrategia}</span>
            <span className="text-[#64748B]">•</span>
            <span className="text-[#00D1B2]">Kelly {estrategia.porcentaje_kelly}%</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-[#0F172A]/50">
              <p className={`text-3xl font-bold font-mono ${estadisticas.porcentaje_acierto >= 60 ? 'text-[#00D1B2]' : estadisticas.porcentaje_acierto >= 50 ? 'text-[#FFDD57]' : 'text-[#EF4444]'}`}>
                {estadisticas.porcentaje_acierto}%
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
                {isRentable ? '+' : ''}${(estadisticas.ganancia_total / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-[#64748B] mt-1">Profit</p>
            </div>
          </div>
        </div>
        <SimuladorGanancias estrategia={estrategia} historial={historial} />
      </div>

      {/* Gráfico */}
      <GraficoRendimiento historial={historial} estadisticas={estadisticas} />

      {/* Historial */}
      <HistorialApuestas historial={historial} />
    </div>
  );
}
