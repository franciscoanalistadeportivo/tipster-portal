'use client';

import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Zap, TrendingUp, Filter } from 'lucide-react';
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
}

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

  const filteredApuestas = apuestas.filter((a) => {
    if (filter === 'ia') return a.filtro_claude === 'APROBADA';
    if (filter === 'pendientes') return a.resultado === 'PENDIENTE';
    if (filter === 'ganadas') return a.resultado === 'GANADA';
    return true;
  });

  const stats = {
    total: apuestas.length,
    ganadas: apuestas.filter(a => a.resultado === 'GANADA').length,
    perdidas: apuestas.filter(a => a.resultado === 'PERDIDA').length,
    pendientes: apuestas.filter(a => a.resultado === 'PENDIENTE').length,
    iaApproved: apuestas.filter(a => a.filtro_claude === 'APROBADA').length,
    gananciaTotal: apuestas.reduce((acc, a) => acc + (a.ganancia_neta || 0), 0)
  };

  const getDeporteIcon = (deporte: string) => {
    const icons: { [key: string]: string } = {
      'Futbol': '⚽',
      'Tenis': '🎾',
      'NBA': '🏀',
      'Voleibol': '🏐',
      'Mixto': '🎯'
    };
    return icons[deporte] || '🎯';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Monitor de Apuestas</h1>
          <p className="text-[#94A3B8] mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {fecha ? new Date(fecha).toLocaleDateString('es-CL', { 
              weekday: 'long', 
              day: 'numeric',
              month: 'long'
            }) : 'Hoy'}
          </p>
        </div>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="stat-card">
          <p className="text-2xl font-bold text-white font-mono">{stats.total}</p>
          <p className="text-xs text-[#94A3B8]">Total</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-bold text-[#00D1B2] font-mono">{stats.ganadas}</p>
          <p className="text-xs text-[#94A3B8]">Ganadas</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-bold text-[#EF4444] font-mono">{stats.perdidas}</p>
          <p className="text-xs text-[#94A3B8]">Perdidas</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-bold text-[#FFDD57] font-mono">{stats.pendientes}</p>
          <p className="text-xs text-[#94A3B8]">Pendientes</p>
        </div>
        <div className="stat-card col-span-2 lg:col-span-1">
          <p className={`text-2xl font-bold font-mono ${stats.gananciaTotal >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {stats.gananciaTotal >= 0 ? '+' : ''}{stats.gananciaTotal.toLocaleString()}
          </p>
          <p className="text-xs text-[#94A3B8]">Ganancia Neta</p>
        </div>
      </div>

      {/* Filtros Tab */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'todas', label: `Todas (${stats.total})` },
          { key: 'ia', label: `IA ✓ (${stats.iaApproved})` },
          { key: 'pendientes', label: `Pendientes (${stats.pendientes})` },
          { key: 'ganadas', label: `Ganadas (${stats.ganadas})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === tab.key
                ? 'bg-[#00D1B2] text-white'
                : 'bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista de Apuestas */}
      {filteredApuestas.length === 0 ? (
        <div className="card-elite text-center py-16">
          <Calendar className="h-12 w-12 text-[#334155] mx-auto mb-4" />
          <p className="text-[#94A3B8]">No hay apuestas {filter !== 'todas' ? 'con este filtro' : 'para hoy'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApuestas.map((apuesta, index) => (
            <div 
              key={apuesta.id} 
              className={`card-elite table-row-hover animate-fadeInUp ${
                apuesta.resultado === 'GANADA' ? 'row-won' :
                apuesta.resultado === 'PERDIDA' ? 'row-lost' : 'row-pending'
              }`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Info Principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getDeporteIcon(apuesta.deporte)}</span>
                    <span className="text-sm text-[#00D1B2] font-medium">{apuesta.tipster_alias}</span>
                    {apuesta.filtro_claude === 'APROBADA' && (
                      <span className="badge-ia">
                        <Zap className="h-3 w-3" />
                        IA
                      </span>
                    )}
                  </div>
                  <p className="text-white font-medium">{apuesta.apuesta}</p>
                </div>

                {/* Datos */}
                <div className="flex items-center gap-4 lg:gap-6">
                  {/* Cuota */}
                  <div className="text-center">
                    <p className="text-xs text-[#94A3B8]">Cuota</p>
                    <p className="text-xl font-bold text-white font-mono">@{apuesta.cuota}</p>
                  </div>

                  {/* Stake */}
                  <div className="text-center">
                    <p className="text-xs text-[#94A3B8]">Stake</p>
                    <p className="text-lg font-bold text-[#94A3B8] font-mono">
                      ${apuesta.stake_grok?.toLocaleString()}
                    </p>
                  </div>

                  {/* Resultado */}
                  <div className="min-w-[100px]">
                    {apuesta.resultado === 'GANADA' ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00D1B2]/10">
                        <CheckCircle className="h-4 w-4 text-[#00D1B2]" />
                        <span className="text-sm font-bold text-[#00D1B2] font-mono">GANADA</span>
                      </div>
                    ) : apuesta.resultado === 'PERDIDA' ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EF4444]/10">
                        <XCircle className="h-4 w-4 text-[#EF4444]" />
                        <span className="text-sm font-bold text-[#EF4444] font-mono">PERDIDA</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFDD57]/10">
                        <Clock className="h-4 w-4 text-[#FFDD57]" />
                        <span className="text-sm font-bold text-[#FFDD57] font-mono">PENDIENTE</span>
                      </div>
                    )}
                  </div>

                  {/* Ganancia */}
                  {apuesta.resultado !== 'PENDIENTE' && (
                    <div className="text-right">
                      <p className="text-xs text-[#94A3B8]">P/L</p>
                      <p className={`text-lg font-bold font-mono ${
                        (apuesta.ganancia_neta || 0) >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'
                      }`}>
                        {(apuesta.ganancia_neta || 0) >= 0 ? '+' : ''}{(apuesta.ganancia_neta || 0).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Análisis */}
              {apuesta.analisis && (
                <div className="mt-4 pt-4 border-t border-[#334155]">
                  <p className="text-sm text-[#94A3B8]">
                    <span className="text-[#00D1B2] font-medium">Análisis IA:</span>{' '}
                    {apuesta.analisis}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Barra flotante de ganancia (mobile) */}
      <div className="fixed bottom-16 left-4 right-4 lg:hidden">
        <div className={`rounded-xl p-3 flex items-center justify-between ${
          stats.gananciaTotal >= 0 ? 'bg-[#00D1B2]/20 border border-[#00D1B2]/30' : 'bg-[#EF4444]/20 border border-[#EF4444]/30'
        }`}>
          <span className="text-white font-medium">Ganancia Neta Hoy</span>
          <span className={`text-xl font-bold font-mono ${
            stats.gananciaTotal >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'
          }`}>
            {stats.gananciaTotal >= 0 ? '+' : ''}${stats.gananciaTotal.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
