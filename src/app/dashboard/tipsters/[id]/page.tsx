'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Target, Zap, 
  Brain, Calendar, ChevronLeft, ChevronRight,
  DollarSign, Percent, Activity, AlertTriangle, Edit3, Check, X, Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { tipstersAPI, bancaAPI, consejoIAAPI } from '@/lib/api';

// ==============================================================================
// TIPOS E INTERFACES
// ==============================================================================

interface TipsterDetail {
  tipster: { id: number; alias: string; deporte: string; };
  estadisticas: {
    total_apuestas: number; ganadas: number; perdidas: number;
    porcentaje_acierto: number; ganancia_total: number;
    mejor_racha: number; racha_actual: number;
  };
  historial: Apuesta[];
  estrategia?: EstrategiaTipster; // NUEVO: Estrategia del tipster
}

interface Apuesta {
  fecha: string; apuesta: string; cuota: number;
  stake_tipster: number; stake_ia: number; resultado: string;
  ganancia_neta: number; filtro_claude: string; analisis: string;
  tipo_mercado?: string; racha_actual?: number;
}

// NUEVO: Interface para estrategia
interface EstrategiaTipster {
  estrategia_activa: 'NINGUNA' | 'PORCENTAJE_FIJO' | 'CONSERVADOR' | 'RACHAS' | 'HIBRIDA' | 'KELLY';
  win_rate: number;
  cuota_promedio: number;
  banca_inicial: number;
  stake_minimo: number;
  stake_maximo: number;
  porcentaje_kelly: number;
}

// ==============================================================================
// UTILIDADES
// ==============================================================================

const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.replace(/[<>]/g, '').slice(0, 500);
};

const sanitizeNumber = (value: unknown): number => {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.max(-999999999, Math.min(999999999, num));
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(sanitizeNumber(value));
};

const ICONOS_DEPORTE: Record<string, string> = {
  'futbol': '⚽', 'fútbol': '⚽', 'baloncesto': '🏀', 'basketball': '🏀',
  'nba': '🏀', 'tenis': '🎾', 'tennis': '🎾', 'default': '🎯'
};

const getIconoDeporte = (deporte: string): string => {
  const d = (deporte || '').toLowerCase();
  for (const [key, icon] of Object.entries(ICONOS_DEPORTE)) {
    if (d.includes(key)) return icon;
  }
  return ICONOS_DEPORTE.default;
};

// ==============================================================================
// 🎰 ESTRATEGIAS DE STAKE - SEGÚN DOCUMENTACIÓN V4
// ==============================================================================

const BANCA_BASE = 300000; // Banca por defecto en CLP

// ----------------------------------------
// ESTRATEGIA 1: RACHAS (Stakes Fijos)
// ----------------------------------------
const calcularStakeRachas = (racha: number, banca: number): number => {
  const factor = banca / BANCA_BASE;
  let stake: number;
  
  if (racha >= 4) stake = 5000;
  else if (racha === 3) stake = 4000;
  else if (racha === 2) stake = 3000;
  else if (racha === 1) stake = 2000;
  else if (racha >= -1) stake = 2000; // 0 o -1
  else stake = 1000; // <= -2
  
  return Math.round(stake * factor);
};

// ----------------------------------------
// ESTRATEGIA 2: PORCENTAJE FIJO (1% de banca)
// ----------------------------------------
const calcularStakePorcentajeFijo = (banca: number, porcentaje: number = 0.01): number => {
  return Math.round(banca * porcentaje);
};

// ----------------------------------------
// ESTRATEGIA 3: CONSERVADOR (1.5% base + ajustes)
// ----------------------------------------
const calcularStakeConservador = (racha: number, banca: number): number => {
  const base = banca * 0.015; // 1.5% base
  let multiplicador: number;
  
  if (racha >= 3) multiplicador = 1.5;
  else if (racha === 2) multiplicador = 1.3;
  else if (racha === 1) multiplicador = 1.1;
  else if (racha >= -1) multiplicador = 1.0;
  else multiplicador = 0.7; // <= -2
  
  return Math.round(base * multiplicador);
};

