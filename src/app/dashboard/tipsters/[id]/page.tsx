'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Target, Trophy, Zap, 
  Brain, Calendar, ChevronLeft, ChevronRight,
  DollarSign, Percent, Activity, AlertTriangle, Edit3, Check, X
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

// ==============================================================================
// CONFIGURACIÓN API
// ==============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://franciscoanalistadeportivo.pythonanywhere.com';

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
  emoji: string;
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
// ICONOS POR DEPORTE
// ==============================================================================

const ICONOS_DEPORTE: Record<string, string> = {
  'futbol': '⚽',
  'fútbol': '⚽',
  'baloncesto': '🏀',
  'basketball': '🏀',
  'nba': '🏀',
  'tenis': '🎾',
  'tennis': '🎾',
  'voleibol': '🏐',
  'volleyball': '🏐',
  'beisbol': '⚾',
  'baseball': '⚾',
  'hockey': '🏒',
  'default': '🎯'
};

const getIconoDeporte = (deporte: string): string => {
  const deporteLower = (deporte || '').toLowerCase();
  for (const [key, icon] of Object.entries(ICONOS_DEPORTE)) {
    if (deporteLower.includes(key)) return icon;
  }
  return ICONOS_DEPORTE.default;
};

// ==============================================================================
// CONSTANTES KELLY + RACHA
// ==============================================================================

