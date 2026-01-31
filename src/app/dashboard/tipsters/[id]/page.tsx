'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, TrendingUp, TrendingDown, Target, Trophy,
  Calendar, CheckCircle, XCircle, Clock, Zap, Star, Flame,
  BarChart3, ArrowUpRight, ArrowDownRight, Sparkles
} from 'lucide-react';
import { tipstersAPI, consejoIAAPI, bancaAPI } from '@/lib/api';

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
  historial: Array<{
    fecha: string;
    apuesta: string;
    cuota: number;
    stake_tipster: number;
    stake_ia: number;
    resultado: string;
    ganancia_neta: number;
    filtro_claude: string;
    analisis: string;
    tipo_mercado: string;
    racha_actual: number;
  }>;
  estrategia: {
    estrategia_activa: string;
    estrategia_recomendada: string;
    win_rate: number;
    cuota_promedio: number;
    banca_inicial: number;
    stake_minimo: number;
    stake_maximo: number;
    porcentaje_kelly: number;
    yield_calculado: number;
    notas: string;
  };
}

interface ConsejoIA {
  consejo: string;
  emoji: string;
}

const getDeporteIcon = (deporte: string) => {
  const icons: { [key: string]: string } = {
    'Futbol': '⚽',
    'Tenis': '🎾',
    'NBA': '🏀',
    'Voleibol': '🏐',
    'Mixto': '🎯',
    'eSports': '🎮'
  };
  return icons[deporte] || '🎯';
};

