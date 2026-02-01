'use client';

import { useEffect, useState } from 'react';
import { 
  Calendar, CheckCircle, XCircle, Clock, Zap, TrendingUp, 
  TrendingDown, Filter, Activity, Eye, Target, BarChart3, 
  Brain, Shield, ChevronDown, ChevronUp
} from 'lucide-react';
import { apuestasAPI } from '@/lib/api';

interface Apuesta {
  id: number;
  tipster_alias: string;
  deporte: string;
  apuesta: string;
  cuota: number;
  stake_tipster: number;
  stake_grok: number;
  resultado: string;
  ganancia_neta: number;
  filtro_claude: string;
  analisis: string;
  tipo_mercado?: string;
  hora_partido?: string;
}

// ============================================================================
// HELPERS
// ============================================================================
const getDeporteIcon = (deporte: string) => {
  const icons: { [key: string]: string } = {
    'Futbol': '⚽', 'Tenis': '🎾', 'NBA': '🏀', 'Baloncesto': '🏀',
    'Voleibol': '🏐', 'Mixto': '🎯', 'eSports': '🎮', 'Hockey': '🏒'
  };
  return icons[deporte] || '🎯';
};

const getMercadoLabel = (tipo: string | undefined) => {
  if (!tipo) return null;
  const map: Record<string, { label: string; color: string }> = {
    'GANADOR': { label: '1X2', color: '#3B82F6' },
    'OVER GOLES': { label: 'OVER', color: '#00D1B2' },
    'UNDER GOLES': { label: 'UNDER', color: '#F59E0B' },
    'AMBOS MARCAN': { label: 'BTTS', color: '#A855F7' },
    'HANDICAP': { label: 'HC', color: '#EC4899' },
    'COMBINADA': { label: 'COMBI', color: '#F97316' },
    'CORNERS': { label: 'CRN', color: '#06B6D4' },
  };
  return map[tipo] || { label: tipo.slice(0, 6), color: '#64748B' };
};

// ============================================================================
// COMPONENTE: KPI Card
// ============================================================================
const KPICard = ({ 
  valor, label, color, porcentaje, icono 
}: { 
  valor: string | number; label: string; color: string; porcentaje?: number; icono?: React.ReactNode 
}) => (
  <div 
    className="rounded-2xl p-4"
    style={{
      background: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(12px)',
      border: `1px solid ${color}25`,
    }}
  >
    <div className="flex items-center justify-between mb-2">
      {icono && (
        <div className="p-2 rounded-lg" style={{ background: `${color}15` }}>
          {icono}
        </div>
      )}
      {porcentaje !== undefined && porcentaje > 0 && (
        <span className="text-xs font-mono" style={{ color }}>{porcentaje}%</span>
      )}
    </div>
    <p className="text-2xl font-bold font-mono" style={{ color }}>{valor}</p>
    <p className="text-xs text-[#94A3B8] mt-0.5">{label}</p>
    {porcentaje !== undefined && (
      <div style={{ 
        width: '100%', height: '3px', borderRadius: '2px',
        background: 'rgba(255,255,255,0.06)', marginTop: '8px'
      }}>
        <div style={{ 
          width: `${Math.min(porcentaje, 100)}%`, height: '100%', borderRadius: '2px',
          background: color, transition: 'width 1s ease-out'
        }} />
      </div>
    )}
  </div>
);

