'use client';

import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Brain, Zap } from 'lucide-react';
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
  filtro_claude: string;
  analisis: string;
}

export default function ApuestasPage() {
  const [apuestas, setApuestas] = useState<Apuesta[]>([]);
  const [fecha, setFecha] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'aprobadas' | 'pendientes'>('todas');

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
    if (filter === 'aprobadas') return a.filtro_claude === 'APROBADA';
    if (filter === 'pendientes') return a.resultado === 'PENDIENTE';
    return true;
  });

  const getRowClass = (resultado: string) => {
    switch (resultado) {
      case 'GANADA':
        return 'row-won';
      case 'PERDIDA':
        return 'row-lost';
      default:
        return 'row-pending';
    }
  };

  const getResultadoIcon = (resultado: string) => {
    switch (resultado) {
      case 'GANADA':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'PERDIDA':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-amber-400" />;
    }
  };

  const getDeporteBadgeClass = (deporte: string) => {
    const map: { [key: string]: string } = {
      Futbol: 'badge-sport futbol',
      Tenis: 'badge-sport tenis',
      NBA: 'badge-sport nba',
      Voleibol: 'badge-sport voleibol',
      Mixto: 'badge-sport mixto',
    };
    return map[deporte] || 'badge-sport';
  };

  const stats = {
    total: apuestas.length,
    aprobadas: apuestas.filter(a => a.filtro_claude === 'APROBADA').length,
    pendientes: apuestas.filter(a => a.resultado === 'PENDIENTE').length,
    ganadas: apuestas.filter(a => a.resultado === 'GANADA').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Monitor de Apuestas</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {fecha ? new Date(fecha).toLocaleDateString('es-CL', { 
              weekday: 'long', 
              day: 'numeric',
              month: 'long'
            }) : 'Hoy'}
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {[
            { key: 'todas', label: `Todas (${stats.total})` },
            { key: 'aprobadas', label: `IA ✓ (${stats.aprobadas})` },
            { key: 'pendientes', label: `Live (${stats.pendientes})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.key
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="stat-card py-3">
          <p className="text-2xl font-bold text-white font-mono text-center">{stats.total}</p>
          <p className="text-[10px] text-slate-500 uppercase text-center mt-1">Total</p>
        </div>
        <div className="stat-card py-3">
          <p className="text-2xl font-bold text-emerald-400 font-mono text-center">{stats.aprobadas}</p>
          <p className="text-[10px] text-slate-500 uppercase text-center mt-1">IA Aprobadas</p>
        </div>
        <div className="stat-card py-3">
          <p className="text-2xl font-bold text-amber-400 font-mono text-center">{stats.pendientes}</p>
          <p className="text-[10px] text-slate-500 uppercase text-center mt-1">Pendientes</p>
        </div>
        <div className="stat-card py-3">
          <p className="text-2xl font-bold text-emerald-400 font-mono text-center">{stats.ganadas}</p>
          <p className="text-[10px] text-slate-500 uppercase text-center mt-1">Ganadas</p>
        </div>
      </div>

      {/* Lista de Apuestas */}
      {filteredApuestas.length === 0 ? (
        <div className="card-ops text-center py-16">
          <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500">No hay apuestas {filter !== 'todas' ? 'con este filtro' : 'para hoy'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApuestas.map((apuesta, index) => (
            <div 
              key={apuesta.id} 
              className={`card-ops ${getRowClass(apuesta.resultado)} table-row-hover animate-fadeInUp`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={getDeporteBadgeClass(apuesta.deporte)}>
                      {apuesta.deporte}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-sm text-emerald-400 font-medium">{apuesta.tipster_alias}</span>
                  </div>
                  <p className="text-white font-medium">{apuesta.apuesta}</p>
                </div>

                {/* Datos numéricos */}
                <div className="flex items-center gap-6 lg:gap-8">
                  {/* Cuota */}
                  <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase">Cuota</p>
                    <p className="text-xl font-bold text-white font-mono">{apuesta.cuota}</p>
                  </div>

                  {/* Stake */}
                  <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase">Stake</p>
                    <p className="text-lg font-bold text-slate-300 font-mono">
                      ${apuesta.stake_grok.toLocaleString()}
                    </p>
                  </div>

                  {/* Resultado */}
                  <div className="flex items-center gap-2 min-w-[100px]">
                    {getResultadoIcon(apuesta.resultado)}
                    <span className={`text-sm font-medium font-mono ${
                      apuesta.resultado === 'GANADA' ? 'text-emerald-400' :
                      apuesta.resultado === 'PERDIDA' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {apuesta.resultado}
                    </span>
                  </div>

                  {/* Filtro IA */}
                  <div>
                    {apuesta.filtro_claude === 'APROBADA' ? (
                      <span className="badge-ia">
                        <Brain className="h-3.5 w-3.5 animate-glow" />
                        IA ✓
                      </span>
                    ) : (
                      <span className="badge-ia-rejected">
                        <Brain className="h-3.5 w-3.5" />
                        IA ✗
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Análisis IA */}
              {apuesta.analisis && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <p className="text-sm text-slate-400">
                    <span className="text-emerald-400 font-medium">Análisis IA:</span>{' '}
                    {apuesta.analisis}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Status */}
      <div className="flex items-center justify-between text-xs text-slate-600 pt-4 border-t border-slate-800/50">
        <span className="font-mono">Mostrando {filteredApuestas.length} de {apuestas.length}</span>
        <span className="font-mono flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-emerald-500" />
          Actualización automática
        </span>
      </div>
    </div>
  );
}
