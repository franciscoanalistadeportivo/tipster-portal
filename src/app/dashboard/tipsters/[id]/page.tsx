'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, Flame, Snowflake, AlertTriangle, AlertCircle, 
  Info, Search, Calendar, BarChart3, TrendingUp, Brain,
  Shield, Target, Zap, Filter, CheckCircle, XCircle, Clock,
  Star, Award, TrendingDown
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

interface Estrategia {
  estrategia_activa: string;
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
    tipo_racha?: string;
    mejor_racha: number;
  };
  estrategia: Estrategia;
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

// Calcular ROI real del historial
const calcularROI = (historial: Apuesta[]): number => {
  const apuestasResueltas = historial.filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA');
  if (apuestasResueltas.length === 0) return 0;
  
  const totalStakes = apuestasResueltas.reduce((acc, a) => acc + (a.stake_ia || a.stake || 5000), 0);
  const gananciaTotal = apuestasResueltas.reduce((acc, a) => acc + (a.ganancia_neta || 0), 0);
  
  return totalStakes > 0 ? (gananciaTotal / totalStakes) * 100 : 0;
};

// Calcular cuota promedio
const calcularCuotaPromedio = (historial: Apuesta[]): number => {
  const apuestasResueltas = historial.filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA');
  if (apuestasResueltas.length === 0) return 0;
  return apuestasResueltas.reduce((acc, a) => acc + (a.cuota || 0), 0) / apuestasResueltas.length;
};

