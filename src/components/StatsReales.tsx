'use client';

/**
 * StatsReales — Estadísticas REALES desde la API
 * Reemplaza los valores hardcoded (64% WR, 78% WR promedio, +12.3% yield)
 * Consumir: GET /api/public/stats-reales
 */

import React, { useEffect, useState } from 'react';

interface PlatformStats {
  global: {
    total_picks: number;
    ganadas: number;
    perdidas: number;
    pendientes: number;
    win_rate: number;
    roi: number;
    profit_total: number;
    total_apostado: number;
    cuota_promedio: number;
  };
  mes_actual: {
    total: number;
    ganadas: number;
    perdidas: number;
    win_rate: number;
    roi: number;
    profit: number;
  };
  por_filtro_ia: Record<string, {
    total: number;
    ganadas: number;
    perdidas: number;
    win_rate: number;
    roi: number;
    profit: number;
  }>;
  tipsters_activos: number;
  perfiles_ia: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://franciscoanalistadeportivo.pythonanywhere.com';

export default function StatsReales({ variant = 'full' }: { variant?: 'full' | 'compact' | 'hero' }) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/public/stats-reales`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-slate-800/50 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return <div className="text-red-400 text-sm p-4">Error cargando estadísticas</div>;
  }

  const g = stats.global;
  const m = stats.mes_actual;
  const aprobada = stats.por_filtro_ia?.APROBADA;
  const rechazada = stats.por_filtro_ia?.RECHAZADA;

  if (variant === 'hero') {
    return (
      <div className="grid grid-cols-3 gap-6 text-center">
        <StatHero label="Picks Auditados" value={g.total_picks} />
        <StatHero label="Win Rate Real" value={`${g.win_rate}%`} color={g.win_rate >= 55 ? '#00D1B2' : '#FF4757'} />
        <StatHero label="ROI Real" value={`${g.roi > 0 ? '+' : ''}${g.roi}%`} color={g.roi >= 0 ? '#2ED573' : '#FF4757'} />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4 flex-wrap text-sm">
        <span className="text-slate-400">{g.total_picks} picks</span>
        <span style={{ color: g.win_rate >= 55 ? '#00D1B2' : '#FF4757' }} className="font-bold">
          {g.win_rate}% WR
        </span>
        <span style={{ color: g.roi >= 0 ? '#2ED573' : '#FF4757' }} className="font-bold">
          {g.roi > 0 ? '+' : ''}{g.roi}% ROI
        </span>
        <span className="text-slate-500">{stats.tipsters_activos} tipsters</span>
      </div>
    );
  }

  // variant === 'full'
  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">📊 Estadísticas Reales</h3>
        <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-1 rounded">
          Datos en tiempo real
        </span>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Picks" value={g.total_picks} sub={`${g.ganadas}W · ${g.perdidas}L`} />
        <StatCard
          label="Win Rate"
          value={`${g.win_rate}%`}
          color={g.win_rate >= 55 ? '#00D1B2' : g.win_rate >= 50 ? '#FFDD57' : '#FF4757'}
          sub={`Mes: ${m.win_rate}%`}
        />
        <StatCard
          label="ROI"
          value={`${g.roi > 0 ? '+' : ''}${g.roi}%`}
          color={g.roi >= 0 ? '#2ED573' : '#FF4757'}
          sub={`Mes: ${m.roi > 0 ? '+' : ''}${m.roi}%`}
        />
        <StatCard label="Tipsters" value={stats.tipsters_activos} sub={`${stats.perfiles_ia} con perfil IA`} />
      </div>

      {/* Filtro IA comparison */}
      {aprobada && rechazada && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="text-xs text-emerald-400 mb-1">✅ IA APROBADOS</div>
            <div className="text-2xl font-bold text-emerald-400">{aprobada.win_rate}% WR</div>
            <div className="text-xs text-slate-400 mt-1">
              ROI {aprobada.roi > 0 ? '+' : ''}{aprobada.roi}% · {aprobada.total} picks
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="text-xs text-red-400 mb-1">❌ IA RECHAZADOS</div>
            <div className="text-2xl font-bold text-red-400">{rechazada.win_rate}% WR</div>
            <div className="text-xs text-slate-400 mt-1">
              ROI {rechazada.roi > 0 ? '+' : ''}{rechazada.roi}% · {rechazada.total} picks
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color: color || '#FFFFFF' }}>
        {value}
      </div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function StatHero({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-black" style={{ color: color || '#FFFFFF' }}>
        {value}
      </div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}