// ----------------------------------------
// ESTRATEGIA 4: KELLY CRITERION
// ----------------------------------------
const calcularStakeKelly = (
  racha: number, 
  banca: number, 
  cuota: number,
  winRate: number,
  porcentajeKelly: number = 0.4
): number => {
  // Kelly = (p * b - q) / b donde p=winRate, q=1-p, b=cuota-1
  const p = winRate / 100;
  const q = 1 - p;
  const b = cuota - 1;
  
  let kelly = (p * b - q) / b;
  kelly = Math.max(0, kelly); // No apostar si Kelly negativo
  
  const stakeBase = banca * kelly * porcentajeKelly;
  
  // Ajuste por racha
  let multRacha: number;
  if (racha >= 3) multRacha = 1.5;
  else if (racha === 2) multRacha = 1.3;
  else if (racha === 1) multRacha = 1.1;
  else if (racha >= -1) multRacha = 1.0;
  else multRacha = 0.5;
  
  return Math.round(stakeBase * multRacha);
};

// ----------------------------------------
// ESTRATEGIA 5: HÍBRIDA OPTIMIZADA (La más rentable)
// ----------------------------------------
const calcularStakeHibrida = (
  racha: number,
  banca: number,
  cuota: number,
  winRate: number,
  tipoMercado?: string,
  porcentajeKelly: number = 0.4
): number => {
  // 1. Base Kelly
  const p = winRate / 100;
  const q = 1 - p;
  const b = cuota - 1;
  
  let kelly = (p * b - q) / b;
  kelly = Math.max(0, kelly);
  
  const base = banca * kelly * porcentajeKelly;
  
  // 2. Multiplicador por RACHA
  let multRacha: number;
  if (racha >= 3) multRacha = 1.8;
  else if (racha === 2) multRacha = 1.4;
  else if (racha === 1) multRacha = 1.2;
  else if (racha === 0) multRacha = 1.0;
  else if (racha === -1) multRacha = 0.7;
  else multRacha = 0.5; // <= -2
  
  // 3. Multiplicador por CUOTA
  let multCuota: number;
  if (cuota >= 1.60 && cuota <= 1.70) multCuota = 1.2; // Zona oro
  else if (cuota >= 1.86 && cuota <= 2.00) multCuota = 1.0;
  else if (cuota >= 1.71 && cuota <= 1.85) multCuota = 0.8; // Cuidado
  else if (cuota > 2.00) multCuota = 0.6; // Alto riesgo
  else multCuota = 1.0;
  
  // 4. Multiplicador por MERCADO (si disponible)
  let multMercado = 1.0;
  if (tipoMercado) {
    const mercado = tipoMercado.toUpperCase();
    if (mercado.includes('UNDER')) multMercado = 1.3; // >70% WR típico
    else if (mercado.includes('GANADOR') || mercado === 'NBA') multMercado = 0.0; // NO APOSTAR
    else if (mercado.includes('OVER')) multMercado = 0.8;
  }
  
  const stake = base * multRacha * multCuota * multMercado;
  
  // Límites
  const minimo = banca * 0.005; // 0.5%
  const maximo = banca * 0.05;  // 5%
  
  return Math.round(Math.max(minimo, Math.min(maximo, stake)));
};

