'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, Filter, ChevronRight } from 'lucide-react';
import { tipstersAPI } from '@/lib/api';

interface Tipster {
  id: number;
  alias: string;
  deporte: string;
  total_apuestas: number;
  ganadas: number;
  perdidas: number;
  porcentaje_acierto: number;
  ganancia_total: number;
}

// Componente Sparkline SVG
const Sparkline = ({ positive }: { positive: boolean }) => {
  // Generar datos aleatorios para demostración
  const points = Array.from({ length: 7 }, () => Math.random() * 40 + 10);
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  
  const normalized = points.map((p, i) => ({
    x: (i / 6) * 60,
    y: 30 - ((p - min) / range) * 25
  }));
  
  const pathD = normalized.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, '');

  return (
    <svg width="60" height="30" viewBox="0 0 60 30" className="opacity-80">
      <path
        d={pathD}
        className={positive ? 'sparkline-positive' : 'sparkline-negative'}
      />
    </svg>
  );
};

export default function TipstersPage() {
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const [filteredTipsters, setFilteredTipsters] = useState<Tipster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deporteFilter, setDeporteFilter] = useState('Todos');

  useEffect(() => {
    const fetchTipsters = async () => {
      try {
        const response = await tipstersAPI.getAll();
        setTipsters(response.tipsters || []);
        setFilteredTipsters(response.tipsters || []);
      } catch (error) {
        console.error('Error fetching tipsters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTipsters();
  }, []);

  useEffect(() => {
    let filtered = tipsters;

    if (search) {
      filtered = filtered.filter((t) =>
        t.alias.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (deporteFilter !== 'Todos') {
      filtered = filtered.filter((t) => t.deporte === deporteFilter);
    }

    setFilteredTipsters(filtered);
  }, [search, deporteFilter, tipsters]);

  const deportes = ['Todos', ...Array.from(new Set(tipsters.map((t) => t.deporte)))];

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
      <div>
        <h1 className="text-2xl font-bold text-white">Directorio de Tipsters</h1>
        <p className="text-slate-500 text-sm mt-1">
          <span className="font-mono text-slate-400">{filteredTipsters.length}</span> operadores activos
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tipster..."
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
          <select
            value={deporteFilter}
            onChange={(e) => setDeporteFilter(e.target.value)}
            className="input-field pl-10 pr-8 py-2.5 text-sm appearance-none cursor-pointer min-w-[150px]"
          >
            {deportes.map((deporte) => (
              <option key={deporte} value={deporte}>
                {deporte}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Tipsters */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTipsters.map((tipster, index) => (
          <div
            key={tipster.id}
            className="card-ops group animate-fadeInUp relative"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Badge deporte - esquina superior derecha */}
            <div className="absolute top-4 right-4">
              <span className={getDeporteBadgeClass(tipster.deporte)}>
                {tipster.deporte}
              </span>
            </div>

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {tipster.alias.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0 pr-16">
                <h3 className="font-semibold text-white truncate">{tipster.alias}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {tipster.total_apuestas} operaciones
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 rounded-lg bg-slate-800/50">
                <p className="text-lg font-bold text-white font-mono">{tipster.porcentaje_acierto}%</p>
                <p className="text-[10px] text-slate-500 uppercase">Win Rate</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-800/50">
                <p className="text-lg font-bold text-emerald-400 font-mono">{tipster.ganadas}</p>
                <p className="text-[10px] text-slate-500 uppercase">Ganadas</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-800/50">
                <p className="text-lg font-bold text-red-400 font-mono">{tipster.perdidas}</p>
                <p className="text-[10px] text-slate-500 uppercase">Perdidas</p>
              </div>
            </div>

            {/* Ganancia + Sparkline */}
            <div className="flex items-center justify-between py-3 border-t border-slate-700/50">
              <div>
                <p className="text-xs text-slate-500">Ganancia Total</p>
                <p className={`text-lg font-bold font-mono flex items-center gap-1 ${
                  tipster.ganancia_total >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {tipster.ganancia_total >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  ${Math.abs(tipster.ganancia_total).toLocaleString()}
                </p>
              </div>
              <Sparkline positive={tipster.ganancia_total >= 0} />
            </div>

            {/* Botón */}
            <Link
              href={`/dashboard/tipsters/${tipster.id}`}
              className="btn-outline w-full mt-3 text-sm py-2 flex items-center justify-center gap-2 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white"
            >
              Ver Perfil
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      {filteredTipsters.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500">No se encontraron tipsters</p>
        </div>
      )}
    </div>
  );
}
