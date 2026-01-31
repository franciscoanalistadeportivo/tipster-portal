'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, TrendingUp, TrendingDown, Trophy, ChevronRight,
  Star, Target, Flame, Search
} from 'lucide-react';
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

export default function TipstersPage() {
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'ganancia' | 'winrate' | 'apuestas'>('ganancia');

  useEffect(() => {
    const fetchTipsters = async () => {
      try {
        const response = await tipstersAPI.getAll();
        setTipsters(response.tipsters || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTipsters();
  }, []);

  const getDeporteIcon = (deporte: string) => {
    const icons: { [key: string]: string } = {
      'Futbol': '⚽',
      'Tenis': '🎾',
      'NBA': '🏀',
      'Voleibol': '🏐',
      'Mixto': '🎯',
      'eSports': '🎮'
    };
    return icons[deporte] || '🎯';
  };

  const filteredTipsters = tipsters
    .filter(t => t.alias.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'ganancia') return b.ganancia_total - a.ganancia_total;
      if (sortBy === 'winrate') return b.porcentaje_acierto - a.porcentaje_acierto;
      return b.total_apuestas - a.total_apuestas;
    });

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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-[#00D1B2]" />
            Tipsters
          </h1>
          <p className="text-[#94A3B8] mt-1">{tipsters.length} tipsters activos</p>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Buscar tipster..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-[#64748B] focus:border-[#00D1B2] outline-none"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'ganancia', label: 'Ganancia' },
            { key: 'winrate', label: 'Win Rate' },
            { key: 'apuestas', label: 'Apuestas' },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                sortBy === option.key
                  ? 'bg-[#00D1B2] text-white'
                  : 'bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-white font-mono">{tipsters.length}</p>
          <p className="text-xs text-[#94A3B8]">Tipsters</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-[#00D1B2] font-mono">
            {tipsters.reduce((acc, t) => acc + t.ganadas, 0)}
          </p>
          <p className="text-xs text-[#94A3B8]">Ganadas Total</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-white font-mono">
            {(tipsters.reduce((acc, t) => acc + t.porcentaje_acierto, 0) / tipsters.length || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-[#94A3B8]">Win Rate Prom.</p>
        </div>
      </div>

      {/* Lista de Tipsters */}
      {filteredTipsters.length === 0 ? (
        <div className="card-elite text-center py-16">
          <Users className="h-12 w-12 text-[#334155] mx-auto mb-4" />
          <p className="text-[#94A3B8]">No se encontraron tipsters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTipsters.map((tipster, index) => (
            <Link
              key={tipster.id}
              href={`/dashboard/tipsters/${tipster.id}`}
              className="card-elite group block animate-fadeInUp table-row-hover"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono ${
                  index === 0 ? 'bg-[#FFDD57]/10 text-[#FFDD57]' :
                  index === 1 ? 'bg-[#94A3B8]/10 text-[#94A3B8]' :
                  index === 2 ? 'bg-[#CD7F32]/10 text-[#CD7F32]' :
                  'bg-[#1E293B] text-[#64748B]'
                }`}>
                  {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getDeporteIcon(tipster.deporte)}</span>
                    <h3 className="text-white font-bold truncate">{tipster.alias}</h3>
                    {tipster.ganancia_total > 0 && (
                      <span className="badge-success text-[10px]">Rentable</span>
                    )}
                  </div>
                  <p className="text-sm text-[#94A3B8]">{tipster.deporte}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-[#94A3B8]">Win Rate</p>
                    <p className={`text-lg font-bold font-mono ${
                      tipster.porcentaje_acierto >= 60 ? 'text-[#00D1B2]' :
                      tipster.porcentaje_acierto >= 50 ? 'text-[#FFDD57]' : 'text-[#EF4444]'
                    }`}>
                      {tipster.porcentaje_acierto}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#94A3B8]">W/L</p>
                    <p className="text-lg font-bold text-white font-mono">
                      {tipster.ganadas}/{tipster.perdidas}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#94A3B8]">Profit</p>
                    <p className={`text-lg font-bold font-mono flex items-center gap-1 ${
                      tipster.ganancia_total >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'
                    }`}>
                      {tipster.ganancia_total >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {tipster.ganancia_total >= 0 ? '+' : ''}${Math.abs(tipster.ganancia_total).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="sm:hidden text-right">
                  <p className={`text-lg font-bold font-mono ${
                    tipster.ganancia_total >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'
                  }`}>
                    {tipster.ganancia_total >= 0 ? '+' : ''}${Math.abs(tipster.ganancia_total).toLocaleString()}
                  </p>
                  <p className="text-xs text-[#94A3B8]">{tipster.porcentaje_acierto}% WR</p>
                </div>

                <ChevronRight className="h-5 w-5 text-[#64748B] group-hover:text-[#00D1B2] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
