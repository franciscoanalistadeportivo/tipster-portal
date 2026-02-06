'use client';

import { useState, useEffect } from 'react';
import { Brain, Clock, Activity, CheckCircle, XCircle, Target, ChevronRight, Star } from 'lucide-react';

// ============================================================================
// COMBINADA IA DEL DÍA — Versión compacta para DASHBOARD (usuarios logueados)
// Mismo endpoint que landing, pero diseño integrado con el dashboard
// SEGURIDAD: no expone datos internos, sanitiza output, rate limit en backend
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://neurotips.io/api';

const DEPORTE_EMOJI: Record<string, string> = {
  'Futbol': '⚽', 'Fútbol': '⚽', 'Tenis': '🎾',
  'NBA': '🏀', 'Baloncesto': '🏀', 'Mixto': '🎯',
  'Hockey': '🏒', 'Baseball': '⚾', 'Multideporte': '🎯',
};

interface Pick {
  tipster: string;
  deporte: string;
  apuesta: string;
  tipo_mercado: string;
  cuota: number;
  neuroscore: number;
  zona: string;
  hora_partido: string;
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
  mejor_pick?: Pick | null;
}

export default function CombinadaDashboard() {
  const [data, setData] = useState<CombData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCombinada = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/combinada-ia`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // Validación básica del response
        if (json && typeof json.status === 'string') {
          setData(json);
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setData({ status: 'error', combinada: null, picks_disponibles: 0 });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCombinada();
    const timer = setInterval(fetchCombinada, 2 * 60 * 1000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 78) return '#2ED573';
    if (score >= 65) return '#00D1B2';
    if (score >= 50) return '#FFDD57';
    return '#FF4757';
  };

  // No mostrar nada si waiting o error
  if (!loading && (!data || data.status === 'waiting' || data.status === 'error')) {
    return null;
  }

  // No mostrar si building y no hay mejor pick
  if (!loading && data?.status === 'building' && !data.mejor_pick) {
    return null;
  }

  const isReady = data?.status === 'ready' || data?.status === 'live' || data?.status === 'finished';

  // Determine border color based on status
  const getBorderColor = () => {
    if (data?.status === 'finished' && data?.combinada?.resultado === 'GANADA') return 'rgba(46,213,115,0.35)';
    if (data?.status === 'finished' && data?.combinada?.resultado === 'PERDIDA') return 'rgba(255,71,87,0.25)';
    if (data?.status === 'live') return 'rgba(255,71,87,0.3)';
    return 'rgba(0,209,178,0.35)';
  };

  const getBgGradient = () => {
    if (data?.status === 'finished' && data?.combinada?.resultado === 'GANADA')
      return 'linear-gradient(135deg, rgba(46,213,115,0.12) 0%, rgba(0,209,178,0.06) 50%, rgba(30,41,59,0.9) 100%)';
    if (data?.status === 'finished' && data?.combinada?.resultado === 'PERDIDA')
      return 'linear-gradient(135deg, rgba(255,71,87,0.08) 0%, rgba(30,41,59,0.9) 100%)';
    if (data?.status === 'live')
      return 'linear-gradient(135deg, rgba(255,71,87,0.06) 0%, rgba(0,209,178,0.06) 50%, rgba(30,41,59,0.9) 100%)';
    return 'linear-gradient(135deg, rgba(0,209,178,0.12) 0%, rgba(255,221,87,0.06) 50%, rgba(30,41,59,0.9) 100%)';
  };

  return (
    <div style={{
      borderRadius: '16px',
      overflow: 'hidden',
      background: getBgGradient(),
      border: `1.5px solid ${getBorderColor()}`,
      boxShadow: '0 0 30px rgba(0,209,178,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{
            width: '24px', height: '24px', border: '2px solid rgba(0,209,178,0.3)',
            borderTop: '2px solid #00D1B2', borderRadius: '50%', margin: '0 auto 8px',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: '#94A3B8', fontSize: '12px' }}>Cargando combinada IA...</p>
        </div>
      )}

      {/* Building state */}
      {!loading && data?.status === 'building' && data.mejor_pick && (
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{
              background: 'linear-gradient(135deg, rgba(0,209,178,0.2), rgba(255,221,87,0.1))',
              border: '1px solid rgba(0,209,178,0.3)',
              color: '#00D1B2', fontSize: '10px', fontWeight: 900, padding: '3px 10px',
              borderRadius: '6px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <Brain style={{ width: '12px', height: '12px' }} />
              COMBINADA IA — ARMANDO...
            </span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '11px', marginBottom: '8px' }}>
            {data.picks_disponibles} picks analizados, buscando más picks de calidad...
          </p>
          <div style={{
            background: 'rgba(0,209,178,0.06)', border: '1px solid rgba(0,209,178,0.15)',
            borderRadius: '10px', padding: '10px',
          }}>
            <p style={{ color: '#64748B', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>⭐ Mejor pick</p>
            <p style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>{data.mejor_pick.apuesta}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span style={{ color: '#FFDD57', fontFamily: 'monospace', fontSize: '11px', fontWeight: 700 }}>@{data.mejor_pick.cuota.toFixed(2)}</span>
              <span style={{ color: getScoreColor(data.mejor_pick.neuroscore), fontSize: '11px' }}>NS: {data.mejor_pick.neuroscore}</span>
            </div>
          </div>
        </div>
      )}

      {/* Ready / Live / Finished */}
      {!loading && isReady && data?.combinada && (
        <>
          {/* Header */}
          <div
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: '14px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #00D1B2, #00E5C3)',
                color: '#000', fontSize: '10px', fontWeight: 900, padding: '3px 10px',
                borderRadius: '6px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px',
                boxShadow: '0 0 12px rgba(0,209,178,0.4)',
              }}>
                <Brain style={{ width: '12px', height: '12px' }} />
                COMBINADA IA
              </span>

              {/* Status badge */}
              {data.status === 'ready' && (
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#00D1B2', background: 'rgba(0,209,178,0.1)', border: '1px solid rgba(0,209,178,0.25)', padding: '2px 8px', borderRadius: '10px' }}>
                  PRE-PARTIDO
                </span>
              )}
              {data.status === 'live' && (
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#FF4757', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FF4757', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                  EN JUEGO
                </span>
              )}
              {data.status === 'finished' && data.combinada.resultado && (
                <span style={{
                  fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                  color: data.combinada.resultado_color || '#94A3B8',
                  background: data.combinada.resultado === 'GANADA' ? 'rgba(46,213,115,0.1)' : 'rgba(255,71,87,0.1)',
                  border: `1px solid ${data.combinada.resultado === 'GANADA' ? 'rgba(46,213,115,0.3)' : 'rgba(255,71,87,0.3)'}`,
                }}>
                  {data.combinada.resultado_emoji} {data.combinada.resultado}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#FFDD57', fontFamily: 'monospace', fontSize: '14px', fontWeight: 800 }}>
                @{data.combinada.cuota_combinada.toFixed(2)}
              </span>
              <span style={{ color: data.combinada.confianza_color, fontFamily: 'monospace', fontSize: '12px', fontWeight: 700 }}>
                NS:{data.combinada.neuroscore_promedio}
              </span>
              <ChevronRight style={{
                width: '16px', height: '16px', color: '#64748B',
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }} />
            </div>
          </div>

          {/* Expanded content */}
          {expanded && (
            <div style={{ padding: '12px 16px 16px' }}>

              {/* Live progress bar */}
              {data.status === 'live' && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Progreso</span>
                    <span style={{ fontSize: '10px', color: 'white', fontFamily: 'monospace' }}>
                      {data.combinada.picks_ganados}✅ {data.combinada.picks_perdidos}❌ {data.combinada.picks_pendientes}⏳
                    </span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '2px', transition: 'width 0.7s',
                      width: `${((data.combinada.total_picks - data.combinada.picks_pendientes) / data.combinada.total_picks) * 100}%`,
                      background: data.combinada.picks_perdidos > 0
                        ? 'linear-gradient(90deg, #2ED573, #FF4757)'
                        : 'linear-gradient(90deg, #00D1B2, #2ED573)',
                    }} />
                  </div>
                </div>
              )}

              {/* Finished banner */}
              {data.status === 'finished' && data.combinada.resultado && (
                <div style={{
                  padding: '10px', borderRadius: '10px', textAlign: 'center', marginBottom: '12px',
                  background: data.combinada.resultado === 'GANADA'
                    ? 'linear-gradient(135deg, rgba(46,213,115,0.1), rgba(0,209,178,0.06))'
                    : 'linear-gradient(135deg, rgba(255,71,87,0.08), rgba(255,71,87,0.03))',
                  border: `1px solid ${data.combinada.resultado === 'GANADA' ? 'rgba(46,213,115,0.25)' : 'rgba(255,71,87,0.2)'}`,
                }}>
                  <span style={{ fontSize: '20px' }}>{data.combinada.resultado_emoji}</span>
                  <p style={{ color: data.combinada.resultado_color, fontWeight: 700, fontSize: '14px', margin: '4px 0' }}>
                    Combinada {data.combinada.resultado}
                  </p>
                  <p style={{ color: '#94A3B8', fontSize: '10px' }}>
                    {data.combinada.picks_ganados}✅ {data.combinada.picks_perdidos}❌
                    {data.combinada.picks_void > 0 ? ` ${data.combinada.picks_void}🔄` : ''}
                    {data.combinada.resultado === 'GANADA' ? ` · @${data.combinada.cuota_combinada}` : ''}
                  </p>
                </div>
              )}

              {/* Picks list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.combinada.picks.map((pick, idx) => {
                  const emoji = DEPORTE_EMOJI[pick.deporte] || '🎯';
                  const hasResult = pick.resultado !== 'PENDIENTE';
                  const isWon = pick.resultado === 'GANADA';
                  const isLost = pick.resultado === 'PERDIDA';

                  return (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: '10px',
                      background: hasResult
                        ? isWon ? 'rgba(46,213,115,0.05)' : isLost ? 'rgba(255,71,87,0.05)' : 'rgba(255,255,255,0.02)'
                        : 'rgba(255,255,255,0.02)',
                      border: hasResult
                        ? `1px solid ${isWon ? 'rgba(46,213,115,0.2)' : isLost ? 'rgba(255,71,87,0.2)' : 'rgba(255,255,255,0.06)'}`
                        : '1px solid rgba(255,255,255,0.06)',
                    }}>
                      {/* Result / Number */}
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                        background: hasResult
                          ? isWon ? 'rgba(46,213,115,0.15)' : isLost ? 'rgba(255,71,87,0.15)' : 'rgba(255,221,87,0.1)'
                          : 'rgba(0,209,178,0.1)',
                        border: hasResult
                          ? `1px solid ${isWon ? 'rgba(46,213,115,0.3)' : isLost ? 'rgba(255,71,87,0.3)' : 'rgba(255,221,87,0.2)'}`
                          : '1px solid rgba(0,209,178,0.2)',
                      }}>
                        {hasResult ? (
                          <span>{isWon ? '✅' : isLost ? '❌' : '🔄'}</span>
                        ) : (
                          <span style={{ color: '#00D1B2', fontWeight: 700, fontFamily: 'monospace', fontSize: '10px' }}>{idx + 1}</span>
                        )}
                      </div>

                      {/* Pick info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '11px' }}>{emoji}</span>
                          <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{pick.tipster}</span>
                          {pick.zona === 'ORO' && (
                            <span style={{ fontSize: '8px', fontWeight: 700, color: '#00D1B2', background: 'rgba(0,209,178,0.08)', border: '1px solid rgba(0,209,178,0.25)', padding: '1px 5px', borderRadius: '4px' }}>ORO</span>
                          )}
                          {data.status === 'live' && !hasResult && (
                            <span style={{ fontSize: '8px', fontWeight: 700, color: '#FF4757', background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', padding: '1px 5px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FF4757', display: 'inline-block' }} />
                              LIVE
                            </span>
                          )}
                        </div>
                        <p style={{
                          color: 'white', fontSize: '12px', fontWeight: 600,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          opacity: isLost ? 0.5 : 1,
                          textDecoration: isLost ? 'line-through' : 'none',
                        }}>{pick.apuesta}</p>
                        {pick.hora_partido && (
                          <p style={{ color: '#64748B', fontSize: '9px', fontFamily: 'monospace', marginTop: '2px' }}>
                            🕐 {pick.hora_partido}
                          </p>
                        )}
                      </div>

                      {/* Cuota + NS */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{
                          fontFamily: 'monospace', fontSize: '13px', fontWeight: 800,
                          color: hasResult ? (isWon ? '#2ED573' : isLost ? '#FF4757' : '#FFDD57') : '#FFDD57',
                        }}>@{pick.cuota.toFixed(2)}</p>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '22px', height: '22px', borderRadius: '50%', marginTop: '2px',
                          fontSize: '8px', fontWeight: 700, fontFamily: 'monospace',
                          background: `${getScoreColor(pick.neuroscore)}15`,
                          color: getScoreColor(pick.neuroscore),
                          border: `1px solid ${getScoreColor(pick.neuroscore)}30`,
                        }}>
                          {pick.neuroscore}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom summary */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: '12px', padding: '10px 12px', borderRadius: '10px',
                background: data.status === 'finished' && data.combinada.resultado === 'GANADA'
                  ? 'rgba(46,213,115,0.06)' : 'rgba(0,209,178,0.04)',
                border: `1px solid ${data.status === 'finished' && data.combinada.resultado === 'GANADA'
                  ? 'rgba(46,213,115,0.15)' : 'rgba(0,209,178,0.12)'}`,
              }}>
                <div>
                  <p style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Cuota</p>
                  <p style={{
                    fontSize: '20px', fontWeight: 800, fontFamily: 'monospace',
                    color: data.status === 'finished' ? (data.combinada.resultado === 'GANADA' ? '#2ED573' : '#FF4757') : '#FFDD57',
                  }}>{data.combinada.cuota_combinada.toFixed(2)}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>NeuroScore</p>
                  <p style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'monospace', color: data.combinada.confianza_color }}>
                    {data.combinada.neuroscore_promedio}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Confianza</p>
                  <p style={{
                    fontSize: '11px', fontWeight: 700, marginTop: '4px', padding: '3px 10px', borderRadius: '10px',
                    color: data.combinada.confianza_color,
                    background: `${data.combinada.confianza_color}12`,
                    border: `1px solid ${data.combinada.confianza_color}25`,
                  }}>{data.combinada.confianza}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Keyframe for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
