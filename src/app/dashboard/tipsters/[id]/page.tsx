'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Target, Zap, 
  Brain, Calendar, ChevronLeft, ChevronRight,
  DollarSign, Percent, Activity, AlertTriangle, Edit3, Check, X
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { tipstersAPI, bancaAPI } from '@/lib/api';

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
}

interface Apuesta {
  fecha: string; apuesta: string; cuota: number;
  stake_tipster: number; stake_ia: number; resultado: string;
  ganancia_neta: number; filtro_claude: string; analisis: string;
  tipo_mercado?: string; racha_actual?: number;
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
// CONSTANTES KELLY
// ==============================================================================

const STAKES_KELLY = {
  euforia: { stake: 20592, emoji: '🔥', nombre: 'Euforia', color: '#22C55E' },
  base: { stake: 15840, emoji: '⚖️', nombre: 'Base', color: '#3B82F6' },
  seguridad: { stake: 12672, emoji: '⚠️', nombre: 'Seguridad', color: '#FFDD57' },
  proteccion: { stake: 5000, emoji: '🛡️', nombre: 'Protección', color: '#EF4444' },
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

const RachaBadge = ({ racha, label }: { racha: number; label: string }) => {
  const bg = racha >= 3 ? 'from-amber-500/30 border-amber-400/50' : racha > 0 ? 'from-green-500/30 border-green-400/50' : racha === 0 ? 'from-blue-500/30 border-blue-400/50' : racha >= -2 ? 'from-yellow-500/30 border-yellow-400/50' : 'from-red-500/30 border-red-400/50';
  const text = racha >= 3 ? 'text-amber-300' : racha > 0 ? 'text-green-300' : racha === 0 ? 'text-blue-300' : racha >= -2 ? 'text-yellow-300' : 'text-red-300';
  return (
    <div className={`px-5 py-3 rounded-2xl border bg-gradient-to-br ${bg}`}>
      <p className="text-xs text-white/70 text-center mb-1">{label}</p>
      <div className="flex items-center justify-center gap-1">
        {racha >= 2 && <span className="text-2xl animate-pulse">🔥</span>}
        <p className={`text-3xl font-bold font-mono ${text}`}>{racha > 0 ? '+' : ''}{racha}</p>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, color = '#FFF' }: { icon: React.ReactNode; label: string; value: string | number; color?: string }) => (
  <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155] hover:border-[#00D1B2]/50 transition-all">
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 rounded-lg bg-[#0F172A]" style={{ color }}>{icon}</div>
      <span className="text-xs text-[#94A3B8] uppercase">{label}</span>
    </div>
    <p className="text-2xl font-bold font-mono" style={{ color }}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
  </div>
);

const ConsejoIACard = ({ historial, tipsterNombre }: { historial: Apuesta[]; tipsterNombre: string }) => {
  const consejo = useMemo(() => {
    if (!historial || historial.length < 5) return { mercado: 'Analizando...', winRate: 0, consejo: 'Necesitamos más datos', emoji: '🔍' };
    const porMercado: Record<string, { g: number; t: number }> = {};
    historial.forEach(ap => {
      const tipo = ap.tipo_mercado || 'GENERAL';
      if (!porMercado[tipo]) porMercado[tipo] = { g: 0, t: 0 };
      porMercado[tipo].t++;
      if (ap.resultado === 'GANADA') porMercado[tipo].g++;
    });
    const mercados = Object.entries(porMercado).filter(([_, s]) => s.t >= 3).map(([m, s]) => ({ m, wr: Math.round((s.g / s.t) * 100) })).sort((a, b) => b.wr - a.wr);
    if (mercados.length === 0) return { mercado: 'GENERAL', winRate: 0, consejo: 'Buen historial general', emoji: '📊' };
    const mejor = mercados[0];
    return { mercado: mejor.m, winRate: mejor.wr, consejo: mejor.wr >= 80 ? `¡${tipsterNombre} es ÉLITE en ${mejor.m}!` : `${tipsterNombre} domina ${mejor.m}`, emoji: '🎯' };
  }, [historial, tipsterNombre]);
  return (
    <div className="bg-gradient-to-br from-[#00D1B2]/20 to-[#1E293B] rounded-xl p-4 border border-[#00D1B2]/30">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-4 w-4 text-[#00D1B2]" />
        <span className="text-xs text-[#00D1B2] uppercase font-bold">Consejo IA</span>
        <span>{consejo.emoji}</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#94A3B8]">Especialidad</span>
        <span className="text-sm font-bold text-[#00D1B2]">{consejo.mercado} <span className="px-1.5 py-0.5 bg-[#00D1B2]/20 rounded text-xs">{consejo.winRate}%</span></span>
      </div>
      <p className="text-xs text-white/80 pt-2 border-t border-[#334155]">💡 {consejo.consejo}</p>
    </div>
  );
};

const GraficoRendimiento = ({ historial }: { historial: Apuesta[] }) => {
  const datos = useMemo(() => {
    if (!historial || historial.length === 0) return [];
    let acum = 0;
    return historial.filter(a => a.resultado !== 'PENDIENTE').sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).map(ap => {
      acum += sanitizeNumber(ap.ganancia_neta);
      return { fecha: ap.fecha, ganancia: acum };
    });
  }, [historial]);
  if (datos.length < 2) return <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]"><p className="text-[#94A3B8] text-center py-4">Más datos próximamente</p></div>;
  const pos = datos[datos.length - 1]?.ganancia >= 0;
  return (
    <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-[#00D1B2]" />Rendimiento</h3>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datos}>
            <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={pos ? '#00D1B2' : '#EF4444'} stopOpacity={0.3}/><stop offset="95%" stopColor={pos ? '#00D1B2' : '#EF4444'} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="fecha" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 9 }} />
            <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 9 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={45} />
            <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} formatter={(v: number) => [formatCurrency(v), 'Ganancia']} />
            <Area type="monotone" dataKey="ganancia" stroke={pos ? '#00D1B2' : '#EF4444'} strokeWidth={2} fill="url(#cg)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SimuladorCompacto = ({ historial, banca }: { historial: Apuesta[]; banca: number }) => {
  const sim = useMemo(() => {
    if (!historial || historial.length === 0) return { balance: banca, rend: 0, n: 0 };
    let bal = banca, racha = 0;
    historial.forEach(ap => {
      if (ap.resultado === 'PENDIENTE') return;
      const stake = calcularStakeKelly(racha, banca).stake;
      if (ap.resultado === 'GANADA') { bal += stake * (sanitizeNumber(ap.cuota) - 1); racha = racha >= 0 ? racha + 1 : 1; }
      else if (ap.resultado === 'PERDIDA') { bal -= stake; racha = racha <= 0 ? racha - 1 : -1; }
    });
    return { balance: bal, rend: ((bal - banca) / banca) * 100, n: historial.filter(a => a.resultado !== 'PENDIENTE').length };
  }, [historial, banca]);
  return (
    <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4 text-[#FFDD57]" />Simulación ({sim.n} apuestas)</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0F172A] rounded-lg p-3"><p className="text-xs text-[#94A3B8]">Balance</p><p className={`text-lg font-bold font-mono ${sim.balance >= banca ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>{formatCurrency(sim.balance)}</p></div>
        <div className="bg-[#0F172A] rounded-lg p-3"><p className="text-xs text-[#94A3B8]">Rendimiento</p><p className={`text-lg font-bold font-mono ${sim.rend >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>{sim.rend >= 0 ? '+' : ''}{sim.rend.toFixed(1)}%</p></div>
      </div>
    </div>
  );
};

const TablaHistorial = ({ historial, banca }: { historial: Apuesta[]; banca: number }) => {
  const [filtro, setFiltro] = useState<'todos'|'ganadas'|'perdidas'|'pendientes'>('todos');
  const [pagina, setPagina] = useState(1);
  const porPag = 10;
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
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Calendar className="h-4 w-4 text-[#00D1B2]" />Historial ({filtrado.length})</h3>
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
              const stake = calcularStakeKelly(ap.racha_actual || 0, banca).stake;
              const gan = ap.resultado === 'GANADA' ? stake * (sanitizeNumber(ap.cuota) - 1) : ap.resultado === 'PERDIDA' ? -stake : 0;
              return (
                <tr key={i} className="hover:bg-[#0F172A]/50">
                  <td className="py-2 text-white font-mono text-xs">{sanitizeInput(ap.fecha)}</td>
                  <td className="py-2 text-white max-w-[200px]"><span className="block truncate text-xs">{sanitizeInput(ap.apuesta)}</span></td>
                  <td className="py-2 font-bold text-[#FFDD57] font-mono text-xs">{sanitizeNumber(ap.cuota).toFixed(2)}</td>
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = parseInt(tipsterId);
        if (isNaN(id) || id < 1) { setError('ID inválido'); setIsLoading(false); return; }

        // Usar API que tiene el token en memoria
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

  const { tipster, estadisticas, historial } = data;

  return (
    <div className="space-y-4 pb-8">
      <Link href="/dashboard/tipsters" className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white text-sm"><ArrowLeft className="h-4 w-4" />Volver</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-xl p-5 border border-[#334155]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00D1B2] to-[#0891B2] flex items-center justify-center text-3xl">{getIconoDeporte(tipster.deporte)}</div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{sanitizeInput(tipster.alias)}</h1>
              <span className="px-2 py-0.5 bg-[#0F172A] text-[#94A3B8] rounded text-xs border border-[#334155]">{sanitizeInput(tipster.deporte)}</span>
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
        <MetricCard icon={<Zap className="h-4 w-4" />} label="Ganancia" value={formatCurrency(estadisticas.ganancia_total)} color={estadisticas.ganancia_total >= 0 ? '#00D1B2' : '#EF4444'} />
        <ConsejoIACard historial={historial} tipsterNombre={tipster.alias} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GraficoRendimiento historial={historial} />
        <SimuladorCompacto historial={historial} banca={bancaUsuario} />
      </div>

      <TablaHistorial historial={historial} banca={bancaUsuario} />
    </div>
  );
}