// Nivel de confianza basado en métricas
const calcularNivelConfianza = (winRate: number, roi: number, totalApuestas: number, rachaActual: number): { nivel: string; estrellas: number; color: string } => {
  let puntos = 0;
  
  // Win Rate (max 30 puntos)
  if (winRate >= 70) puntos += 30;
  else if (winRate >= 60) puntos += 25;
  else if (winRate >= 55) puntos += 20;
  else if (winRate >= 50) puntos += 15;
  else puntos += 5;
  
  // ROI (max 30 puntos)
  if (roi >= 20) puntos += 30;
  else if (roi >= 10) puntos += 25;
  else if (roi >= 5) puntos += 20;
  else if (roi >= 0) puntos += 10;
  else puntos += 0;
  
  // Total apuestas (max 20 puntos)
  if (totalApuestas >= 50) puntos += 20;
  else if (totalApuestas >= 30) puntos += 15;
  else if (totalApuestas >= 20) puntos += 10;
  else puntos += 5;
  
  // Racha actual (max 20 puntos)
  if (rachaActual >= 5) puntos += 20;
  else if (rachaActual >= 3) puntos += 15;
  else if (rachaActual >= 0) puntos += 10;
  else puntos += 0;
  
  // Determinar nivel
  if (puntos >= 85) return { nivel: 'EXCELENTE', estrellas: 5, color: '#00D1B2' };
  if (puntos >= 70) return { nivel: 'MUY BUENO', estrellas: 4, color: '#00D1B2' };
  if (puntos >= 55) return { nivel: 'BUENO', estrellas: 3, color: '#FFDD57' };
  if (puntos >= 40) return { nivel: 'REGULAR', estrellas: 2, color: '#F59E0B' };
  return { nivel: 'EN OBSERVACIÓN', estrellas: 1, color: '#EF4444' };
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
// COMPONENTE: Análisis con IA
// ============================================================================
const AnalisisIA = () => {
  return (
    <div className="rounded-2xl p-6 border border-[#00D1B2]/30 bg-gradient-to-br from-[#00D1B2]/10 to-transparent">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#00D1B2]/20 flex items-center justify-center">
          <Brain className="h-5 w-5 text-[#00D1B2]" />
        </div>
        <div>
          <h3 className="text-white font-bold">Analizado por Inteligencia Artificial</h3>
          <p className="text-[#94A3B8] text-sm">Cada pick pasa por nuestro sistema de análisis</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Target, label: 'EV Positivo', desc: 'Valor esperado' },
          { icon: BarChart3, label: 'Kelly Criterion', desc: 'Gestión de riesgo' },
          { icon: Shield, label: 'Filtro Anti-Malo', desc: 'Rechaza picks malos' },
          { icon: Zap, label: 'Rachas Dinámicas', desc: 'Ajuste automático' },
        ].map((item, i) => (
          <div key={i} className="bg-[#0F172A]/50 rounded-xl p-3 text-center">
            <item.icon className="h-5 w-5 text-[#00D1B2] mx-auto mb-2" />
            <p className="text-white text-sm font-medium">{item.label}</p>
            <p className="text-[#64748B] text-xs">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Comparación vs Inversiones
// ============================================================================
const ComparacionInversiones = ({ roi }: { roi: number }) => {
  const comparaciones = [
    { nombre: 'Depósito a plazo', valor: 0.4, color: '#64748B' },
    { nombre: 'Fondos mutuos', valor: 1.2, color: '#94A3B8' },
    { nombre: 'Acciones (promedio)', valor: 2.5, color: '#3B82F6' },
    { nombre: 'Este tipster', valor: roi, color: '#00D1B2', destacado: true },
  ];

  const maxValor = Math.max(...comparaciones.map(c => c.valor), 1);

  return (
    <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)' }}>
      <h3 className="text-white font-bold flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-[#00D1B2]" />
        Rentabilidad vs Inversiones Tradicionales
      </h3>
      
      <div className="space-y-3">
        {comparaciones.map((item, i) => (
          <div key={i} className={`${item.destacado ? 'bg-[#00D1B2]/10 rounded-xl p-3 -mx-3' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm ${item.destacado ? 'text-[#00D1B2] font-bold' : 'text-[#94A3B8]'}`}>
                {item.destacado && '🔥 '}{item.nombre}
              </span>
              <span className={`font-mono font-bold ${item.destacado ? 'text-[#00D1B2] text-lg' : 'text-white'}`}>
                {item.valor > 0 ? '+' : ''}{item.valor.toFixed(1)}%
                {item.destacado && <span className="text-xs font-normal text-[#94A3B8]"> /mes</span>}
              </span>
            </div>
            <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min((item.valor / maxValor) * 100, 100)}%`,
                  backgroundColor: item.color,
                  boxShadow: item.destacado ? `0 0 10px ${item.color}` : 'none'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {roi > 2.5 && (
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <p className="text-[#00D1B2] font-bold text-lg">
            {Math.round(roi / 0.4)}x mejor que el banco 🏦
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE: Indicadores de Confianza
// ============================================================================
const IndicadoresConfianza = ({ 
  winRate, 
  roi, 
  totalApuestas, 
  rachaActual,
  mejorRacha
}: { 
  winRate: number; 
  roi: number; 
  totalApuestas: number; 
  rachaActual: number;
  mejorRacha: number;
}) => {
  const confianza = calcularNivelConfianza(winRate, roi, totalApuestas, rachaActual);

  return (
    <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Award className="h-5 w-5 text-[#FFDD57]" />
          Nivel de Confianza
        </h3>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-5 w-5 ${i < confianza.estrellas ? 'text-[#FFDD57] fill-[#FFDD57]' : 'text-[#334155]'}`} 
            />
          ))}
        </div>
      </div>

      <div className="text-center mb-4">
        <span 
          className="text-2xl font-bold px-4 py-2 rounded-xl"
          style={{ color: confianza.color, backgroundColor: `${confianza.color}20` }}
        >
          {confianza.nivel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0F172A]/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#94A3B8] text-sm">Win Rate</span>
            <span className={`text-sm font-bold ${winRate >= 60 ? 'text-[#00D1B2]' : winRate >= 50 ? 'text-[#FFDD57]' : 'text-[#EF4444]'}`}>
              {winRate >= 60 ? '✅ Excelente' : winRate >= 50 ? '⚠️ Bueno' : '❌ Bajo'}
            </span>
          </div>
          <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-[#00D1B2]"
              style={{ width: `${Math.min(winRate, 100)}%` }}
            />
          </div>
          <p className="text-white font-bold text-right mt-1">{winRate.toFixed(1)}%</p>
        </div>

        <div className="bg-[#0F172A]/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#94A3B8] text-sm">ROI</span>
            <span className={`text-sm font-bold ${roi >= 10 ? 'text-[#00D1B2]' : roi >= 0 ? 'text-[#FFDD57]' : 'text-[#EF4444]'}`}>
              {roi >= 10 ? '✅ Muy rentable' : roi >= 0 ? '⚠️ Positivo' : '❌ Negativo'}
            </span>
          </div>
          <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full"
              style={{ 
                width: `${Math.min(Math.max(roi + 20, 0), 100)}%`,
                backgroundColor: roi >= 0 ? '#00D1B2' : '#EF4444'
              }}
            />
          </div>
          <p className={`font-bold text-right mt-1 ${roi >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
          </p>
        </div>

        <div className="bg-[#0F172A]/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#94A3B8] text-sm">Muestra</span>
            <span className={`text-sm font-bold ${totalApuestas >= 30 ? 'text-[#00D1B2]' : 'text-[#FFDD57]'}`}>
              {totalApuestas >= 30 ? '✅ Sólida' : '⚠️ En desarrollo'}
            </span>
          </div>
          <p className="text-white font-bold text-2xl text-center">{totalApuestas}</p>
          <p className="text-[#64748B] text-xs text-center">apuestas verificadas</p>
        </div>

        <div className="bg-[#0F172A]/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#94A3B8] text-sm">Mejor Racha</span>
            <span className="text-[#FFDD57] text-sm font-bold">🏆 Récord</span>
          </div>
          <p className="text-[#FFDD57] font-bold text-2xl text-center">+{mejorRacha}</p>
          <p className="text-[#64748B] text-xs text-center">victorias seguidas</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Gráfico de Rendimiento Mejorado
// ============================================================================
const GraficoRendimiento = ({ historial }: { historial: Apuesta[] }) => {
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
  const height = 60;
  const padding = 5;

  const pathPoints = puntos.map((p, i) => {
    const x = padding + (i / (puntos.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((p.y - minY) / rangeY) * (height - 2 * padding);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaPath = pathPoints + ` L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
  const isPositive = acumulado >= 0;

  // Calcular métricas
  const roi = calcularROI(historial);
  const cuotaPromedio = calcularCuotaPromedio(historial);
  const yieldPorApuesta = apuestasResueltas.length > 0 ? acumulado / apuestasResueltas.length : 0;

  return (
    <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#00D1B2]" /> 
          Evolución de Ganancias
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

      {/* Gráfico SVG más grande */}
      <div className="h-40 mb-6">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? '#00D1B2' : '#EF4444'} stopOpacity="0.4" />
              <stop offset="100%" stopColor={isPositive ? '#00D1B2' : '#EF4444'} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#areaGradient)" />
          <path 
            d={pathPoints} 
            fill="none" 
            stroke={isPositive ? '#00D1B2' : '#EF4444'} 
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 6px ${isPositive ? '#00D1B2' : '#EF4444'})` }}
          />
        </svg>
      </div>

      {/* Stats en una fila */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className={`text-xl font-bold font-mono ${roi >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
          </p>
          <p className="text-xs text-[#64748B]">ROI</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold font-mono text-white">@{cuotaPromedio.toFixed(2)}</p>
          <p className="text-xs text-[#64748B]">Cuota Prom</p>
        </div>
        <div className="text-center">
          <p className={`text-xl font-bold font-mono ${yieldPorApuesta >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {yieldPorApuesta >= 0 ? '+' : ''}${Math.abs(Math.round(yieldPorApuesta)).toLocaleString()}
          </p>
          <p className="text-xs text-[#64748B]">Yield/Apuesta</p>
        </div>
        <div className="text-center">
          <p className={`text-xl font-bold font-mono ${isPositive ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {isPositive ? '+' : ''}${Math.abs(Math.round(acumulado)).toLocaleString()}
          </p>
          <p className="text-xs text-[#64748B]">Profit Total</p>
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
    <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)' }}>
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
              className="pl-7 pr-3 py-1.5 rounded-lg bg-[#334155] text-white text-xs placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#00D1B2] w-24"
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
                    <span className={`text-sm font-mono font-bold ${(a.ganancia_neta || 0) >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
                      {a.resultado !== 'PENDIENTE' && a.resultado !== 'NULA' 
                        ? `${(a.ganancia_neta || 0) >= 0 ? '+' : ''}$${Math.round(a.ganancia_neta || 0).toLocaleString()}` 
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
          setData({
            tipster: response.tipster,
            estadisticas: {
              ...response.estadisticas,
              tipo_racha: (response.estadisticas?.racha_actual || 0) >= 0 ? 'W' : 'L',
              racha_actual: Math.abs(response.estadisticas?.racha_actual || 0)
            },
            estrategia: {
              estrategia_activa: response.estrategia?.estrategia_activa || 'RACHAS',
              porcentaje_kelly: response.estrategia?.porcentaje_kelly || 0.40,
              stake_minimo: response.estrategia?.stake_minimo || 1000,
              stake_maximo: response.estrategia?.stake_maximo || 5000,
            },
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
        setError('Inicia sesión para ver los detalles del tipster');
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

  const { tipster, estadisticas, historial } = data;
  const isRentable = estadisticas.ganancia_total > 0;
  const roi = calcularROI(historial);
  const totalApuestasResueltas = historial.filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA').length;

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

      {/* Info Tipster */}
      <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)' }}>
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
              <span className="text-[#00D1B2]">{estadisticas.ganadas || 0}</span>
              <span className="text-[#64748B]">/</span>
              <span className="text-[#EF4444]">{estadisticas.perdidas || 0}</span>
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

      {/* Análisis IA */}
      <AnalisisIA />

      {/* Grid: Comparación + Confianza */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ComparacionInversiones roi={roi} />
        <IndicadoresConfianza 
          winRate={estadisticas.porcentaje_acierto || 0}
          roi={roi}
          totalApuestas={totalApuestasResueltas}
          rachaActual={estadisticas.racha_actual || 0}
          mejorRacha={estadisticas.mejor_racha || 0}
        />
      </div>

      {/* Gráfico */}
      <GraficoRendimiento historial={historial} />

      {/* Historial */}
      <HistorialApuestas historial={historial} />
    </div>
  );
}