// ============================================================================
// COMPONENTE: Card Apuesta PENDIENTE (destacada dorada)
// ============================================================================
const CardPendiente = ({ apuesta, index }: { apuesta: Apuesta; index: number }) => {
  const mercado = getMercadoLabel(apuesta.tipo_mercado);
  
  return (
    <div 
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 187, 0, 0.08) 0%, rgba(255, 221, 87, 0.02) 100%)',
        border: '1.5px solid rgba(255, 187, 0, 0.3)',
        animationDelay: `${index * 0.05}s`,
      }}
    >
      {/* Borde izquierdo dorado */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
        background: 'linear-gradient(180deg, #F59E0B, #FFDD57)',
        borderRadius: '4px 0 0 4px',
      }} />

      <div className="pl-3">
        {/* Header: Badge + Tipster + Cuota */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{
              background: 'linear-gradient(135deg, #F59E0B, #FFBB00)',
              color: '#000', fontSize: '10px', fontWeight: 800,
              padding: '3px 10px', borderRadius: '6px', letterSpacing: '0.5px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              ⏳ EN JUEGO
            </span>
            <span className="text-sm font-medium text-[#00D1B2]">
              {getDeporteIcon(apuesta.deporte)} {apuesta.tipster_alias}
            </span>
            {mercado && (
              <span style={{
                background: `${mercado.color}20`, color: mercado.color,
                fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                borderRadius: '4px',
              }}>
                {mercado.label}
              </span>
            )}
            {apuesta.filtro_claude === 'APROBADA' && (
              <span className="badge-ia">
                <Zap className="h-3 w-3" /> IA
              </span>
            )}
          </div>
          <span className="font-mono font-bold text-lg" style={{ color: '#FFBB00' }}>
            @{Number(apuesta.cuota || 0).toFixed(2)}
          </span>
        </div>

        {/* Apuesta */}
        <p className="text-white font-medium text-[15px] mb-2 leading-snug">
          {apuesta.apuesta}
        </p>

        {/* Footer: Hora + Stake */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-[#94A3B8]">
            {apuesta.hora_partido && (
              <span className="flex items-center gap-1 font-mono" style={{ color: '#FFBB00' }}>
                <Clock className="h-3 w-3" /> {apuesta.hora_partido} CL
              </span>
            )}
            {apuesta.stake_grok > 0 && (
              <span className="font-mono">
                Stake: ${Number(apuesta.stake_grok).toLocaleString()}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[#94A3B8]">
            <Eye className="h-3 w-3" /> Esperando resultado...
          </span>
        </div>

        {/* Barra progreso animada */}
        <div style={{ 
          width: '100%', height: '3px', borderRadius: '2px',
          background: 'rgba(255, 187, 0, 0.1)', overflow: 'hidden', marginTop: '10px',
        }}>
          <div className="pendiente-bar" style={{
            height: '100%', borderRadius: '2px',
            background: 'linear-gradient(90deg, #F59E0B, #FFDD57)',
          }} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Card Apuesta RESUELTA
// ============================================================================
const CardResuelta = ({ apuesta, index }: { apuesta: Apuesta; index: number }) => {
  const [showAnalisis, setShowAnalisis] = useState(false);
  const isGanada = apuesta.resultado === 'GANADA';
  const mercado = getMercadoLabel(apuesta.tipo_mercado);
  const color = isGanada ? '#00D1B2' : '#EF4444';
  
  return (
    <div 
      className="rounded-xl p-4 animate-fadeInUp"
      style={{
        background: isGanada ? 'rgba(0, 209, 178, 0.05)' : 'rgba(239, 68, 68, 0.05)',
        border: `1px solid ${isGanada ? 'rgba(0, 209, 178, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
        animationDelay: `${index * 0.03}s`,
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-lg">{getDeporteIcon(apuesta.deporte)}</span>
            <span className="text-sm font-medium text-[#00D1B2]">{apuesta.tipster_alias}</span>
            {mercado && (
              <span style={{
                background: `${mercado.color}15`, color: mercado.color,
                fontSize: '10px', fontWeight: 600, padding: '2px 7px',
                borderRadius: '4px',
              }}>
                {mercado.label}
              </span>
            )}
            {apuesta.filtro_claude === 'APROBADA' && (
              <span className="badge-ia">
                <Zap className="h-3 w-3" /> IA
              </span>
            )}
          </div>
          <p className="text-white font-medium">{apuesta.apuesta}</p>
        </div>

        {/* Datos numéricos */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="text-center">
            <p className="text-[10px] text-[#64748B] uppercase">Cuota</p>
            <p className="text-xl font-bold text-white font-mono">@{Number(apuesta.cuota || 0).toFixed(2)}</p>
          </div>
          {apuesta.stake_grok > 0 && (
            <div className="text-center">
              <p className="text-[10px] text-[#64748B] uppercase">Stake</p>
              <p className="text-lg font-bold text-[#94A3B8] font-mono">
                ${Number(apuesta.stake_grok).toLocaleString()}
              </p>
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{
              background: `${color}10`, border: `1px solid ${color}20`
            }}>
              {isGanada 
                ? <CheckCircle className="h-4 w-4 text-[#00D1B2]" />
                : <XCircle className="h-4 w-4 text-[#EF4444]" />
              }
              <span className="text-sm font-bold" style={{ color }}>{apuesta.resultado}</span>
            </div>
          </div>
          {apuesta.resultado !== 'PENDIENTE' && (
            <div className="text-right">
              <p className="text-[10px] text-[#64748B] uppercase">P/L</p>
              <p className={`text-lg font-bold font-mono ${
                (apuesta.ganancia_neta || 0) >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'
              }`}>
                {(apuesta.ganancia_neta || 0) >= 0 ? '+' : ''}{(apuesta.ganancia_neta || 0).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Análisis IA colapsable */}
      {apuesta.analisis && (
        <div className="mt-3">
          <button
            onClick={() => setShowAnalisis(!showAnalisis)}
            className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#00D1B2] transition-colors"
          >
            <Brain className="h-3 w-3" />
            Análisis IA
            {showAnalisis ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showAnalisis && (
            <div className="mt-2 p-3 rounded-lg bg-[#0F172A]/50 border border-white/5">
              <p className="text-sm text-[#94A3B8] leading-relaxed">{apuesta.analisis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================
export default function ApuestasPage() {
  const [apuestas, setApuestas] = useState<Apuesta[]>([]);
  const [fecha, setFecha] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'ia' | 'pendientes' | 'ganadas'>('todas');

  useEffect(() => {
    const fetchApuestas = async () => {
      try {
        const response = await apuestasAPI.getHoy();
        setApuestas(response.apuestas || []);
        setFecha(response.fecha);
      } catch (error) {
        console.error('Error fetching apuestas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApuestas();
  }, []);

  // Normalizar: null/undefined/vacío = PENDIENTE
  const apuestasNorm = apuestas.map(a => ({
    ...a,
    resultado: (a.resultado && a.resultado !== '' && a.resultado !== 'NULA') 
      ? a.resultado : 'PENDIENTE'
  }));

  const filtradas = apuestasNorm.filter((a) => {
    if (filter === 'ia') return a.filtro_claude === 'APROBADA';
    if (filter === 'pendientes') return a.resultado === 'PENDIENTE';
    if (filter === 'ganadas') return a.resultado === 'GANADA';
    return true;
  });

  const pendientes = filtradas.filter(a => a.resultado === 'PENDIENTE');
  const resueltas = filtradas.filter(a => a.resultado === 'GANADA' || a.resultado === 'PERDIDA');

  const stats = {
    total: apuestasNorm.length,
    ganadas: apuestasNorm.filter(a => a.resultado === 'GANADA').length,
    perdidas: apuestasNorm.filter(a => a.resultado === 'PERDIDA').length,
    pendientes: apuestasNorm.filter(a => a.resultado === 'PENDIENTE').length,
    iaApproved: apuestasNorm.filter(a => a.filtro_claude === 'APROBADA').length,
    gananciaTotal: apuestasNorm.reduce((acc, a) => acc + (a.ganancia_neta || 0), 0)
  };

  const winRate = (stats.ganadas + stats.perdidas) > 0 
    ? Math.round((stats.ganadas / (stats.ganadas + stats.perdidas)) * 100) : 0;

  const fechaFormateada = fecha 
    ? new Date(fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
    : 'Hoy';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn pb-20 lg:pb-6">

      {/* HEADER */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(0, 209, 178, 0.1)' }}>
            <Target className="h-6 w-6 text-[#00D1B2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Centro de Operaciones</h1>
            <p className="text-[#94A3B8] text-sm flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {fechaFormateada}
              </span>
              {stats.pendientes > 0 && (
                <span style={{
                  background: 'linear-gradient(135deg, #F59E0B, #FFBB00)',
                  color: '#000', fontSize: '10px', fontWeight: 800,
                  padding: '2px 8px', borderRadius: '10px',
                }}>
                  {stats.pendientes} en juego
                </span>
              )}
              {stats.ganadas > 0 && (
                <span style={{
                  background: 'rgba(0, 209, 178, 0.15)',
                  color: '#00D1B2', fontSize: '10px', fontWeight: 700,
                  padding: '2px 8px', borderRadius: '10px',
                }}>
                  {stats.ganadas} ganadas
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard 
          valor={stats.total} label="Total Operaciones" color="#E2E8F0"
          icono={<BarChart3 className="h-4 w-4 text-[#E2E8F0]" />}
        />
        <KPICard 
          valor={stats.ganadas} label="Ganadas" color="#00D1B2"
          porcentaje={stats.total > 0 ? Math.round((stats.ganadas / stats.total) * 100) : 0}
          icono={<CheckCircle className="h-4 w-4 text-[#00D1B2]" />}
        />
        <KPICard 
          valor={stats.perdidas} label="Perdidas" color="#EF4444"
          porcentaje={stats.total > 0 ? Math.round((stats.perdidas / stats.total) * 100) : 0}
          icono={<XCircle className="h-4 w-4 text-[#EF4444]" />}
        />
        <KPICard 
          valor={stats.pendientes} label="En Juego" color="#FFBB00"
          porcentaje={stats.total > 0 ? Math.round((stats.pendientes / stats.total) * 100) : 0}
          icono={<Activity className="h-4 w-4 text-[#FFBB00]" />}
        />
        
        {/* Balance - card especial */}
        <div className="rounded-2xl p-4 col-span-2 lg:col-span-1" style={{
          background: stats.gananciaTotal >= 0 
            ? 'linear-gradient(135deg, rgba(0, 209, 178, 0.1), rgba(30, 41, 59, 0.7))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(30, 41, 59, 0.7))',
          border: `1px solid ${stats.gananciaTotal >= 0 ? 'rgba(0, 209, 178, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
        }}>
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg" style={{ 
              background: stats.gananciaTotal >= 0 ? 'rgba(0, 209, 178, 0.15)' : 'rgba(239, 68, 68, 0.15)' 
            }}>
              {stats.gananciaTotal >= 0 
                ? <TrendingUp className="h-4 w-4 text-[#00D1B2]" />
                : <TrendingDown className="h-4 w-4 text-[#EF4444]" />
              }
            </div>
            {winRate > 0 && (
              <span className="text-xs font-mono" style={{ color: winRate >= 50 ? '#00D1B2' : '#EF4444' }}>
                WR {winRate}%
              </span>
            )}
          </div>
          <p className={`text-2xl font-bold font-mono ${
            stats.gananciaTotal >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'
          }`}>
            {stats.gananciaTotal >= 0 ? '+' : ''}${stats.gananciaTotal.toLocaleString()}
          </p>
          <p className="text-xs text-[#94A3B8] mt-0.5">Balance del Día</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'todas', label: `Todas (${stats.total})`, color: '#00D1B2' },
          { key: 'ia', label: `IA ✓ (${stats.iaApproved})`, color: '#FFDD57' },
          { key: 'pendientes', label: `En Juego (${stats.pendientes})`, color: '#FFBB00' },
          { key: 'ganadas', label: `Ganadas (${stats.ganadas})`, color: '#00D1B2' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
            style={filter === tab.key ? {
              background: tab.color,
              color: tab.key === 'ia' || tab.key === 'pendientes' ? '#000' : '#fff',
              boxShadow: `0 0 15px ${tab.color}30`,
            } : {
              background: 'rgba(30, 41, 59, 0.7)',
              color: '#94A3B8',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LISTA DE APUESTAS */}
      {filtradas.length === 0 ? (
        <div className="rounded-2xl text-center py-16"
          style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Calendar className="h-12 w-12 text-[#334155] mx-auto mb-4" />
          <p className="text-[#94A3B8]">
            {filter !== 'todas' ? 'No hay apuestas con este filtro' : 'No hay operaciones para hoy'}
          </p>
          <p className="text-[#64748B] text-xs mt-1">Las apuestas se registran desde el bot de Telegram</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* PENDIENTES */}
          {pendientes.length > 0 && (
            <div>
              {(filter === 'todas') && (
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-[#FFBB00]" />
                  <span className="text-sm font-bold text-[#FFBB00]">
                    En Juego ({pendientes.length})
                  </span>
                  <div style={{
                    flex: 1, height: '1px',
                    background: 'linear-gradient(90deg, rgba(255, 187, 0, 0.3), transparent)',
                  }} />
                </div>
              )}
              <div className="space-y-3">
                {pendientes.map((a, i) => (
                  <CardPendiente key={a.id} apuesta={a} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* SEPARADOR */}
          {pendientes.length > 0 && resueltas.length > 0 && filter === 'todas' && (
            <div className="flex items-center gap-2 pt-2">
              <CheckCircle className="h-4 w-4 text-[#64748B]" />
              <span className="text-sm font-medium text-[#64748B]">
                Resueltas ({resueltas.length})
              </span>
              <div style={{
                flex: 1, height: '1px',
                background: 'linear-gradient(90deg, rgba(100, 116, 139, 0.3), transparent)',
              }} />
            </div>
          )}

          {/* RESUELTAS */}
          {resueltas.length > 0 && (
            <div className="space-y-3">
              {resueltas.map((a, i) => (
                <CardResuelta key={a.id} apuesta={a} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* BARRA FLOTANTE MOBILE */}
      <div className="fixed bottom-16 left-4 right-4 lg:hidden z-30">
        <div className="rounded-xl p-3 flex items-center justify-between"
          style={{
            background: stats.gananciaTotal >= 0 
              ? 'rgba(0, 209, 178, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${stats.gananciaTotal >= 0 
              ? 'rgba(0, 209, 178, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-2">
            {stats.gananciaTotal >= 0 
              ? <TrendingUp className="h-4 w-4 text-[#00D1B2]" />
              : <TrendingDown className="h-4 w-4 text-[#EF4444]" />
            }
            <span className="text-white text-sm font-medium">Balance Hoy</span>
          </div>
          <span className={`text-xl font-bold font-mono ${
            stats.gananciaTotal >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'
          }`}>
            {stats.gananciaTotal >= 0 ? '+' : ''}${stats.gananciaTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .pendiente-bar {
          animation: barSlide 2.5s ease-in-out infinite alternate;
        }
        @keyframes barSlide {
          0% { width: 20%; opacity: 0.4; }
          50% { width: 65%; opacity: 1; }
          100% { width: 20%; opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