// ----------------------------------------
// FUNCIÓN PRINCIPAL: Seleccionar estrategia
// ----------------------------------------
const calcularStakeSegunEstrategia = (
  estrategia: string,
  racha: number,
  banca: number,
  cuota: number,
  winRate: number = 60,
  tipoMercado?: string,
  porcentajeKelly: number = 0.4
): { stake: number; emoji: string; nombre: string; color: string } => {
  
  let stake: number;
  let emoji: string;
  let nombre: string;
  let color: string;
  
  switch (estrategia) {
    case 'RACHAS':
      stake = calcularStakeRachas(racha, banca);
      emoji = racha >= 3 ? '🔥' : racha >= 1 ? '📈' : racha >= -1 ? '⚖️' : '🛡️';
      nombre = 'Rachas';
      color = racha >= 2 ? '#22C55E' : racha >= 0 ? '#3B82F6' : '#EF4444';
      break;
      
    case 'PORCENTAJE_FIJO':
      stake = calcularStakePorcentajeFijo(banca, 0.01);
      emoji = '📊';
      nombre = 'Fijo 1%';
      color = '#6366F1';
      break;
      
    case 'CONSERVADOR':
      stake = calcularStakeConservador(racha, banca);
      emoji = '🛡️';
      nombre = 'Conservador';
      color = '#10B981';
      break;
      
    case 'KELLY':
      stake = calcularStakeKelly(racha, banca, cuota, winRate, porcentajeKelly);
      emoji = '🎯';
      nombre = 'Kelly';
      color = '#F59E0B';
      break;
      
    case 'HIBRIDA':
      stake = calcularStakeHibrida(racha, banca, cuota, winRate, tipoMercado, porcentajeKelly);
      emoji = '🏆';
      nombre = 'Híbrida';
      color = '#8B5CF6';
      break;
      
    case 'NINGUNA':
    default:
      stake = 0;
      emoji = '⛔';
      nombre = 'Sin estrategia';
      color = '#6B7280';
      break;
  }
  
  return { stake, emoji, nombre, color };
};

// ==============================================================================
// CALCULAR GANANCIA SIMULADA (USA ESTRATEGIA DEL TIPSTER)
// ==============================================================================

const calcularGananciaSimulada = (
  historial: Apuesta[], 
  banca: number,
  estrategia: EstrategiaTipster | undefined
): { gananciaTotal: number; balanceFinal: number; rendimiento: number } => {
  
  if (!historial || historial.length === 0 || !estrategia) {
    return { gananciaTotal: 0, balanceFinal: banca, rendimiento: 0 };
  }
  
  let gananciaTotal = 0;
  let racha = 0;
  const estrategiaActiva = estrategia.estrategia_activa || 'RACHAS';
  const winRate = estrategia.win_rate || 60;
  const porcentajeKelly = estrategia.porcentaje_kelly || 0.4;
  
  // Procesar en orden cronológico
  const historialOrdenado = [...historial].reverse();
  
  historialOrdenado.forEach(ap => {
    if (ap.resultado === 'PENDIENTE') return;
    
    const cuota = sanitizeNumber(ap.cuota);
    const tipoMercado = ap.tipo_mercado;
    
    const { stake } = calcularStakeSegunEstrategia(
      estrategiaActiva,
      racha,
      banca,
      cuota,
      winRate,
      tipoMercado,
      porcentajeKelly
    );
    
    if (ap.resultado === 'GANADA') {
      gananciaTotal += stake * (cuota - 1);
      racha = racha >= 0 ? racha + 1 : 1;
    } else if (ap.resultado === 'PERDIDA') {
      gananciaTotal -= stake;
      racha = racha <= 0 ? racha - 1 : -1;
    }
  });
  
  const balanceFinal = banca + gananciaTotal;
  const rendimiento = (gananciaTotal / banca) * 100;
  
  return { gananciaTotal, balanceFinal, rendimiento };
};

// ==============================================================================
// COMPONENTES
// ==============================================================================