// Componente para calcular stake recomendado
const StakeCalculator = ({ 
  estrategia, 
  banca 
}: { 
  estrategia: TipsterDetail['estrategia']; 
  banca: number;
}) => {
  const [cuota, setCuota] = useState(estrategia.cuota_promedio.toString());
  
  const cuotaNum = parseFloat(cuota) || 1;
  const winRate = estrategia.win_rate / 100;
  
  // Kelly Criterion: (bp - q) / b donde b = cuota - 1, p = prob ganar, q = prob perder
  const b = cuotaNum - 1;
  const kellyFull = ((b * winRate) - (1 - winRate)) / b;
  const kellyAdjusted = Math.max(0, kellyFull * estrategia.porcentaje_kelly);
  
  const stakeRecomendado = Math.min(
    Math.max(banca * kellyAdjusted, estrategia.stake_minimo),
    estrategia.stake_maximo
  );

  return (
    <div className="card-elite">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-[#00D1B2]" />
        Calculadora de Stake
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-[#94A3B8] mb-1.5 block">Cuota de la apuesta</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">@</span>
            <input
              type="number"
              step="0.01"
              value={cuota}
              onChange={(e) => setCuota(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg py-2.5 pl-8 pr-4 text-white font-mono focus:border-[#00D1B2] outline-none"
            />
          </div>
        </div>

        <div className="bg-[#0F172A] rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#94A3B8]">Stake recomendado</span>
            <span className="text-2xl font-bold text-[#00D1B2] font-mono">
              ${stakeRecomendado.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">{(kellyAdjusted * 100).toFixed(2)}% de tu banca</span>
            <span className="text-[#64748B]">Kelly {estrategia.porcentaje_kelly * 100}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-[#1E293B] rounded-lg p-3">
            <p className="text-[#64748B]">Mín</p>
            <p className="text-white font-mono">${estrategia.stake_minimo.toLocaleString()}</p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-3">
            <p className="text-[#64748B]">Máx</p>
            <p className="text-white font-mono">${estrategia.stake_maximo.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TipsterDetailPage() {
  const params = useParams();
  const tipsterId = parseInt(params.id as string);
  
  const [data, setData] = useState<TipsterDetail | null>(null);
  const [consejo, setConsejo] = useState<ConsejoIA | null>(null);
  const [banca, setBanca] = useState(500000);
  const [isLoading, setIsLoading] = useState(true);
  const [consejoLoading, setConsejoLoading] = useState(false);
  const [filter, setFilter] = useState<'todas' | 'ganadas' | 'perdidas' | 'pendientes'>('todas');
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tipsterData, bancaData] = await Promise.all([
          tipstersAPI.getById(tipsterId),
          bancaAPI.get().catch(() => ({ banca: 500000 }))
        ]);
        setData(tipsterData);
        setBanca(bancaData.banca || 500000);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tipsterId]);

  const fetchConsejo = async () => {
    setConsejoLoading(true);
    try {
      const response = await consejoIAAPI.get(tipsterId);
      setConsejo(response);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setConsejoLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-[#94A3B8]">Tipster no encontrado</p>
        <Link href="/dashboard/tipsters" className="text-[#00D1B2] hover:underline mt-2 inline-block">
          ← Volver a tipsters
        </Link>
      </div>
    );
  }

  const { tipster, estadisticas, historial, estrategia } = data;
  
  const filteredHistorial = historial.filter(h => {
    if (filter === 'ganadas') return h.resultado === 'GANADA';
    if (filter === 'perdidas') return h.resultado === 'PERDIDA';
    if (filter === 'pendientes') return h.resultado === 'PENDIENTE';
    return true;
  });

  const displayHistorial = showAllHistory ? filteredHistorial : filteredHistorial.slice(0, 10);

  return (
    <div className="space-y-6 animate-fadeIn pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tipsters" className="p-2 rounded-lg hover:bg-[#1E293B] transition-all">
          <ChevronLeft className="h-5 w-5 text-[#94A3B8]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getDeporteIcon(tipster.deporte)}</span>
            <div>
              <h1 className="text-2xl font-bold text-white">{tipster.alias}</h1>
              <p className="text-[#94A3B8]">{tipster.deporte}</p>
            </div>
          </div>
        </div>
        {estadisticas.racha_actual >= 3 && (
          <div className="badge-success flex items-center gap-1">
            <Flame className="h-4 w-4" />
            Racha +{estadisticas.racha_actual}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="flex items-start justify-between mb-2">
            <Target className="h-5 w-5 text-[#00D1B2]" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{estadisticas.porcentaje_acierto}%</p>
          <p className="text-[#94A3B8] text-sm">Win Rate</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-2">
            <BarChart3 className="h-5 w-5 text-[#3B82F6]" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">
            {estadisticas.ganadas}/{estadisticas.perdidas}
          </p>
          <p className="text-[#94A3B8] text-sm">Ganadas/Perdidas</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-2">
            {estadisticas.ganancia_total >= 0 ? (
              <TrendingUp className="h-5 w-5 text-[#00D1B2]" />
            ) : (
              <TrendingDown className="h-5 w-5 text-[#EF4444]" />
            )}
          </div>
          <p className={`text-2xl font-bold font-mono ${
            estadisticas.ganancia_total >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'
          }`}>
            {estadisticas.ganancia_total >= 0 ? '+' : ''}${estadisticas.ganancia_total.toLocaleString()}
          </p>
          <p className="text-[#94A3B8] text-sm">Profit Total</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-2">
            <Trophy className="h-5 w-5 text-[#FFDD57]" />
          </div>
          <p className="text-3xl font-bold text-[#FFDD57] font-mono">{estadisticas.mejor_racha}</p>
          <p className="text-[#94A3B8] text-sm">Mejor Racha</p>
        </div>
      </div>

      {/* Estrategia Info */}
      <div className="card-elite border-[#00D1B2]/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#FFDD57]" />
            Estrategia Activa
          </h3>
          <span className="px-3 py-1 rounded-lg bg-[#00D1B2]/10 text-[#00D1B2] text-sm font-medium">
            {estrategia.estrategia_activa}
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[#64748B]">Win Rate Base</p>
            <p className="text-white font-mono">{estrategia.win_rate}%</p>
          </div>
          <div>
            <p className="text-[#64748B]">Cuota Promedio</p>
            <p className="text-white font-mono">@{estrategia.cuota_promedio}</p>
          </div>
          <div>
            <p className="text-[#64748B]">Kelly</p>
            <p className="text-white font-mono">{estrategia.porcentaje_kelly * 100}%</p>
          </div>
          <div>
            <p className="text-[#64748B]">Yield</p>
            <p className={`font-mono ${estrategia.yield_calculado >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
              {estrategia.yield_calculado}%
            </p>
          </div>
        </div>
        {estrategia.notas && (
          <p className="text-sm text-[#94A3B8] mt-4 pt-4 border-t border-[#334155]">
            📝 {estrategia.notas}
          </p>
        )}
      </div>

      {/* Consejo IA */}
      <div className="card-premium">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FFDD57]" />
            Consejo IA
          </h3>
          {!consejo && (
            <button
              onClick={fetchConsejo}
              disabled={consejoLoading}
              className="px-4 py-2 rounded-lg bg-[#FFDD57]/10 text-[#FFDD57] text-sm font-medium hover:bg-[#FFDD57]/20 transition-all disabled:opacity-50"
            >
              {consejoLoading ? 'Analizando...' : 'Generar Consejo'}
            </button>
          )}
        </div>
        
        {consejo ? (
          <div className="bg-[#0F172A] rounded-xl p-4">
            <p className="text-white whitespace-pre-line">{consejo.consejo}</p>
          </div>
        ) : (
          <p className="text-[#94A3B8] text-sm">
            Obtén un análisis personalizado basado en el historial del tipster
          </p>
        )}
      </div>

      {/* Calculadora de Stake */}
      <StakeCalculator estrategia={estrategia} banca={banca} />

      {/* Historial */}
      <div className="card-elite">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#3B82F6]" />
            Historial de Apuestas
          </h3>
          <span className="text-sm text-[#64748B]">{estadisticas.total_apuestas} total</span>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { key: 'todas', label: 'Todas' },
            { key: 'ganadas', label: 'Ganadas' },
            { key: 'perdidas', label: 'Perdidas' },
            { key: 'pendientes', label: 'Pendientes' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'bg-[#00D1B2] text-white'
                  : 'bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-2">
          {displayHistorial.map((apuesta, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${
                apuesta.resultado === 'GANADA' ? 'bg-[#00D1B2]/5 border-[#00D1B2]/20' :
                apuesta.resultado === 'PERDIDA' ? 'bg-[#EF4444]/5 border-[#EF4444]/20' :
                'bg-[#FFDD57]/5 border-[#FFDD57]/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#64748B]">{apuesta.fecha}</span>
                    {apuesta.filtro_claude === 'APROBADA' && (
                      <span className="badge-ia text-[10px]">
                        <Zap className="h-3 w-3" />
                        IA
                      </span>
                    )}
                    {apuesta.tipo_mercado && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[#1E293B] text-[#94A3B8]">
                        {apuesta.tipo_mercado}
                      </span>
                    )}
                  </div>
                  <p className="text-white text-sm">{apuesta.apuesta}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-white font-mono">@{apuesta.cuota}</p>
                  <div className={`flex items-center gap-1 justify-end ${
                    apuesta.resultado === 'GANADA' ? 'text-[#00D1B2]' :
                    apuesta.resultado === 'PERDIDA' ? 'text-[#EF4444]' :
                    'text-[#FFDD57]'
                  }`}>
                    {apuesta.resultado === 'GANADA' ? <CheckCircle className="h-4 w-4" /> :
                     apuesta.resultado === 'PERDIDA' ? <XCircle className="h-4 w-4" /> :
                     <Clock className="h-4 w-4" />}
                    <span className="text-sm font-medium">{apuesta.resultado}</span>
                  </div>
                  {apuesta.resultado !== 'PENDIENTE' && (
                    <p className={`text-sm font-mono ${
                      apuesta.ganancia_neta >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'
                    }`}>
                      {apuesta.ganancia_neta >= 0 ? '+' : ''}${apuesta.ganancia_neta.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              {apuesta.analisis && (
                <p className="text-xs text-[#94A3B8] mt-2 pt-2 border-t border-[#334155]/50">
                  💡 {apuesta.analisis}
                </p>
              )}
            </div>
          ))}
        </div>

        {filteredHistorial.length > 10 && !showAllHistory && (
          <button
            onClick={() => setShowAllHistory(true)}
            className="w-full mt-4 py-2 text-center text-[#00D1B2] text-sm hover:underline"
          >
            Ver todas ({filteredHistorial.length} apuestas) →
          </button>
        )}

        {filteredHistorial.length === 0 && (
          <p className="text-center text-[#94A3B8] py-8">
            No hay apuestas con este filtro
          </p>
        )}
      </div>
    </div>
  );
}
