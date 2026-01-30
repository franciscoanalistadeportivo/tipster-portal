'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, Filter, ChevronRight, Trophy, Star } from 'lucide-react';
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

// Win Rate Circle Component
const WinRateCircle = ({ percentage }: { percentage: number }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="win-rate-circle">
      <svg width="60" height="60" viewBox="0 0 60 60">
        {/* Background circle */}
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke="#334155"
          strokeWidth="4"
        />
        {/* Progress circle */}
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke={percentage >= 60 ? '#00D1B2' : percentage >= 40 ? '#FFDD57' : '#EF4444'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <span className="percentage font-mono">{percentage}%</span>
    </div>
  );
};

// Sparkline Component
const Sparkline = ({ positive }: { positive: boolean }) => {
  const points = positive 
    ? "0,18 8,15 16,16 24,10 32,12 40,8 48,5 56,7 64,3"
    : "0,5 8,8 16,6 24,12 32,10 40,15 48,14 56,18 64,20";
  
  return (
    <svg width="70" height="25" viewBox="0 0 70 25" className="ml-auto">
      <polyline
        points={points}
        className={positive ? 'sparkline-up' : 'sparkline-down'}
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

  // Top 3 tipsters
  const topTipsters = [...tipsters]
    .sort((a, b) => b.ganancia_total - a.ganancia_total)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Directorio de Tipsters</h1>
        <p className="text-[#94A3B8] mt-1">
          <span className="font-mono text-[#00D1B2]">{filteredTipsters.length}</span> tipsters verificados
        </p>
      </div>

      {/* Top 3 Ranking */}
      <div className="grid md:grid-cols-3 gap-4">
        {topTipsters.map((tipster, idx) => (
          <div 
            key={tipster.id} 
            className={`card-elite relative overflow-hidden animate-fadeInUp stagger-${idx + 1} ${
              idx === 0 ? 'border-[#FFDD57]/30' : ''
            }`}
          >
            {/* Medal Badge */}
            <div className={`absolute top-3 right-3 p-1.5 rounded-full ${
              idx === 0 ? 'bg-[#FFDD57]/20' : idx === 1 ? 'bg-slate-400/20' : 'bg-amber-600/20'
            }`}>
              <Trophy className={`h-4 w-4 ${
                idx === 0 ? 'text-[#FFDD57]' : idx === 1 ? 'text-slate-400' : 'text-amber-600'
              }`} />
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                idx === 0 ? 'bg-[#FFDD57]/20 text-[#FFDD57]' : 
                idx === 1 ? 'bg-slate-400/20 text-slate-400' : 'bg-amber-600/20 text-amber-600'
              }`}>
                {idx + 1}
              </div>
              <div>
                <p className="font-bold text-white">{tipster.alias}</p>
                <p className="text-xs text-[#94A3B8]">{tipster.deporte}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[#00D1B2] font-mono font-bold flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +${tipster.ganancia_total.toLocaleString()}
              </span>
              <span className="text-xs text-[#94A3B8]">{tipster.porcentaje_acierto}% win</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tipster..."
            className="input-field pl-11"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {deportes.map((deporte) => (
            <button
              key={deporte}
              onClick={() => setDeporteFilter(deporte)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                deporteFilter === deporte
                  ? 'bg-[#00D1B2] text-white'
                  : 'bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]'
              }`}
            >
              {deporte}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tipsters */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTipsters.map((tipster, index) => (
          <div
            key={tipster.id}
            className="card-elite group animate-fadeInUp"
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#334155] flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {tipster.alias.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white">{tipster.alias}</h3>
                  <span className="badge-sport text-[#94A3B8]">{tipster.deporte}</span>
                </div>
              </div>
              <WinRateCircle percentage={tipster.porcentaje_acierto} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 rounded-lg bg-[#0F172A]">
                <p className="text-lg font-bold text-white font-mono">{tipster.total_apuestas}</p>
                <p className="text-[10px] text-[#94A3B8]">Total</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-[#0F172A]">
                <p className="text-lg font-bold text-[#00D1B2] font-mono">{tipster.ganadas}</p>
                <p className="text-[10px] text-[#94A3B8]">Ganadas</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-[#0F172A]">
                <p className="text-lg font-bold text-[#EF4444] font-mono">{tipster.perdidas}</p>
                <p className="text-[10px] text-[#94A3B8]">Perdidas</p>
              </div>
            </div>

            {/* Ganancia + Sparkline */}
            <div className="flex items-center justify-between py-3 border-t border-[#334155]">
              <div>
                <p className="text-xs text-[#94A3B8]">Ganancia Total</p>
                <p className={`text-xl font-bold font-mono flex items-center gap-1 ${
                  tipster.ganancia_total >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'
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

            {/* Button */}
            <Link
              href={`/dashboard/tipsters/${tipster.id}`}
              className="btn-outline w-full mt-3 flex items-center justify-center gap-2 group-hover:border-[#00D1B2] group-hover:text-[#00D1B2]"
            >
              Ver Perfil
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}
      </div>

      {filteredTipsters.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#94A3B8]">No se encontraron tipsters</p>
        </div>
      )}
    </div>
  );
}
