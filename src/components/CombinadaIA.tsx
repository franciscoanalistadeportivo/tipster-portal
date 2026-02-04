'use client';

import { useState, useEffect } from 'react';
import { Brain, Zap, Clock, TrendingUp, Shield, Target, ChevronRight, Activity } from 'lucide-react';

// ============================================================================
// COMBINADA IA DEL DÍA — Componente para landing page
// Llama a /api/public/combinada-ia y muestra la combinada automática
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://neurotips.io/api';

const DEPORTE_EMOJI: Record<string, string> = {
  'Futbol': '⚽', 'Fútbol': '⚽', 'Tenis': '🎾',
  'NBA': '🏀', 'Baloncesto': '🏀', 'Mixto': '🎯',
  'Hockey': '🏒', 'Baseball': '⚾',
};

const ZONA_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  'ORO': { bg: 'rgba(0,209,178,0.08)', border: 'rgba(0,209,178,0.25)', text: '#00D1B2' },
  'NEUTRA': { bg: 'rgba(255,221,87,0.06)', border: 'rgba(255,221,87,0.2)', text: '#FFDD57' },
  'RIESGO': { bg: 'rgba(255,71,87,0.06)', border: 'rgba(255,71,87,0.2)', text: '#FF4757' },
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
}

interface CombData {
  status: 'ready' | 'building' | 'waiting' | 'error';
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
        const res = await fetch(`${API_BASE}/public/combinada-ia`);
        const json = await res.json();
        setData(json);
      } catch {
        setData({ status: 'error', combinada: null, picks_disponibles: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchCombinada();
    // Refresh every 5 min
    const timer = setInterval(fetchCombinada, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // Parse partido name from apuesta text
  const parsePartido = (apuesta: string) => {
    // "COMBINADA (2) - Team A - Team B: Market" or "Team A - Team B - Market: detail"
    const parts = apuesta.split(' - ');
    if (parts.length >= 2) {
      // Remove COMBINADA prefix if present
      let team1 = parts[0].replace(/^COMBINADA\s*\(\d+\)\s*-?\s*/i, '').trim();
      if (!team1 && parts.length >= 3) team1 = parts[1].trim();
      return apuesta;
    }
    return apuesta;
  };

  const getScoreColor = (score: number) => {
    if (score >= 78) return '#2ED573';
    if (score >= 65) return '#00D1B2';
    if (score >= 50) return '#FFDD57';
    return '#FF4757';
  };

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
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(0,209,178,0.08)',
        }}>

          {/* Loading state */}
          {loading && (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-2 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#94A3B8] text-sm">Analizando picks del día...</p>
            </div>
          )}

          {/* Waiting state - no picks yet */}
          {!loading && data?.status === 'waiting' && (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-white font-semibold text-lg mb-2">Generando combinada del día...</p>
              <p className="text-[#94A3B8] text-sm">El algoritmo está esperando los primeros picks. Vuelve pronto.</p>
              <div className="mt-6 flex justify-center gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#00D1B2] animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Building state - some picks but not enough */}
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

          {/* Ready state - combinada available */}
          {!loading && data?.status === 'ready' && data.combinada && (
            <>
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-4" style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
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
                <div className="flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-[#00D1B2] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#00D1B2] uppercase tracking-wider">En vivo</span>
                </div>
              </div>

              {/* Picks list */}
              <div className="p-5 space-y-3">
                {data.combinada.picks.map((pick, idx) => {
                  const emoji = DEPORTE_EMOJI[pick.deporte] || '🎯';
                  const zonaStyle = pick.zona === 'ORO' ? ZONA_STYLES.ORO :
                                    pick.zona === 'RIESGO' ? ZONA_STYLES.RIESGO : ZONA_STYLES.NEUTRA;

                  return (
                    <div key={pick.id} className="flex items-center gap-3 p-3.5 rounded-xl transition-all hover:scale-[1.01]" style={{
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      {/* Number */}
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{
                        background: 'rgba(0,209,178,0.1)',
                        border: '1px solid rgba(0,209,178,0.2)',
                      }}>
                        <span className="text-[#00D1B2] text-xs font-bold font-mono">{idx + 1}</span>
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
                        </div>
                        <p className="text-white text-xs font-semibold truncate">{pick.apuesta}</p>
                        {pick.hora_partido && (
                          <p className="text-[#64748B] text-[10px] font-mono mt-0.5">
                            <Clock className="h-2.5 w-2.5 inline mr-1" />{pick.hora_partido}
                          </p>
                        )}
                      </div>

                      {/* Score + Odds */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold font-mono" style={{ color: '#FFDD57' }}>@{pick.cuota.toFixed(2)}</p>
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
                background: 'linear-gradient(135deg, rgba(0,209,178,0.08), rgba(255,221,87,0.05))',
                border: '1px solid rgba(0,209,178,0.2)',
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Cuota combinada</p>
                    <p className="text-3xl font-bold font-mono text-[#FFDD57] mt-1">{data.combinada.cuota_combinada.toFixed(2)}</p>
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

              {/* CTA */}
              <div className="px-5 pb-5">
                <a href="/registro" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]" style={{
                  background: 'linear-gradient(135deg, #00D1B2 0%, #00B89C 100%)',
                  color: '#0B1120',
                  boxShadow: '0 4px 20px rgba(0, 209, 178, 0.3)',
                }}>
                  <Target className="h-4 w-4" />
                  Ver análisis completo — 5 días gratis
                  <ChevronRight className="h-4 w-4" />
                </a>
                <p className="text-center text-[#64748B] text-[10px] mt-2">
                  Actualizado en tiempo real · Datos verificados · neurotips.io/resultados
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
