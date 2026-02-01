'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, Flame, Snowflake, AlertTriangle,
  Search, Calendar, BarChart3, TrendingUp, Brain,
  Shield, Target, Zap, Star, Award, Info
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
  resultado: 'GANADA' | 'PERDIDA' | 'PENDIENTE' | 'NULA';
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

// Calcular Yield real del historial
const calcularYield = (historial: Apuesta[]): number => {
  const apuestasResueltas = historial.filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA');
  if (apuestasResueltas.length === 0) return 0;
  
  let unidadesGanadas = 0;
  apuestasResueltas.forEach(a => {
    if (a.resultado === 'GANADA') {
      unidadesGanadas += (Number(a.cuota || 0) - 1);
    } else {
      unidadesGanadas -= 1;
    }
  });
  
  return (unidadesGanadas / apuestasResueltas.length) * 100;
};

// Calcular cuota promedio
const calcularCuotaPromedio = (historial: Apuesta[]): number => {
  const apuestasResueltas = historial.filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA');
  if (apuestasResueltas.length === 0) return 0;
  return apuestasResueltas.reduce((acc, a) => acc + (Number(a.cuota) || 0), 0) / apuestasResueltas.length;
};

// Calcular racha actual desde historial
const calcularRachaActual = (historial: Apuesta[]): { racha: number; tipo: 'W' | 'L' } => {
  const resueltas = historial.filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA');
  if (resueltas.length === 0) return { racha: 0, tipo: 'W' };
  
  let racha = 0;
  const ultimoResultado = resueltas[0]?.resultado;
  
  for (const ap of resueltas) {
    if (ap.resultado === ultimoResultado) {
      racha++;
    } else {
      break;
    }
  }
  
  return { racha, tipo: ultimoResultado === 'GANADA' ? 'W' : 'L' };
};

// Calcular mejor racha
const calcularMejorRacha = (historial: Apuesta[]): number => {
  const resueltas = historial.filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA').reverse();
  let mejorRacha = 0;
  let rachaActual = 0;
  
  for (let i = 0; i < resueltas.length; i++) {
    if (resueltas[i].resultado === 'GANADA') {
      rachaActual++;
      if (rachaActual > mejorRacha) mejorRacha = rachaActual;
    } else {
      rachaActual = 0;
    }
  }
  
  return mejorRacha;
};

// Nivel de confianza
const calcularNivelConfianza = (winRate: number, yield_: number, totalApuestas: number): { nivel: string; estrellas: number; color: string } => {
  let puntos = 0;
  
  if (winRate >= 70) puntos += 30;
  else if (winRate >= 60) puntos += 25;
  else if (winRate >= 55) puntos += 20;
  else if (winRate >= 50) puntos += 15;
  else puntos += 5;
  
  if (yield_ >= 15) puntos += 30;
  else if (yield_ >= 10) puntos += 25;
  else if (yield_ >= 5) puntos += 20;
  else if (yield_ >= 0) puntos += 10;
  
  if (totalApuestas >= 50) puntos += 20;
  else if (totalApuestas >= 30) puntos += 15;
  else if (totalApuestas >= 20) puntos += 10;
  else puntos += 5;
  
  if (puntos >= 70) return { nivel: 'EXCELENTE', estrellas: 5, color: '#00D1B2' };
  if (puntos >= 55) return { nivel: 'MUY BUENO', estrellas: 4, color: '#00D1B2' };
  if (puntos >= 40) return { nivel: 'BUENO', estrellas: 3, color: '#FFDD57' };
  if (puntos >= 25) return { nivel: 'REGULAR', estrellas: 2, color: '#F59E0B' };
  return { nivel: 'EN OBSERVACIÓN', estrellas: 1, color: '#EF4444' };
};