const STAKES_KELLY = {
  euforia: { minRacha: 2, stake: 20592, emoji: '🔥', nombre: 'Euforia', color: '#22C55E', bg: 'from-green-500/20 to-green-600/10' },
  base: { minRacha: 0, stake: 15840, emoji: '⚖️', nombre: 'Base', color: '#3B82F6', bg: 'from-blue-500/20 to-blue-600/10' },
  seguridad: { minRacha: -2, stake: 12672, emoji: '⚠️', nombre: 'Seguridad', color: '#FFDD57', bg: 'from-yellow-500/20 to-yellow-600/10' },
  proteccion: { minRacha: -999, stake: 5000, emoji: '🛡️', nombre: 'Protección', color: '#EF4444', bg: 'from-red-500/20 to-red-600/10' },
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
// API FUNCTIONS
// ==============================================================================

const getBancaUsuario = async (token: string): Promise<number> => {
  try {
    const res = await fetch(`${API_URL}/api/usuario/banca`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return BANCA_BASE;
    const data = await res.json();
    return data.banca || BANCA_BASE;
  } catch {
    return BANCA_BASE;
  }
};

const updateBancaUsuario = async (token: string, banca: number): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/api/usuario/banca`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ banca })
    });
    return res.ok;
  } catch {
    return false;
  }
};

const getTipsterById = async (token: string, id: number): Promise<TipsterDetail | null> => {
  try {
    const res = await fetch(`${API_URL}/api/tipsters/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

// ==============================================================================
// COMPONENTE: CARD DE BANCA (HEADER)
// ==============================================================================

const BancaCard = ({ 
  banca, 
  onSave 
}: { 
  banca: number;
  onSave: (nuevaBanca: number) => void;
}) => {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(banca.toString());

  const handleGuardar = () => {
    const num = parseInt(valor.replace(/\D/g, '')) || BANCA_BASE;
    const bancaFinal = Math.min(Math.max(num, 10000), 100000000);
    onSave(bancaFinal);
    setEditando(false);
  };

  const handleCancelar = () => {
    setValor(banca.toString());
    setEditando(false);
  };

  const stakeInfo = calcularStakeKelly(0, banca);

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 
                    rounded-2xl p-4 border border-amber-500/30 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 
                          flex items-center justify-center shadow-lg shadow-amber-500/30">
            <DollarSign className="h-5 w-5 text-black" />
          </div>
          <div>
            <p className="text-xs text-amber-200/80 font-medium">Tu Banca Global</p>
            {editando ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={valor}
                  onChange={(e) => setValor(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-32 bg-black/30 border border-amber-500/50 rounded px-2 py-1 
                             text-amber-300 font-mono text-lg focus:outline-none focus:border-amber-400"
                  autoFocus
                />
                <button onClick={handleGuardar} className="p-1 text-green-400 hover:text-green-300">
                  <Check className="h-5 w-5" />
                </button>
                <button onClick={handleCancelar} className="p-1 text-red-400 hover:text-red-300">
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <p className="text-2xl font-bold text-amber-300 font-mono">
                {formatCurrency(banca)}
              </p>
            )}
          </div>
        </div>
        
        {!editando && (
          <button 
            onClick={() => setEditando(true)}
            className="p-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-amber-500/20">
        <p className="text-xs text-amber-200/60">
          🛡️ Stake Base: {formatCurrency(stakeInfo.stake)} | Máx 5% = {formatCurrency(banca * 0.05)}
        </p>
      </div>
    </div>
  );
};

// ==============================================================================
// COMPONENTE: RACHA BADGE (CON FUEGO)
// ==============================================================================

const RachaBadge = ({ racha, label }: { racha: number; label: string }) => {
  const isPositive = racha > 0;
  const isNeutral = racha === 0;
  
  const getBgClass = () => {
    if (racha >= 3) return 'from-amber-500/30 to-orange-500/20 border-amber-400/50';
    if (racha > 0) return 'from-green-500/30 to-emerald-500/20 border-green-400/50';
    if (racha === 0) return 'from-blue-500/30 to-cyan-500/20 border-blue-400/50';
    if (racha >= -2) return 'from-yellow-500/30 to-amber-500/20 border-yellow-400/50';
    return 'from-red-500/30 to-rose-500/20 border-red-400/50';
  };

  const getTextColor = () => {
    if (racha >= 3) return 'text-amber-300';
    if (racha > 0) return 'text-green-300';
    if (racha === 0) return 'text-blue-300';
    if (racha >= -2) return 'text-yellow-300';
    return 'text-red-300';
  };

  return (
    <div className={`px-5 py-3 rounded-2xl border bg-gradient-to-br ${getBgClass()} backdrop-blur-sm`}>
      <p className="text-xs font-medium text-white/70 text-center mb-1">{label}</p>
      <div className="flex items-center justify-center gap-1">
        {racha >= 2 && <span className="text-2xl animate-pulse">🔥</span>}
        <p className={`text-3xl font-bold font-mono ${getTextColor()}`}>
          {racha > 0 ? '+' : ''}{racha}
        </p>
        {racha >= 3 && <span className="text-2xl animate-pulse">🔥</span>}
      </div>
    </div>
  );
};

// ==============================================================================
// COMPONENTE: METRIC CARD
// ==============================================================================

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  className?: string;
}

const MetricCard = ({ icon, label, value, color = '#FFFFFF', className = '' }: MetricCardProps) => (
  <div className={`bg-[#1E293B] rounded-xl p-4 border border-[#334155] hover:border-[#00D1B2]/50 
                   transition-all duration-300 hover:scale-105 ${className}`}>
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 rounded-lg bg-[#0F172A]" style={{ color }}>
        {icon}
      </div>
      <span className="text-xs text-[#94A3B8] uppercase tracking-wide">{sanitizeInput(String(label))}</span>
    </div>
    <p className="text-2xl font-bold font-mono" style={{ color }}>
      {typeof value === 'number' ? value.toLocaleString() : sanitizeInput(String(value))}
    </p>
  </div>
);

// ==============================================================================
// COMPONENTE: CONSEJO IA (MEJORADO)
// ==============================================================================

const ConsejoIACard = ({ historial, tipsterNombre }: { historial: Apuesta[], tipsterNombre: string }) => {
  const consejo = useMemo((): ConsejoIA => {
    if (!historial || historial.length < 5) {
      return {
        mercadoMaestro: 'Analizando...',
        winRateMaestro: 0,
        mercadoEvitar: '-',
        winRateEvitar: 0,
        consejo: 'Necesitamos más datos para darte consejos personalizados',
        emoji: '🔍'
      };
    }

    const porMercado: Record<string, { ganadas: number; total: number }> = {};
    
    historial.forEach(ap => {
      const tipo = ap.tipo_mercado || 'GENERAL';
      if (tipo === 'SIN CLASIFICAR' || tipo === 'OTRO') return;
      if (!porMercado[tipo]) porMercado[tipo] = { ganadas: 0, total: 0 };
      porMercado[tipo].total++;
      if (ap.resultado === 'GANADA') porMercado[tipo].ganadas++;
    });

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
        mercadoMaestro: 'GENERAL',
        winRateMaestro: Math.round((historial.filter(a => a.resultado === 'GANADA').length / historial.filter(a => a.resultado !== 'PENDIENTE').length) * 100) || 0,
        mercadoEvitar: '-',
        winRateEvitar: 0,
        consejo: `${tipsterNombre} tiene un buen historial general`,
        emoji: '📊'
      };
    }

    const mejor = mercados[0];
    const peor = mercados[mercados.length - 1];

    const emojis = ['🎯', '💎', '🏆', '⚡', '🚀'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    let consejo = '';
    if (mejor.winRate >= 80) {
      consejo = `¡${tipsterNombre} es ÉLITE en ${mejor.mercado}! Momento ideal para seguir sus picks.`;
    } else if (mejor.winRate >= 65) {
      consejo = `${tipsterNombre} domina ${mejor.mercado}. Recomendado para tu próxima apuesta.`;
    } else {
      consejo = `${tipsterNombre} tiene mejor rendimiento en ${mejor.mercado}.`;
    }

    return {
      mercadoMaestro: mejor.mercado,
      winRateMaestro: mejor.winRate,
      mercadoEvitar: peor.mercado !== mejor.mercado && peor.winRate < 50 ? peor.mercado : '-',
      winRateEvitar: peor.winRate,
      consejo,
      emoji
    };
  }, [historial, tipsterNombre]);

  return (
    <div className="bg-gradient-to-br from-[#00D1B2]/20 via-[#0891B2]/10 to-[#1E293B] 
                    rounded-xl p-4 border border-[#00D1B2]/30 hover:border-[#00D1B2]/60 
                    transition-all duration-300">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-[#00D1B2]/20">
          <Brain className="h-4 w-4 text-[#00D1B2]" />
        </div>
        <span className="text-xs text-[#00D1B2] uppercase tracking-wide font-bold">Consejo IA</span>
        <span className="text-lg">{consejo.emoji}</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#94A3B8]">Especialidad</span>
          <span className="text-sm font-bold text-[#00D1B2]">
            {sanitizeInput(consejo.mercadoMaestro)} 
            <span className="ml-1 px-1.5 py-0.5 bg-[#00D1B2]/20 rounded text-xs">
              {consejo.winRateMaestro}%
            </span>
          </span>
        </div>
        
        {consejo.mercadoEvitar !== '-' && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Evitar</span>
            <span className="text-sm font-bold text-[#EF4444]">
              {sanitizeInput(consejo.mercadoEvitar)}
              <span className="ml-1 px-1.5 py-0.5 bg-[#EF4444]/20 rounded text-xs">
                {consejo.winRateEvitar}%
              </span>
            </span>
          </div>
        )}
        
        <p className="text-xs text-white/80 pt-2 border-t border-[#334155] leading-relaxed">
          💡 {sanitizeInput(consejo.consejo)}
        </p>
      </div>
    </div>
  );
};

// ==============================================================================
// COMPONENTE: GRÁFICO COMPACTO
// ==============================================================================

const GraficoRendimiento = ({ historial }: { historial: Apuesta[] }) => {
  const datos = useMemo(() => {
    if (!historial || historial.length === 0) return [];
    
    let acumulado = 0;
    return historial
      .filter(ap => ap.resultado !== 'PENDIENTE')
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
      <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#00D1B2]" />
          Rendimiento
        </h3>
        <p className="text-[#94A3B8] text-center py-4 text-sm">Más datos próximamente</p>
      </div>
    );
  }

  const isPositive = datos[datos.length - 1]?.ganancia >= 0;

  return (
    <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-[#00D1B2]" />
        Rendimiento Acumulado
      </h3>
      
      <div className="h-44">
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
              tick={{ fill: '#64748B', fontSize: 9 }}
              tickFormatter={(value) => value.split('/').slice(0, 2).join('/')}
            />
            <YAxis 
              stroke="#64748B"
              tick={{ fill: '#64748B', fontSize: 9 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              width={45}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1E293B', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '12px'
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
// COMPONENTE: SIMULADOR COMPACTO
// ==============================================================================

const SimuladorCompacto = ({ historial, banca }: { historial: Apuesta[], banca: number }) => {
  const simulacion = useMemo(() => {
    if (!historial || historial.length === 0) {
      return { ganancia: 0, balance: banca, rendimiento: 0, apuestas: 0 };
    }

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

  return (
    <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-[#FFDD57]" />
        Tu Simulación ({simulacion.apuestas} apuestas)
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0F172A] rounded-lg p-3">
          <p className="text-xs text-[#94A3B8]">Balance Final</p>
          <p className={`text-lg font-bold font-mono ${simulacion.balance >= banca ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {formatCurrency(simulacion.balance)}
          </p>
        </div>
        <div className="bg-[#0F172A] rounded-lg p-3">
          <p className="text-xs text-[#94A3B8]">Rendimiento</p>
          <p className={`text-lg font-bold font-mono ${simulacion.rendimiento >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {simulacion.rendimiento >= 0 ? '+' : ''}{simulacion.rendimiento.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// COMPONENTE: TABLA HISTORIAL
// ==============================================================================

const TablaHistorial = ({ historial, banca }: { historial: Apuesta[], banca: number }) => {
  const [filtro, setFiltro] = useState<'todos' | 'ganadas' | 'perdidas' | 'pendientes'>('todos');
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;

  const historialFiltrado = useMemo(() => {
    let filtered = historial;
    if (filtro === 'ganadas') filtered = historial.filter(a => a.resultado === 'GANADA');
    else if (filtro === 'perdidas') filtered = historial.filter(a => a.resultado === 'PERDIDA');
    else if (filtro === 'pendientes') filtered = historial.filter(a => a.resultado === 'PENDIENTE');
    return filtered;
  }, [historial, filtro]);

  const totalPaginas = Math.ceil(historialFiltrado.length / porPagina);
  const historialPaginado = historialFiltrado.slice((pagina - 1) * porPagina, pagina * porPagina);

  const getResultadoBadge = (resultado: string) => {
    switch (resultado) {
      case 'GANADA': return 'bg-[#00D1B2]/20 text-[#00D1B2] border-[#00D1B2]/30';
      case 'PERDIDA': return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30';
      default: return 'bg-[#FFDD57]/20 text-[#FFDD57] border-[#FFDD57]/30';
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#00D1B2]" />
          Historial ({historialFiltrado.length})
        </h3>
        
        <div className="flex gap-1 flex-wrap">
          {(['todos', 'ganadas', 'perdidas', 'pendientes'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFiltro(f); setPagina(1); }}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                filtro === f ? 'bg-[#00D1B2] text-white' : 'bg-[#0F172A] text-[#94A3B8] hover:bg-[#334155]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="pb-2 text-left text-xs font-semibold text-[#94A3B8]">Fecha</th>
              <th className="pb-2 text-left text-xs font-semibold text-[#94A3B8]">Apuesta</th>
              <th className="pb-2 text-left text-xs font-semibold text-[#94A3B8]">Cuota</th>
              <th className="pb-2 text-left text-xs font-semibold text-[#94A3B8]">Tipo</th>
              <th className="pb-2 text-left text-xs font-semibold text-[#94A3B8]">Resultado</th>
              <th className="pb-2 text-left text-xs font-semibold text-[#94A3B8]">Tu Ganancia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]/50">
            {historialPaginado.map((apuesta, index) => {
              const racha = apuesta.racha_actual || 0;
              const stakeInfo = calcularStakeKelly(racha, banca);
              const gananciaSimulada = apuesta.resultado === 'GANADA' 
                ? stakeInfo.stake * (sanitizeNumber(apuesta.cuota) - 1)
                : apuesta.resultado === 'PERDIDA' ? -stakeInfo.stake : 0;

              return (
                <tr key={index} className="hover:bg-[#0F172A]/50 transition-colors">
                  <td className="py-2 text-white font-mono text-xs">{sanitizeInput(apuesta.fecha)}</td>
                  <td className="py-2 text-white max-w-[200px]">
                    <span className="block truncate text-xs" title={apuesta.apuesta}>
                      {sanitizeInput(apuesta.apuesta)}
                    </span>
                  </td>
                  <td className="py-2 font-bold text-[#FFDD57] font-mono text-xs">
                    {sanitizeNumber(apuesta.cuota).toFixed(2)}
                  </td>
                  <td className="py-2">
                    <span className="px-1.5 py-0.5 rounded text-xs bg-[#0F172A] text-[#94A3B8]">
                      {sanitizeInput(apuesta.tipo_mercado || 'N/A')}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getResultadoBadge(apuesta.resultado)}`}>
                      {sanitizeInput(apuesta.resultado)}
                    </span>
                  </td>
                  <td className={`py-2 font-bold font-mono text-xs ${gananciaSimulada >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
                    {apuesta.resultado !== 'PENDIENTE' && (
                      <>{gananciaSimulada >= 0 ? '+' : ''}{formatCurrency(gananciaSimulada)}</>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#334155]">
          <button
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#0F172A] text-[#94A3B8] text-xs
                       hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3 w-3" /> Ant
          </button>
          <span className="text-xs text-[#94A3B8]">{pagina}/{totalPaginas}</span>
          <button
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#0F172A] text-[#94A3B8] text-xs
                       hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sig <ChevronRight className="h-3 w-3" />
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
  const [bancaUsuario, setBancaUsuario] = useState(BANCA_BASE);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = parseInt(tipsterId);
        if (isNaN(id) || id < 1 || id > 999999) {
          setError('ID de tipster inválido');
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem('token') || '';
        
        // Obtener banca del usuario
        const banca = await getBancaUsuario(token);
        setBancaUsuario(banca);

        // Obtener datos del tipster
        const tipsterData = await getTipsterById(token, id);
        if (!tipsterData) {
          setError('Tipster no encontrado');
          setIsLoading(false);
          return;
        }
        
        setData(tipsterData);
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };

    if (tipsterId) fetchData();
  }, [tipsterId]);

  const handleSaveBanca = async (nuevaBanca: number) => {
    const token = localStorage.getItem('token') || '';
    const success = await updateBancaUsuario(token, nuevaBanca);
    if (success) {
      setBancaUsuario(nuevaBanca);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-10 w-10 text-[#EF4444] mx-auto mb-4" />
        <p className="text-[#94A3B8]">{error || 'Tipster no encontrado'}</p>
        <Link href="/dashboard/tipsters" className="text-[#00D1B2] hover:underline mt-4 inline-block text-sm">
          Volver a tipsters
        </Link>
      </div>
    );
  }

  const { tipster, estadisticas, historial } = data;
  const iconoDeporte = getIconoDeporte(tipster.deporte);

  return (
    <div className="space-y-4 pb-8">
      {/* Back */}
      <Link href="/dashboard/tipsters" className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white text-sm">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      {/* Header con Banca */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Info Tipster */}
        <div className="lg:col-span-2 bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-xl p-5 border border-[#334155]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00D1B2] to-[#0891B2] 
                            flex items-center justify-center text-3xl shadow-lg shadow-[#00D1B2]/20">
              {iconoDeporte}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{sanitizeInput(tipster.alias)}</h1>
              <span className="px-2 py-0.5 bg-[#0F172A] text-[#94A3B8] rounded text-xs border border-[#334155]">
                {sanitizeInput(tipster.deporte)}
              </span>
            </div>
            <div className="flex gap-3">
              <RachaBadge racha={estadisticas.racha_actual || 0} label="Racha" />
              <RachaBadge racha={estadisticas.mejor_racha || 0} label="Mejor" />
            </div>
          </div>
        </div>

        {/* Card Banca */}
        <BancaCard banca={bancaUsuario} onSave={handleSaveBanca} />
      </div>

      {/* Métricas + Consejo IA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard icon={<Target className="h-4 w-4" />} label="Total" value={estadisticas.total_apuestas} />
        <MetricCard icon={<TrendingUp className="h-4 w-4" />} label="Ganadas" value={estadisticas.ganadas} color="#00D1B2" />
        <MetricCard icon={<TrendingDown className="h-4 w-4" />} label="Perdidas" value={estadisticas.perdidas} color="#EF4444" />
        <MetricCard icon={<Percent className="h-4 w-4" />} label="Acierto" value={`${estadisticas.porcentaje_acierto}%`} color="#3B82F6" />
        <MetricCard 
          icon={<Zap className="h-4 w-4" />} 
          label="Ganancia" 
          value={formatCurrency(estadisticas.ganancia_total)} 
          color={estadisticas.ganancia_total >= 0 ? '#00D1B2' : '#EF4444'} 
        />
        <ConsejoIACard historial={historial} tipsterNombre={tipster.alias} />
      </div>

      {/* Gráfico + Simulador */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GraficoRendimiento historial={historial} />
        <SimuladorCompacto historial={historial} banca={bancaUsuario} />
      </div>

      {/* Tabla */}
      <TablaHistorial historial={historial} banca={bancaUsuario} />
    </div>
  );
}
