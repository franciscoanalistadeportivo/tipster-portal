'use client';

import { useState, useEffect } from 'react';
import { Brain, Zap, Clock, TrendingUp, Shield, Target, ChevronRight, Activity, CheckCircle, XCircle } from 'lucide-react';

// ============================================================================
// COMBINADA IA DEL DÍA — Componente para landing page + dashboard
// Estados: waiting → building → ready → live → finished
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://neurotips.io/api';

const DEPORTE_EMOJI: Record<string, string> = {
  'Futbol': '⚽', 'Fútbol': '⚽', 'Tenis': '🎾',
  'NBA': '🏀', 'Baloncesto': '🏀', 'Mixto': '🎯',
  'Hockey': '🏒', 'Baseball': '⚾', 'Multideporte': '🎯',
};

const ZONA_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  'ORO': { bg: 'rgba(0,209,178,0.08)', border: 'rgba(0,209,178,0.25)', text: '#00D1B2' },
  'NEUTRA': { bg: 'rgba(255,221,87,0.06)', border: 'rgba(255,221,87,0.2)', text: '#FFDD57' },
  'RIESGO': { bg: 'rgba(255,71,87,0.06)', border: 'rgba(255,71,87,0.2)', text: '#FF4757' },
};

const RESULTADO_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  'GANADA': { bg: 'rgba(46,213,115,0.1)', border: 'rgba(46,213,115,0.3)', text: '#2ED573', icon: '✅' },
  'PERDIDA': { bg: 'rgba(255,71,87,0.1)', border: 'rgba(255,71,87,0.3)', text: '#FF4757', icon: '❌' },
  'VOID': { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', text: '#94A3B8', icon: '🔄' },
  'PENDIENTE': { bg: 'rgba(255,221,87,0.06)', border: 'rgba(255,221,87,0.15)', text: '#FFDD57', icon: '⏳' },
};

interface Pick {
  id: number;
  tipster: string;
  deporte: string;
  apuesta: string;
  tipo_mercado: string;
  cuota: number;
  neuroscore: number;
  zona: string;
  zona_color: string;
  hora_partido: string;
  ev: number;
  resultado: string;
}

interface Combinada {
  picks: Pick[];
  total_picks: number;
  cuota_combinada: number;
  neuroscore_promedio: number;
  confianza: string;
  confianza_color: string;
  primera_hora: string;
  fecha: string;
  picks_ganados: number;
  picks_perdidos: number;
  picks_pendientes: number;
  picks_void: number;
  resultado?: string;
  resultado_color?: string;
  resultado_emoji?: string;
}

interface CombData {
  status: 'ready' | 'building' | 'waiting' | 'live' | 'finished' | 'error';
  combinada: Combinada | null;
  picks_disponibles: number;
  total_analizados?: number;
  mejor_pick?: Pick | null;
  message?: string;
}