// ============================================================================
// COMPONENTE: Alerta de Racha
// ============================================================================
const AlertaRacha = ({ racha, tipo }: { racha: number; tipo: 'W' | 'L' }) => {
  if (racha < 3) return null;
  
  const isPositive = tipo === 'W';
  
  const getMensaje = () => {
    if (isPositive) {
      if (racha >= 5) return { titulo: '🔥 ¡En fuego!', mensaje: `${racha} victorias seguidas`, recomendacion: 'Momento ideal para seguirlo' };
      if (racha >= 4) return { titulo: '¡Excelente racha!', mensaje: '4 victorias seguidas', recomendacion: 'Está en muy buena forma' };
      return { titulo: '¡Buena racha!', mensaje: '3 victorias seguidas', recomendacion: 'Buen momento para seguir sus picks' };
    } else {
      if (racha >= 5) return { titulo: '❄️ Precaución', mensaje: `${racha} pérdidas seguidas`, recomendacion: 'Mejor esperar a que se recupere' };
      if (racha >= 4) return { titulo: 'Racha muy fría', mensaje: '4 pérdidas seguidas', recomendacion: 'Recomendamos esperar' };
      return { titulo: 'Racha fría', mensaje: '3 pérdidas seguidas', recomendacion: 'Considera esperar a que recupere forma' };
    }
  };
  
  const config = getMensaje();
  
  return (
    <div className={`rounded-2xl p-4 border ${
      isPositive 
        ? 'bg-gradient-to-r from-[#00D1B2]/10 to-transparent border-[#00D1B2]/30' 
        : 'bg-gradient-to-r from-[#EF4444]/10 to-transparent border-[#EF4444]/30'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isPositive ? 'bg-[#00D1B2]/20' : 'bg-[#EF4444]/20'
        }`}>
          {isPositive ? (
            <Flame className="h-5 w-5 text-[#FFDD57]" />
          ) : (
            <Snowflake className="h-5 w-5 text-[#3B82F6]" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={`font-bold ${isPositive ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
              {config.titulo}
            </h4>
            <span className={`font-mono font-bold text-lg ${isPositive ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
              {isPositive ? '+' : '-'}{racha}
            </span>
          </div>
          <p className="text-white text-sm mt-1">{config.mensaje}</p>
          <p className="text-[#94A3B8] text-sm mt-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            {config.recomendacion}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Análisis con IA
// ============================================================================
const AnalisisIA = () => (
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

// ============================================================================
// COMPONENTE: Comparación vs Inversiones
// ============================================================================
const ComparacionInversiones = ({ yield_ }: { yield_: number }) => {
  // No mostrar si yield es menor a 3%
  if (yield_ < 3) return null;
  
  const comparaciones = [
    { nombre: 'Depósito a plazo', valor: 0.4, color: '#64748B' },
    { nombre: 'Fondos mutuos', valor: 1.2, color: '#94A3B8' },
    { nombre: 'Acciones (promedio)', valor: 2.5, color: '#3B82F6' },
    { nombre: 'Este tipster', valor: yield_, color: '#00D1B2', destacado: true },
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
          <div key={i} className={item.destacado ? 'bg-[#00D1B2]/10 rounded-xl p-3 -mx-3' : ''}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm ${item.destacado ? 'text-[#00D1B2] font-bold' : 'text-[#94A3B8]'}`}>
                {item.destacado && '🔥 '}{item.nombre}
              </span>
              <span className={`font-mono font-bold ${item.destacado ? 'text-[#00D1B2] text-lg' : 'text-white'}`}>
                {Number(item.valor || 0) > 0 ? '+' : ''}{Number(item.valor || 0).toFixed(1)}%
                {item.destacado && <span className="text-xs font-normal text-[#94A3B8]"> /mes</span>}
              </span>
            </div>
            <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min((Number(item.valor || 0) / maxValor) * 100, 100)}%`,
                  backgroundColor: item.color,
                  boxShadow: item.destacado ? `0 0 10px ${item.color}` : 'none'
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {yield_ > 2.5 && (
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <p className="text-[#00D1B2] font-bold text-lg">
            {Math.round(yield_ / 0.4)}x mejor que el banco 🏦
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE: Indicadores de Confianza
// ============================================================================
const IndicadoresConfianza = ({ winRate, yield_, totalApuestas, mejorRacha }: { winRate: number; yield_: number; totalApuestas: number; mejorRacha: number }) => {
  const confianza = calcularNivelConfianza(winRate, yield_, totalApuestas);

  return (
    <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Award className="h-5 w-5 text-[#FFDD57]" />
          Nivel de Confianza
        </h3>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < confianza.estrellas ? 'text-[#FFDD57] fill-[#FFDD57]' : 'text-[#334155]'}`} />
          ))}
        </div>
      </div>
      <div className="text-center mb-4">
        <span className="text-2xl font-bold px-4 py-2 rounded-xl" style={{ color: confianza.color, backgroundColor: `${confianza.color}20` }}>
          {confianza.nivel}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0F172A]/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#94A3B8] text-sm">Efectividad</span>
            <span className={`text-sm font-bold ${winRate >= 60 ? 'text-[#00D1B2]' : winRate >= 50 ? 'text-[#FFDD57]' : 'text-[#EF4444]'}`}>
              {winRate >= 60 ? '✅ Excelente' : winRate >= 50 ? '⚠️ Bueno' : '❌ Bajo'}
            </span>
          </div>
          <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-[#00D1B2]" style={{ width: `${Math.min(winRate, 100)}%` }} />
          </div>
          <p className="text-white font-bold text-right mt-1">{Number(winRate || 0).toFixed(1)}%</p>
        </div>
        <div className="bg-[#0F172A]/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#94A3B8] text-sm">Yield</span>
            <span className={`text-sm font-bold ${yield_ >= 10 ? 'text-[#00D1B2]' : yield_ >= 0 ? 'text-[#FFDD57]' : 'text-[#EF4444]'}`}>
              {yield_ >= 10 ? '✅ Muy rentable' : yield_ >= 0 ? '⚠️ Positivo' : '❌ Negativo'}
            </span>
          </div>
          <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.min(Math.max(yield_ + 20, 0), 100)}%`, backgroundColor: yield_ >= 0 ? '#00D1B2' : '#EF4444' }} />
          </div>
          <p className={`font-bold text-right mt-1 ${yield_ >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {Number(yield_ || 0) >= 0 ? '+' : ''}{Number(yield_ || 0).toFixed(1)}%
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
// COMPONENTE: Gráfico de Evolución (Estilo Trading)
// ============================================================================
const GraficoEvolucion = ({ historial }: { historial: Apuesta[] }) => {
  const apuestasResueltas = historial.filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA').reverse();
  
  if (apuestasResueltas.length < 2) return null;

  // Calcular puntos de evolución en unidades
  let acumulado = 0;
  const puntos = apuestasResueltas.map((a) => {
    if (a.resultado === 'GANADA') {
      acumulado += (Number(a.cuota || 0) - 1);
    } else {
      acumulado -= 1;
    }
    return acumulado;
  });

  const maxY = Math.max(...puntos, 0);
  const minY = Math.min(...puntos, 0);
  const rangeY = maxY - minY || 1;

  const width = 100;
  const height = 50;
  const padding = 5;

  const pathPoints = puntos.map((y, i) => {
    const x = padding + (i / (puntos.length - 1)) * (width - 2 * padding);
    const yPos = height - padding - ((y - minY) / rangeY) * (height - 2 * padding);
    return `${i === 0 ? 'M' : 'L'} ${x} ${yPos}`;
  }).join(' ');

  const areaPath = pathPoints + ` L ${width - padding} ${height} L ${padding} ${height} Z`;
  const isPositive = acumulado >= 0;
  const yield_ = calcularYield(historial);
  const cuotaPromedio = calcularCuotaPromedio(historial);

  return (
    <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#00D1B2]" />
          Evolución de Rendimiento
        </h3>
        <span className={`font-mono font-bold text-lg ${isPositive ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
          {isPositive ? '+' : ''}{acumulado.toFixed(2)}u
        </span>
      </div>

      {/* Gráfico SVG */}
      <div className="h-32 mb-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? '#00D1B2' : '#EF4444'} stopOpacity="0.4" />
              <stop offset="100%" stopColor={isPositive ? '#00D1B2' : '#EF4444'} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {/* Línea de cero */}
          <line 
            x1={padding} 
            y1={height - padding - ((0 - minY) / rangeY) * (height - 2 * padding)} 
            x2={width - padding} 
            y2={height - padding - ((0 - minY) / rangeY) * (height - 2 * padding)} 
            stroke="#334155" 
            strokeDasharray="4,4" 
            strokeWidth="0.5"
          />
          {/* Área */}
          <path d={areaPath} fill="url(#areaGradient)" />
          {/* Línea */}
          <path 
            d={pathPoints} 
            fill="none" 
            stroke={isPositive ? '#00D1B2' : '#EF4444'} 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 6px ${isPositive ? '#00D1B2' : '#EF4444'})` }}
          />
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className={`text-xl font-bold font-mono ${yield_ >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {yield_ >= 0 ? '+' : ''}{Number(yield_ || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-[#64748B]">Yield</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold font-mono text-white">@{Number(cuotaPromedio || 0).toFixed(2)}</p>
          <p className="text-xs text-[#64748B]">Cuota Promedio</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold font-mono text-white">{apuestasResueltas.length}</p>
          <p className="text-xs text-[#64748B]">Apuestas</p>
        </div>
      </div>

      {/* Últimas apuestas */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-[#94A3B8] text-sm mb-2">Últimos resultados:</p>
        <div className="flex gap-1 flex-wrap">
          {historial.slice(0, 15).map((a, i) => (
            <span 
              key={i} 
              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                a.resultado === 'GANADA' ? 'bg-[#00D1B2]/20 text-[#00D1B2]' : 
                a.resultado === 'PERDIDA' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 
                'bg-[#F59E0B]/20 text-[#F59E0B]'
              }`}
            >
              {a.resultado === 'GANADA' ? '✓' : a.resultado === 'PERDIDA' ? '✗' : '○'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Historial de Apuestas (SIN COLUMNA GANANCIA)
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
              <th className="pb-3 text-center">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {mostradas.map((a, i) => {
              const e = estilos[a.resultado] || estilos.NULA;
              return (
                <tr key={a.id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-4 text-sm text-[#94A3B8]">{a.fecha}</td>
                  <td className="py-3 pr-4 text-sm text-white max-w-[250px] truncate">{a.apuesta}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-1 rounded-lg bg-[#334155] text-[#94A3B8]">
                      {a.tipo_mercado || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-center text-sm font-mono text-white">@{Number(a.cuota || 0).toFixed(2)}</td>
                  <td className="py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${e.bg}`}>
                      {e.icon}
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
            estadisticas: response.estadisticas,
            estrategia: response.estrategia,
            historial: (response.historial || []).map((h: any) => ({
              id: h.id,
              fecha: h.fecha,
              apuesta: h.apuesta,
              tipo_mercado: h.tipo_mercado,
              cuota: h.cuota,
              resultado: h.resultado,
            }))
          });
        } else {
          setError('No se pudo cargar el tipster');
        }
      } catch (err) {
        console.error('Error:', err);
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
  
  // Calcular métricas desde el historial
  const yield_ = calcularYield(historial);
  const rachaInfo = calcularRachaActual(historial);
  const mejorRacha = calcularMejorRacha(historial);
  const totalApuestasResueltas = historial.filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA').length;
  const winRate = totalApuestasResueltas > 0 ? (estadisticas.ganadas / totalApuestasResueltas) * 100 : 0;
  const isRentable = yield_ > 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tipsters" className="p-2 rounded-xl hover:bg-white/10 transition-all">
          <ChevronLeft className="h-6 w-6 text-[#94A3B8]" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Detalle del Tipster</h1>
      </div>

      {/* Alerta de Racha */}
      <AlertaRacha racha={rachaInfo.racha} tipo={rachaInfo.tipo} />

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
            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-[#00D1B2]/20 text-[#00D1B2] border border-[#00D1B2]/30">
              Rentable
            </span>
          )}
        </div>

        {/* Stats: Efectividad, Ganadas/Perdidas, Yield */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-[#0F172A]/50">
            <p className={`text-3xl font-bold font-mono ${winRate >= 60 ? 'text-[#00D1B2]' : winRate >= 50 ? 'text-[#FFDD57]' : 'text-[#EF4444]'}`}>
              {Number(winRate || 0).toFixed(1)}%
            </p>
            <p className="text-xs text-[#64748B] mt-1">Efectividad</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[#0F172A]/50">
            <p className="text-3xl font-bold font-mono">
              <span className="text-[#00D1B2]">{estadisticas.ganadas || 0}</span>
              <span className="text-[#64748B]"> ✅ </span>
              <span className="text-[#EF4444]">{estadisticas.perdidas || 0}</span>
              <span className="text-[#64748B]"> ❌</span>
            </p>
            <p className="text-xs text-[#64748B] mt-1">Resultados</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[#0F172A]/50">
            <p className={`text-3xl font-bold font-mono ${yield_ >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
              {yield_ >= 0 ? '+' : ''}{Number(yield_ || 0).toFixed(1)}%
            </p>
            <p className="text-xs text-[#64748B] mt-1">Yield</p>
          </div>
        </div>
      </div>

      {/* Análisis IA */}
      <AnalisisIA />

      {/* Comparación + Confianza */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ComparacionInversiones yield_={yield_} />
        <IndicadoresConfianza winRate={winRate} yield_={yield_} totalApuestas={totalApuestasResueltas} mejorRacha={mejorRacha} />
      </div>

      {/* Gráfico */}
      <GraficoEvolucion historial={historial} />

      {/* Historial */}
      <HistorialApuestas historial={historial} />
    </div>
  );
}