const BancaCard = ({ banca, onSave }: { banca: number; onSave: (b: number) => void }) => {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(banca.toString());

  const handleGuardar = () => {
    const num = parseInt(valor.replace(/\D/g, '')) || BANCA_BASE;
    onSave(Math.min(Math.max(num, 10000), 100000000));
    setEditando(false);
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 rounded-2xl p-4 border border-amber-500/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-black" />
          </div>
          <div>
            <p className="text-xs text-amber-200/80">Tu Banca Global</p>
            {editando ? (
              <div className="flex items-center gap-2">
                <input type="text" value={valor} onChange={(e) => setValor(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-32 bg-black/30 border border-amber-500/50 rounded px-2 py-1 text-amber-300 font-mono" autoFocus />
                <button onClick={handleGuardar} className="p-1 text-green-400"><Check className="h-5 w-5" /></button>
                <button onClick={() => { setValor(banca.toString()); setEditando(false); }} className="p-1 text-red-400"><X className="h-5 w-5" /></button>
              </div>
            ) : (
              <p className="text-2xl font-bold text-amber-300 font-mono">{formatCurrency(banca)}</p>
            )}
          </div>
        </div>
        {!editando && <button onClick={() => setEditando(true)} className="p-2 rounded-lg bg-amber-500/20 text-amber-300"><Edit3 className="h-4 w-4" /></button>}
      </div>
    </div>
  );
};

// NUEVO: Badge de estrategia
const EstrategiaBadge = ({ estrategia }: { estrategia: string }) => {
  const config: Record<string, { emoji: string; color: string; bg: string }> = {
    'RACHAS': { emoji: '📊', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
    'HIBRIDA': { emoji: '🏆', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
    'KELLY': { emoji: '🎯', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
    'CONSERVADOR': { emoji: '🛡️', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
    'PORCENTAJE_FIJO': { emoji: '📈', color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/30' },
    'NINGUNA': { emoji: '⛔', color: 'text-gray-400', bg: 'bg-gray-500/20 border-gray-500/30' },
  };
  
  const c = config[estrategia] || config['NINGUNA'];
  
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${c.bg} ${c.color}`}>
      {c.emoji} {estrategia}
    </span>
  );
};

const RachaBadge = ({ racha, label }: { racha: number; label: string }) => {
  const bg = racha >= 3 ? 'from-amber-500/30 border-amber-400/50' : racha > 0 ? 'from-green-500/30 border-green-400/50' : racha === 0 ? 'from-blue-500/30 border-blue-400/50' : racha >= -2 ? 'from-yellow-500/30 border-yellow-400/50' : 'from-red-500/30 border-red-400/50';
  const text = racha >= 3 ? 'text-amber-300' : racha > 0 ? 'text-green-300' : racha === 0 ? 'text-blue-300' : racha >= -2 ? 'text-yellow-300' : 'text-red-300';
  const emoji = racha >= 3 ? '🔥' : racha > 0 ? '🔥' : racha === 0 ? '⚖️' : '❄️';
  return (
    <div className={`bg-gradient-to-b ${bg} rounded-xl px-4 py-2 text-center border`}>
      <p className="text-[10px] text-[#94A3B8] uppercase">{label}</p>
      <p className={`text-xl font-bold ${text}`}>{emoji} {racha > 0 ? `+${racha}` : racha}</p>
    </div>
  );
};

const MetricCard = ({ icon, label, value, color, subtext }: { icon: React.ReactNode; label: string; value: string | number; color?: string; subtext?: string }) => (
  <div className="bg-[#1E293B] rounded-xl p-3 border border-[#334155]">
    <div className="flex items-center gap-2 mb-1">
      <span style={{ color: color || '#94A3B8' }}>{icon}</span>
      <span className="text-[10px] text-[#94A3B8] uppercase">{label}</span>
    </div>
    <p className="text-lg font-bold" style={{ color: color || 'white' }}>{value}</p>
    {subtext && <p className="text-[10px] text-[#64748B]">{subtext}</p>}
  </div>
);

// NUEVO: Simulador mejorado con estrategia
const SimuladorConEstrategia = ({ 
  historial, 
  banca, 
  estrategia 
}: { 
  historial: Apuesta[]; 
  banca: number; 
  estrategia: EstrategiaTipster | undefined;
}) => {
  const resultado = useMemo(() => 
    calcularGananciaSimulada(historial, banca, estrategia),
    [historial, banca, estrategia]
  );
  
  const apuestasResueltas = historial.filter(a => a.resultado !== 'PENDIENTE').length;
  const estrategiaActiva = estrategia?.estrategia_activa || 'RACHAS';
  
  return (
    <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[#00D1B2]" />
          Simulación ({apuestasResueltas} apuestas)
        </h3>
        <EstrategiaBadge estrategia={estrategiaActiva} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[#94A3B8]">Balance</p>
          <p className={`text-2xl font-bold font-mono ${resultado.balanceFinal >= banca ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {formatCurrency(resultado.balanceFinal)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8]">Rendimiento</p>
          <p className={`text-2xl font-bold font-mono ${resultado.rendimiento >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {resultado.rendimiento >= 0 ? '+' : ''}{resultado.rendimiento.toFixed(1)}%
          </p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-[#334155]">
        <div className="flex justify-between text-xs">
          <span className="text-[#94A3B8]">Ganancia/Pérdida:</span>
          <span className={resultado.gananciaTotal >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}>
            {resultado.gananciaTotal >= 0 ? '+' : ''}{formatCurrency(resultado.gananciaTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};

const GraficoRendimiento = ({ historial, banca, estrategia }: { historial: Apuesta[]; banca: number; estrategia: EstrategiaTipster | undefined }) => {
  const datos = useMemo(() => {
    if (!historial?.length || !estrategia) return [];
    
    let balance = 0;
    let racha = 0;
    const estrategiaActiva = estrategia.estrategia_activa || 'RACHAS';
    const winRate = estrategia.win_rate || 60;
    
    return [...historial].reverse()
      .filter(a => a.resultado !== 'PENDIENTE')
      .map((ap, i) => {
        const cuota = sanitizeNumber(ap.cuota);
        const { stake } = calcularStakeSegunEstrategia(estrategiaActiva, racha, banca, cuota, winRate, ap.tipo_mercado);
        
        if (ap.resultado === 'GANADA') {
          balance += stake * (cuota - 1);
          racha = racha >= 0 ? racha + 1 : 1;
        } else {
          balance -= stake;
          racha = racha <= 0 ? racha - 1 : -1;
        }
        
        return { name: ap.fecha, balance: Math.round(balance), index: i + 1 };
      });
  }, [historial, banca, estrategia]);

  if (datos.length === 0) return null;

  return (
    <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
      <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-[#00D1B2]" />
        Rendimiento
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datos}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D1B2" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00D1B2" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
              formatter={(value: number) => [formatCurrency(value), 'Balance']}
            />
            <Area type="monotone" dataKey="balance" stroke="#00D1B2" fillOpacity={1} fill="url(#colorBalance)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ConsejoIACard = ({ tipsterId }: { tipsterId: number }) => {
  const [consejo, setConsejo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchConsejo = async () => {
      try {
        const data = await consejoIAAPI.get(tipsterId);
        setConsejo(data.consejo || 'No hay consejo disponible');
      } catch { setConsejo('Error al cargar consejo'); }
      finally { setLoading(false); }
    };
    fetchConsejo();
  }, [tipsterId]);
  
  return (
    <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-3 border border-purple-500/30 col-span-2 sm:col-span-1">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-4 w-4 text-purple-400" />
        <span className="text-xs font-bold text-purple-300">CONSEJO IA</span>
      </div>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
      ) : (
        <p className="text-xs text-[#94A3B8] line-clamp-4">{consejo}</p>
      )}
    </div>
  );
};

const TablaHistorial = ({ historial, banca, estrategia }: { historial: Apuesta[]; banca: number; estrategia: EstrategiaTipster | undefined }) => {
  const [filtro, setFiltro] = useState<'todos' | 'ganadas' | 'perdidas' | 'pendientes'>('todos');
  const [pagina, setPagina] = useState(1);
  const porPag = 10;
  
  const estrategiaActiva = estrategia?.estrategia_activa || 'RACHAS';
  const winRate = estrategia?.win_rate || 60;

  const filtrado = useMemo(() => {
    if (filtro === 'ganadas') return historial.filter(a => a.resultado === 'GANADA');
    if (filtro === 'perdidas') return historial.filter(a => a.resultado === 'PERDIDA');
    if (filtro === 'pendientes') return historial.filter(a => a.resultado === 'PENDIENTE');
    return historial;
  }, [historial, filtro]);
  
  const totalPags = Math.ceil(filtrado.length / porPag);
  const paginado = filtrado.slice((pagina - 1) * porPag, pagina * porPag);
  
  const badge = (r: string) => r === 'GANADA' ? 'bg-[#00D1B2]/20 text-[#00D1B2] border-[#00D1B2]/30' : r === 'PERDIDA' ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30' : 'bg-[#FFDD57]/20 text-[#FFDD57] border-[#FFDD57]/30';
  
  return (
    <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#00D1B2]" />
          Historial ({filtrado.length})
        </h3>
        <div className="flex gap-1">
          {(['todos','ganadas','perdidas','pendientes'] as const).map(f => (
            <button key={f} onClick={() => { setFiltro(f); setPagina(1); }} className={`px-2 py-1 rounded text-xs ${filtro === f ? 'bg-[#00D1B2] text-white' : 'bg-[#0F172A] text-[#94A3B8]'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#334155]">
            <th className="pb-2 text-left text-xs text-[#94A3B8]">Fecha</th>
            <th className="pb-2 text-left text-xs text-[#94A3B8]">Apuesta</th>
            <th className="pb-2 text-left text-xs text-[#94A3B8]">Cuota</th>
            <th className="pb-2 text-left text-xs text-[#94A3B8]">Tipo</th>
            <th className="pb-2 text-left text-xs text-[#94A3B8]">Resultado</th>
            <th className="pb-2 text-left text-xs text-[#94A3B8]">Tu Ganancia</th>
          </tr></thead>
          <tbody className="divide-y divide-[#334155]/50">
            {paginado.map((ap, i) => {
              const cuota = sanitizeNumber(ap.cuota);
              const { stake } = calcularStakeSegunEstrategia(
                estrategiaActiva,
                ap.racha_actual || 0,
                banca,
                cuota,
                winRate,
                ap.tipo_mercado
              );
              const gan = ap.resultado === 'GANADA' ? stake * (cuota - 1) : ap.resultado === 'PERDIDA' ? -stake : 0;
              return (
                <tr key={i} className="hover:bg-[#0F172A]/50">
                  <td className="py-2 text-white font-mono text-xs">{sanitizeInput(ap.fecha)}</td>
                  <td className="py-2 text-white max-w-[200px]"><span className="block truncate text-xs">{sanitizeInput(ap.apuesta)}</span></td>
                  <td className="py-2 font-bold text-[#FFDD57] font-mono text-xs">{cuota.toFixed(2)}</td>
                  <td className="py-2"><span className="px-1.5 py-0.5 rounded text-xs bg-[#0F172A] text-[#94A3B8]">{sanitizeInput(ap.tipo_mercado || 'N/A')}</span></td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${badge(ap.resultado)}`}>{ap.resultado}</span></td>
                  <td className={`py-2 font-bold font-mono text-xs ${gan >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>{ap.resultado !== 'PENDIENTE' && <>{gan >= 0 ? '+' : ''}{formatCurrency(gan)}</>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPags > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#334155]">
          <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} className="flex items-center gap-1 px-2 py-1 rounded bg-[#0F172A] text-[#94A3B8] text-xs disabled:opacity-50"><ChevronLeft className="h-3 w-3" />Ant</button>
          <span className="text-xs text-[#94A3B8]">{pagina}/{totalPags}</span>
          <button onClick={() => setPagina(p => Math.min(totalPags, p + 1))} disabled={pagina === totalPags} className="flex items-center gap-1 px-2 py-1 rounded bg-[#0F172A] text-[#94A3B8] text-xs disabled:opacity-50">Sig<ChevronRight className="h-3 w-3" /></button>
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

  // Calcular ganancia simulada basada en banca del cliente Y ESTRATEGIA DEL TIPSTER
  const resultadoSimulacion = useMemo(() => {
    if (!data) return { gananciaTotal: 0, balanceFinal: bancaUsuario, rendimiento: 0 };
    return calcularGananciaSimulada(data.historial, bancaUsuario, data.estrategia);
  }, [data, bancaUsuario]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = parseInt(tipsterId);
        if (isNaN(id) || id < 1) { setError('ID inválido'); setIsLoading(false); return; }

        try {
          const bancaData = await bancaAPI.get();
          setBancaUsuario(bancaData.banca || BANCA_BASE);
        } catch { setBancaUsuario(BANCA_BASE); }

        const tipsterData = await tipstersAPI.getById(id);
        if (!tipsterData) { setError('Tipster no encontrado'); setIsLoading(false); return; }
        setData(tipsterData);
      } catch (err) {
        console.error('Error:', err);
        setError('Tipster no encontrado');
      } finally { setIsLoading(false); }
    };
    if (tipsterId) fetchData();
  }, [tipsterId]);

  const handleSaveBanca = async (nuevaBanca: number) => {
    try {
      await bancaAPI.update(nuevaBanca);
      setBancaUsuario(nuevaBanca);
    } catch (err) { console.error('Error:', err); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div></div>;

  if (error || !data) return (
    <div className="text-center py-12">
      <AlertTriangle className="h-10 w-10 text-[#EF4444] mx-auto mb-4" />
      <p className="text-[#94A3B8]">{error || 'Tipster no encontrado'}</p>
      <Link href="/dashboard/tipsters" className="text-[#00D1B2] hover:underline mt-4 inline-block text-sm">Volver a tipsters</Link>
    </div>
  );

  const { tipster, estadisticas, historial, estrategia } = data;

  return (
    <div className="space-y-4 pb-8">
      <Link href="/dashboard/tipsters" className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white text-sm"><ArrowLeft className="h-4 w-4" />Volver</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-xl p-5 border border-[#334155]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00D1B2] to-[#0891B2] flex items-center justify-center text-3xl">{getIconoDeporte(tipster.deporte)}</div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{sanitizeInput(tipster.alias)}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-[#0F172A] text-[#94A3B8] rounded text-xs border border-[#334155]">{sanitizeInput(tipster.deporte)}</span>
                {estrategia && <EstrategiaBadge estrategia={estrategia.estrategia_activa} />}
              </div>
            </div>
            <div className="flex gap-3">
              <RachaBadge racha={estadisticas.racha_actual || 0} label="Racha" />
              <RachaBadge racha={estadisticas.mejor_racha || 0} label="Mejor" />
            </div>
          </div>
        </div>
        <BancaCard banca={bancaUsuario} onSave={handleSaveBanca} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard icon={<Target className="h-4 w-4" />} label="Total" value={estadisticas.total_apuestas} />
        <MetricCard icon={<TrendingUp className="h-4 w-4" />} label="Ganadas" value={estadisticas.ganadas} color="#00D1B2" />
        <MetricCard icon={<TrendingDown className="h-4 w-4" />} label="Perdidas" value={estadisticas.perdidas} color="#EF4444" />
        <MetricCard icon={<Percent className="h-4 w-4" />} label="Acierto" value={`${estadisticas.porcentaje_acierto}%`} color="#3B82F6" />
        {/* GANANCIA USA ESTRATEGIA DEL TIPSTER */}
        <MetricCard 
          icon={<Zap className="h-4 w-4" />} 
          label="Tu Ganancia" 
          value={formatCurrency(resultadoSimulacion.gananciaTotal)} 
          color={resultadoSimulacion.gananciaTotal >= 0 ? '#00D1B2' : '#EF4444'} 
          subtext={`Estrategia: ${estrategia?.estrategia_activa || 'RACHAS'}`}
        />
        <ConsejoIACard tipsterId={parseInt(tipsterId)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GraficoRendimiento historial={historial} banca={bancaUsuario} estrategia={estrategia} />
        <SimuladorConEstrategia historial={historial} banca={bancaUsuario} estrategia={estrategia} />
      </div>

      <TablaHistorial historial={historial} banca={bancaUsuario} estrategia={estrategia} />
    </div>
  );
}