export default function CombinadaIA() {
  const [data, setData] = useState<CombData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombinada = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/combinada-ia`);
        const json = await res.json();
        setData(json);
      } catch {
        setData({ status: 'error', combinada: null, picks_disponibles: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchCombinada();
    // Live: refresh every 2 min, otherwise every 5 min
    const timer = setInterval(fetchCombinada, 2 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 78) return '#2ED573';
    if (score >= 65) return '#00D1B2';
    if (score >= 50) return '#FFDD57';
    return '#FF4757';
  };

  const isLiveOrFinished = data?.status === 'live' || data?.status === 'finished';
  const isReady = data?.status === 'ready' || isLiveOrFinished;

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-10 pointer-events-none" style={{
        background: 'radial-gradient(ellipse, rgba(0,209,178,0.2) 0%, transparent 70%)',
      }} />

      <div className="max-w-4xl mx-auto relative">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#00D1B2]/10 border border-[#00D1B2]/25 rounded-full px-4 py-1.5 mb-4">
            <Brain className="h-4 w-4 text-[#00D1B2]" />
            <span className="text-[#00D1B2] text-xs font-bold tracking-wider uppercase">Generada por IA en tiempo real</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            Combinada IA del Día
          </h2>
          <p className="text-[#94A3B8] text-sm sm:text-base max-w-xl mx-auto">
            Nuestro algoritmo selecciona los picks con mayor NeuroScore y arma la combinada más confiable automáticamente.
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl overflow-hidden" style={{
          background: 'linear-gradient(160deg, #111827 0%, #0d1520 50%, #111827 100%)',
          border: data?.status === 'finished' && data?.combinada?.resultado === 'GANADA'
            ? '1px solid rgba(46,213,115,0.3)'
            : data?.status === 'finished' && data?.combinada?.resultado === 'PERDIDA'
            ? '1px solid rgba(255,71,87,0.2)'
            : '1px solid rgba(255,255,255,0.06)',
          boxShadow: data?.status === 'finished' && data?.combinada?.resultado === 'GANADA'
            ? '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(46,213,115,0.15)'
            : '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(0,209,178,0.08)',
        }}>

          {/* Loading state */}
          {loading && (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-2 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#94A3B8] text-sm">Analizando picks del día...</p>
            </div>
          )}

          {/* Waiting state */}
          {!loading && data?.status === 'waiting' && (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-white font-semibold text-lg mb-2">Esperando los picks del día...</p>
              <p className="text-[#94A3B8] text-sm">El algoritmo está esperando los primeros picks. Vuelve pronto.</p>
              <div className="mt-6 flex justify-center gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#00D1B2] animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Building state */}
          {!loading && data?.status === 'building' && (
            <div className="p-10 text-center">
              <div className="text-4xl mb-4">🧠</div>
              <p className="text-white font-semibold text-lg mb-2">Analizando picks...</p>
              <p className="text-[#94A3B8] text-sm mb-4">
                {data.picks_disponibles} picks analizados. Se necesitan más picks de calidad para armar la combinada.
              </p>
              {data.mejor_pick && (
                <div className="inline-block mt-2 p-4 rounded-xl text-left" style={{
                  background: 'rgba(0,209,178,0.06)',
                  border: '1px solid rgba(0,209,178,0.15)',
                }}>
                  <p className="text-[10px] text-[#00D1B2] font-bold uppercase tracking-wider mb-2">⭐ Mejor pick hasta ahora</p>
                  <p className="text-white text-sm font-semibold">{data.mejor_pick.apuesta}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[#FFDD57] font-mono text-sm font-bold">@{data.mejor_pick.cuota}</span>
                    <span className="text-xs" style={{ color: getScoreColor(data.mejor_pick.neuroscore) }}>
                      NS: {data.mejor_pick.neuroscore}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* READY / LIVE / FINISHED states — show picks */}
          {!loading && isReady && data?.combinada && (
            <>
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-4" style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: data.status === 'finished' && data.combinada.resultado === 'GANADA'
                  ? 'rgba(46,213,115,0.05)'
                  : data.status === 'finished' && data.combinada.resultado === 'PERDIDA'
                  ? 'rgba(255,71,87,0.04)'
                  : 'rgba(255,255,255,0.02)',
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(0,209,178,0.2), rgba(255,221,87,0.1))',
                    border: '1px solid rgba(0,209,178,0.3)',
                  }}>
                    <span className="text-[#00D1B2] font-extrabold text-sm">N</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Combinada IA</p>
                    <p className="text-[#64748B] text-[10px] font-mono">{data.combinada.fecha} · {data.combinada.total_picks} selecciones</p>
                  </div>
                </div>

                {/* Status badge */}
                {data.status === 'ready' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
                    background: 'rgba(0,209,178,0.1)', border: '1px solid rgba(0,209,178,0.25)',
                  }}>
                    <Clock className="h-3 w-3 text-[#00D1B2]" />
                    <span className="text-[10px] font-bold text-[#00D1B2] uppercase tracking-wider">Pre-partido</span>
                  </div>
                )}
                {data.status === 'live' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
                    background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)',
                  }}>
                    <div className="w-2 h-2 rounded-full bg-[#FF4757] animate-pulse" />
                    <span className="text-[10px] font-bold text-[#FF4757] uppercase tracking-wider">En juego</span>
                  </div>
                )}
                {data.status === 'finished' && data.combinada.resultado && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
                    background: data.combinada.resultado === 'GANADA' ? 'rgba(46,213,115,0.1)' : 'rgba(255,71,87,0.1)',
                    border: `1px solid ${data.combinada.resultado === 'GANADA' ? 'rgba(46,213,115,0.3)' : 'rgba(255,71,87,0.3)'}`,
                  }}>
                    <span className="text-sm">{data.combinada.resultado_emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{
                      color: data.combinada.resultado_color || '#94A3B8',
                    }}>{data.combinada.resultado}</span>
                  </div>
                )}
              </div>

              {/* Finished banner */}
              {data.status === 'finished' && data.combinada.resultado && (
                <div className="mx-5 mt-4 p-4 rounded-xl text-center" style={{
                  background: data.combinada.resultado === 'GANADA'
                    ? 'linear-gradient(135deg, rgba(46,213,115,0.08), rgba(0,209,178,0.05))'
                    : 'linear-gradient(135deg, rgba(255,71,87,0.06), rgba(255,71,87,0.03))',
                  border: `1px solid ${data.combinada.resultado === 'GANADA' ? 'rgba(46,213,115,0.2)' : 'rgba(255,71,87,0.15)'}`,
                }}>
                  <div className="text-3xl mb-2">{data.combinada.resultado_emoji}</div>
                  <p className="text-lg font-bold" style={{ color: data.combinada.resultado_color }}>
                    Combinada {data.combinada.resultado}
                  </p>
                  <p className="text-[#94A3B8] text-xs mt-1">
                    {data.combinada.picks_ganados} ganadas · {data.combinada.picks_perdidos} perdidas
                    {data.combinada.picks_void > 0 && ` · ${data.combinada.picks_void} void`}
                    {data.combinada.resultado === 'GANADA' && ` · Cuota @${data.combinada.cuota_combinada}`}
                  </p>
                </div>
              )}

              {/* Live progress bar */}
              {data.status === 'live' && (
                <div className="mx-5 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Progreso</span>
                    <span className="text-[10px] text-white font-mono">
                      {data.combinada.picks_ganados}✅ {data.combinada.picks_perdidos}❌ {data.combinada.picks_pendientes}⏳
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{
                      width: `${((data.combinada.total_picks - data.combinada.picks_pendientes) / data.combinada.total_picks) * 100}%`,
                      background: data.combinada.picks_perdidos > 0
                        ? 'linear-gradient(90deg, #2ED573, #FF4757)'
                        : 'linear-gradient(90deg, #00D1B2, #2ED573)',
                    }} />
                  </div>
                </div>
              )}

              {/* Picks list */}
              <div className="p-5 space-y-3">
                {data.combinada.picks.map((pick, idx) => {
                  const emoji = DEPORTE_EMOJI[pick.deporte] || '🎯';
                  const zonaStyle = pick.zona === 'ORO' ? ZONA_STYLES.ORO :
                                    pick.zona === 'RIESGO' ? ZONA_STYLES.RIESGO : ZONA_STYLES.NEUTRA;
                  const resStyle = RESULTADO_STYLES[pick.resultado] || RESULTADO_STYLES.PENDIENTE;
                  const hasResult = pick.resultado !== 'PENDIENTE';

                  return (
                    <div key={pick.id} className="flex items-center gap-3 p-3.5 rounded-xl transition-all" style={{
                      background: hasResult
                        ? pick.resultado === 'GANADA' ? 'rgba(46,213,115,0.04)' : pick.resultado === 'PERDIDA' ? 'rgba(255,71,87,0.04)' : 'rgba(255,255,255,0.025)'
                        : 'rgba(255,255,255,0.025)',
                      border: hasResult
                        ? `1px solid ${resStyle.border}`
                        : '1px solid rgba(255,255,255,0.06)',
                    }}>
                      {/* Number / Result icon */}
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{
                        background: hasResult ? resStyle.bg : 'rgba(0,209,178,0.1)',
                        border: hasResult ? `1px solid ${resStyle.border}` : '1px solid rgba(0,209,178,0.2)',
                      }}>
                        {hasResult ? (
                          <span className="text-xs">{resStyle.icon}</span>
                        ) : (
                          <span className="text-[#00D1B2] text-xs font-bold font-mono">{idx + 1}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{emoji}</span>
                          <span className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">{pick.tipster}</span>
                          {pick.zona === 'ORO' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{
                              background: zonaStyle.bg, border: `1px solid ${zonaStyle.border}`, color: zonaStyle.text
                            }}>ORO</span>
                          )}
                          {/* Live indicator for pending picks during live state */}
                          {data.status === 'live' && !hasResult && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1" style={{
                              background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', color: '#FF4757'
                            }}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4757] animate-pulse" />
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-white text-xs font-semibold truncate" style={{
                          opacity: hasResult && pick.resultado === 'PERDIDA' ? 0.6 : 1,
                          textDecoration: pick.resultado === 'PERDIDA' ? 'line-through' : 'none',
                        }}>{pick.apuesta}</p>
                        {pick.hora_partido && (
                          <p className="text-[#64748B] text-[10px] font-mono mt-0.5">
                            <Clock className="h-2.5 w-2.5 inline mr-1" />{pick.hora_partido}
                          </p>
                        )}
                      </div>

                      {/* Score + Odds */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold font-mono" style={{
                          color: hasResult
                            ? pick.resultado === 'GANADA' ? '#2ED573' : pick.resultado === 'PERDIDA' ? '#FF4757' : '#FFDD57'
                            : '#FFDD57',
                        }}>@{pick.cuota.toFixed(2)}</p>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold" style={{
                            background: `${getScoreColor(pick.neuroscore)}20`,
                            color: getScoreColor(pick.neuroscore),
                            border: `1px solid ${getScoreColor(pick.neuroscore)}40`,
                          }}>
                            {pick.neuroscore}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom total */}
              <div className="mx-5 mb-5 p-4 rounded-xl" style={{
                background: data.status === 'finished' && data.combinada.resultado === 'GANADA'
                  ? 'linear-gradient(135deg, rgba(46,213,115,0.1), rgba(0,209,178,0.06))'
                  : 'linear-gradient(135deg, rgba(0,209,178,0.08), rgba(255,221,87,0.05))',
                border: data.status === 'finished' && data.combinada.resultado === 'GANADA'
                  ? '1px solid rgba(46,213,115,0.25)'
                  : '1px solid rgba(0,209,178,0.2)',
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Cuota combinada</p>
                    <p className="text-3xl font-bold font-mono mt-1" style={{
                      color: data.status === 'finished'
                        ? data.combinada.resultado === 'GANADA' ? '#2ED573' : '#FF4757'
                        : '#FFDD57',
                    }}>{data.combinada.cuota_combinada.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">NeuroScore</p>
                    <p className="text-3xl font-bold font-mono mt-1" style={{ color: data.combinada.confianza_color }}>
                      {data.combinada.neuroscore_promedio}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Confianza</p>
                    <p className="text-sm font-bold mt-2 px-3 py-1 rounded-full" style={{
                      background: `${data.combinada.confianza_color}15`,
                      color: data.combinada.confianza_color,
                      border: `1px solid ${data.combinada.confianza_color}30`,
                    }}>
                      {data.combinada.confianza}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA — only for ready, for live/finished show different */}
              <div className="px-5 pb-5">
                {data.status === 'ready' && (
                  <a href="/registro" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]" style={{
                    background: 'linear-gradient(135deg, #00D1B2 0%, #00B89C 100%)',
                    color: '#0B1120',
                    boxShadow: '0 4px 20px rgba(0, 209, 178, 0.3)',
                  }}>
                    <Target className="h-4 w-4" />
                    Ver análisis completo — 5 días gratis
                    <ChevronRight className="h-4 w-4" />
                  </a>
                )}
                {data.status === 'live' && (
                  <a href="/registro" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]" style={{
                    background: 'linear-gradient(135deg, #FF4757 0%, #FF6B6B 100%)',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(255, 71, 87, 0.3)',
                  }}>
                    <Activity className="h-4 w-4 animate-pulse" />
                    Partidos en juego — Sigue el resultado en vivo
                    <ChevronRight className="h-4 w-4" />
                  </a>
                )}
                {data.status === 'finished' && (
                  <a href="/registro" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]" style={{
                    background: data.combinada.resultado === 'GANADA'
                      ? 'linear-gradient(135deg, #2ED573 0%, #00D1B2 100%)'
                      : 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
                    color: data.combinada.resultado === 'GANADA' ? '#0B1120' : 'white',
                    boxShadow: data.combinada.resultado === 'GANADA'
                      ? '0 4px 20px rgba(46, 213, 115, 0.3)'
                      : '0 4px 20px rgba(59, 130, 246, 0.3)',
                  }}>
                    {data.combinada.resultado === 'GANADA' ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        ¡Combinada GANADA! Regístrate para la de mañana
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4" />
                        Mañana nueva combinada — 5 días gratis
                      </>
                    )}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                )}
                <p className="text-center text-[#64748B] text-[10px] mt-2">
                  {data.status === 'live' ? 'Actualizando cada 2 minutos' : 'Actualizado en tiempo real'} · Datos verificados · neurotips.io/resultados
                </p>
              </div>
            </>
          )}

          {/* Error state */}
          {!loading && data?.status === 'error' && (
            <div className="p-12 text-center">
              <p className="text-[#94A3B8] text-sm">No se pudo cargar la combinada. Intenta más tarde.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
