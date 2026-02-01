'use client';

import { useEffect, useState } from 'react';
import { Crown, Lock, Unlock, Star, TrendingUp, AlertCircle, Loader2, Clock, Zap, ChevronRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface PickVIP {
  id: number;
  deporte: string;
  liga: string;
  partido: string;
  pick_texto: string | null;
  cuota: number;
  hora_partido: string;
  fecha: string;
  confianza_ia: number;
  efectividad_tipster: number;
  resultado: string;
  desbloqueado: boolean;
}

export default function SalaVipPage() {
  const [picks, setPicks] = useState<PickVIP[]>([]);
  const [saldo, setSaldo] = useState({ picks_disponibles: 0, picks_usados_mes: 0 });
  const [stats, setStats] = useState({ efectividad: 0, total: 0, ganadas: 0 });
  const [loading, setLoading] = useState(true);
  const [desbloqueando, setDesbloqueando] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  useEffect(() => { cargarPicks(); }, []);

  const cargarPicks = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API}/api/vip/picks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPicks(data.picks || []);
      setSaldo(data.saldo || { picks_disponibles: 0, picks_usados_mes: 0 });
      setStats(data.stats || { efectividad: 0, total: 0, ganadas: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const desbloquear = async (pickId: number) => {
    if (saldo.picks_disponibles <= 0) {
      setMensaje({ tipo: 'error', texto: 'No tienes picks disponibles. Compra un pack VIP.' });
      return;
    }
    setDesbloqueando(pickId);
    setMensaje(null);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API}/api/vip/desbloquear/${pickId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success || data.pick_texto) {
        // Actualizar pick local
        setPicks(prev => prev.map(p =>
          p.id === pickId ? { ...p, desbloqueado: true, pick_texto: data.pick_texto } : p
        ));
        setSaldo(prev => ({
          ...prev,
          picks_disponibles: Math.max(0, prev.picks_disponibles - 1),
          picks_usados_mes: prev.picks_usados_mes + 1,
        }));
        setMensaje({ tipo: 'ok', texto: '¡Pick desbloqueado!' });
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al desbloquear' });
      }
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setDesbloqueando(null);
    }
  };

  const getDeporteIcon = (d: string) => {
    const m: Record<string, string> = {
      Futbol: '⚽', Tenis: '🎾', NBA: '🏀', Baloncesto: '🏀', Hockey: '🏒', eSports: '🎮'
    };
    return m[d] || '🎯';
  };

  const renderEstrellas = (n: number) => '⭐'.repeat(Math.min(5, Math.max(1, n)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFBB00]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* HEADER */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-2" style={{
          background: 'linear-gradient(135deg, rgba(255, 187, 0, 0.15), rgba(249, 115, 22, 0.1))',
          border: '1px solid rgba(255, 187, 0, 0.3)',
        }}>
          <Crown className="w-4 h-4 text-[#FFBB00]" />
          <span className="text-sm font-bold text-[#FFBB00]">Sala VIP</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Picks Exclusivos</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Tipsters internacionales verificados por IA</p>
      </div>

      {/* SALDO + BARRA PROGRESO */}
      <div className="rounded-xl p-4" style={{
        background: 'linear-gradient(135deg, rgba(255, 187, 0, 0.08), rgba(30, 41, 59, 0.8))',
        border: '1px solid rgba(255, 187, 0, 0.3)',
      }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[#FFBB00] font-bold text-sm">📅 Picks VIP este mes</p>
            <p className="text-[#94A3B8] text-xs mt-0.5">
              {saldo.picks_usados_mes} de 5 usados · {saldo.picks_disponibles} disponibles
            </p>
          </div>
          <Link href="/dashboard/suscripcion" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #FFBB00, #F97316)', color: '#000' }}>
            <ShoppingCart className="w-3 h-3" /> Comprar
          </Link>
        </div>
        {/* Barra progreso */}
        <div className="w-full h-2.5 rounded-full" style={{ background: 'rgba(255, 187, 0, 0.1)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{
            width: `${Math.min(100, (saldo.picks_usados_mes / 5) * 100)}%`,
            background: 'linear-gradient(90deg, #FFBB00, #F97316)',
          }} />
        </div>
      </div>

      {/* STATS */}
      {stats.total > 0 && (
        <div className="rounded-xl p-3 flex items-center justify-around" style={{
          background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(100, 116, 139, 0.15)',
        }}>
          <div className="text-center">
            <p className="text-white font-bold font-mono">{stats.efectividad}%</p>
            <p className="text-[10px] text-[#94A3B8]">Efectividad</p>
          </div>
          <div className="w-px h-8" style={{ background: 'rgba(100, 116, 139, 0.2)' }} />
          <div className="text-center">
            <p className="text-[#00D1B2] font-bold font-mono">{stats.ganadas}</p>
            <p className="text-[10px] text-[#94A3B8]">Ganadas</p>
          </div>
          <div className="w-px h-8" style={{ background: 'rgba(100, 116, 139, 0.2)' }} />
          <div className="text-center">
            <p className="text-white font-bold font-mono">{stats.total}</p>
            <p className="text-[10px] text-[#94A3B8]">Total</p>
          </div>
        </div>
      )}

      {/* MENSAJE */}
      {mensaje && (
        <div className={`rounded-xl p-3 flex items-center gap-2 text-sm ${
          mensaje.tipo === 'ok'
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {mensaje.texto}
        </div>
      )}

      {/* PICKS */}
      {picks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🔮</p>
          <p className="text-white font-bold">No hay picks VIP disponibles ahora</p>
          <p className="text-[#94A3B8] text-sm mt-1">Los picks se publican durante el día</p>
        </div>
      ) : (
        <div className="space-y-4">
          {picks.map((pick) => (
            <div key={pick.id} className="rounded-xl overflow-hidden" style={{
              background: pick.desbloqueado
                ? 'linear-gradient(135deg, rgba(0, 209, 178, 0.06), rgba(30, 41, 59, 0.8))'
                : 'linear-gradient(135deg, rgba(255, 187, 0, 0.04), rgba(30, 41, 59, 0.8))',
              border: pick.desbloqueado
                ? '1px solid rgba(0, 209, 178, 0.3)'
                : '1px solid rgba(255, 187, 0, 0.2)',
            }}>
              {/* Header del pick */}
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{getDeporteIcon(pick.deporte)}</span>
                    <span className="text-white text-sm font-medium">{pick.liga}</span>
                    {pick.hora_partido && (
                      <span className="flex items-center gap-1 text-xs text-[#94A3B8] font-mono">
                        <Clock className="w-3 h-3" /> {pick.hora_partido}
                      </span>
                    )}
                  </div>
                  <span className="text-xs">{renderEstrellas(pick.confianza_ia)}</span>
                </div>
                
                <p className="text-white font-bold text-sm">{pick.partido}</p>
                
                {pick.efectividad_tipster > 0 && (
                  <p className="text-[10px] text-[#94A3B8] mt-1">
                    Efectividad tipster: <span className="text-[#00D1B2] font-bold">{pick.efectividad_tipster}%</span>
                  </p>
                )}
              </div>

              {/* Contenido: oculto o desbloqueado */}
              <div className="px-4 pb-4">
                {pick.desbloqueado ? (
                  // DESBLOQUEADO
                  <div className="mt-2 p-3 rounded-lg" style={{
                    background: 'rgba(0, 209, 178, 0.08)', border: '1px solid rgba(0, 209, 178, 0.2)',
                  }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Unlock className="w-3.5 h-3.5 text-[#00D1B2]" />
                      <span className="text-[10px] font-bold text-[#00D1B2]">DESBLOQUEADO</span>
                    </div>
                    <p className="text-white font-bold">{pick.pick_texto}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-mono text-[#FFBB00] font-bold">@{pick.cuota?.toFixed(2)}</span>
                      {pick.resultado !== 'PENDIENTE' && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          pick.resultado === 'GANADA' ? 'bg-green-500/15 text-green-400' :
                          pick.resultado === 'PERDIDA' ? 'bg-red-500/15 text-red-400' : 'bg-gray-500/15 text-gray-400'
                        }`}>
                          {pick.resultado}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  // BLOQUEADO
                  <div className="mt-2">
                    <div className="p-4 rounded-lg text-center" style={{
                      background: 'repeating-linear-gradient(45deg, rgba(255,187,0,0.03), rgba(255,187,0,0.03) 10px, transparent 10px, transparent 20px)',
                      border: '1px dashed rgba(255, 187, 0, 0.2)',
                    }}>
                      <Lock className="w-6 h-6 text-[#FFBB00] mx-auto mb-2 opacity-50" />
                      <p className="text-[#94A3B8] text-sm mb-3">Pick oculto</p>
                      
                      <button
                        onClick={() => desbloquear(pick.id)}
                        disabled={desbloqueando === pick.id || saldo.picks_disponibles <= 0}
                        className="px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        style={{
                          background: saldo.picks_disponibles > 0
                            ? 'linear-gradient(135deg, #FFBB00, #F97316)'
                            : 'rgba(100, 116, 139, 0.3)',
                          color: saldo.picks_disponibles > 0 ? '#000' : '#94A3B8',
                        }}
                      >
                        {desbloqueando === pick.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : saldo.picks_disponibles > 0 ? (
                          <>
                            <Unlock className="w-4 h-4" />
                            🔓 Desbloquear
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            Comprar picks
                          </>
                        )}
                      </button>
                      
                      {saldo.picks_disponibles <= 0 && (
                        <Link href="/dashboard/suscripcion"
                          className="block mt-2 text-[10px] text-[#FFBB00] hover:underline">
                          Ir a comprar picks VIP →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
