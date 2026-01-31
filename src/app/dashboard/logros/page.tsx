'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Award, Trophy, Star, Lock, CheckCircle, ChevronLeft,
  Flame, Target, TrendingUp, Zap
} from 'lucide-react';
import { logrosAPI } from '@/lib/api';

interface Logro {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  categoria: string;
  puntos: number;
  desbloqueado: boolean;
  desbloqueado_at: string | null;
}

interface LogrosData {
  logros: Logro[];
  puntos_totales: number;
  total_desbloqueados: number;
  total_logros: number;
}

// Mapeo de iconos
const getIcono = (icono: string) => {
  const iconMap: { [key: string]: string } = {
    '🎯': '🎯',
    '🏆': '🏆',
    '🔥': '🔥',
    '⭐': '⭐',
    '💰': '💰',
    '📈': '📈',
    '🎖️': '🎖️',
    '👑': '👑',
    '💎': '💎',
    '🚀': '🚀',
    '💪': '💪',
    '🌟': '🌟',
  };
  return iconMap[icono] || '🏅';
};

// Categorías
const CATEGORIAS = [
  { id: 'inicio', nombre: 'Primeros Pasos', color: 'blue' },
  { id: 'volumen', nombre: 'Volumen', color: 'purple' },
  { id: 'racha', nombre: 'Rachas', color: 'orange' },
  { id: 'profit', nombre: 'Profit', color: 'green' },
  { id: 'winrate', nombre: 'Win Rate', color: 'cyan' },
  { id: 'especial', nombre: 'Especiales', color: 'gold' },
];

export default function LogrosPage() {
  const [data, setData] = useState<LogrosData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogros = async () => {
      try {
        const response = await logrosAPI.getMisLogros();
        setData(response);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogros();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const logrosFiltrados = selectedCategoria 
    ? data.logros.filter(l => l.categoria === selectedCategoria)
    : data.logros;

  const categoriasCounts = CATEGORIAS.map(cat => ({
    ...cat,
    total: data.logros.filter(l => l.categoria === cat.id).length,
    desbloqueados: data.logros.filter(l => l.categoria === cat.id && l.desbloqueado).length
  }));

  return (
    <div className="space-y-6 animate-fadeIn pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/mi-banca" className="p-2 rounded-lg hover:bg-[#1E293B] transition-all">
          <ChevronLeft className="h-5 w-5 text-[#94A3B8]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-[#FFDD57]" />
            Mis Logros
          </h1>
          <p className="text-[#94A3B8] mt-1">
            Desbloquea badges y gana puntos
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="card-premium">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFDD57]/10 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-[#FFDD57]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white font-mono">{data.puntos_totales}</p>
              <p className="text-[#94A3B8]">Puntos totales</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#00D1B2] font-mono">{data.total_desbloqueados}</p>
              <p className="text-xs text-[#94A3B8]">Desbloqueados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#64748B] font-mono">{data.total_logros - data.total_desbloqueados}</p>
              <p className="text-xs text-[#94A3B8]">Por desbloquear</p>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#94A3B8]">Progreso total</span>
            <span className="text-white">{Math.round((data.total_desbloqueados / data.total_logros) * 100)}%</span>
          </div>
          <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FFDD57] to-[#00D1B2] rounded-full transition-all duration-500"
              style={{ width: `${(data.total_desbloqueados / data.total_logros) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Categorías */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategoria(null)}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            !selectedCategoria
              ? 'bg-[#00D1B2] text-white'
              : 'bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]'
          }`}
        >
          Todos ({data.total_logros})
        </button>
        {categoriasCounts.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoria(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCategoria === cat.id
                ? 'bg-[#00D1B2] text-white'
                : 'bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]'
            }`}
          >
            {cat.nombre}
            <span className="text-xs opacity-70">{cat.desbloqueados}/{cat.total}</span>
          </button>
        ))}
      </div>

      {/* Grid de Logros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {logrosFiltrados.map((logro, index) => (
          <div
            key={logro.id}
            className={`card-elite animate-fadeInUp relative overflow-hidden ${
              logro.desbloqueado 
                ? 'border-[#00D1B2]/30' 
                : 'opacity-60'
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Badge desbloqueado */}
            {logro.desbloqueado && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="h-5 w-5 text-[#00D1B2]" />
              </div>
            )}
            
            {/* Lock para bloqueados */}
            {!logro.desbloqueado && (
              <div className="absolute top-3 right-3">
                <Lock className="h-5 w-5 text-[#64748B]" />
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Icono */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                logro.desbloqueado 
                  ? 'bg-[#FFDD57]/10' 
                  : 'bg-[#1E293B]'
              }`}>
                {logro.desbloqueado ? getIcono(logro.icono) : '🔒'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold ${logro.desbloqueado ? 'text-white' : 'text-[#64748B]'}`}>
                  {logro.nombre}
                </h3>
                <p className="text-sm text-[#94A3B8] mt-1">{logro.descripcion}</p>
                
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    logro.desbloqueado 
                      ? 'bg-[#FFDD57]/10 text-[#FFDD57]' 
                      : 'bg-[#1E293B] text-[#64748B]'
                  }`}>
                    +{logro.puntos} pts
                  </span>
                  
                  {logro.desbloqueado && logro.desbloqueado_at && (
                    <span className="text-xs text-[#64748B]">
                      {new Date(logro.desbloqueado_at).toLocaleDateString('es-CL')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {logrosFiltrados.length === 0 && (
        <div className="card-elite text-center py-16">
          <Award className="h-12 w-12 text-[#334155] mx-auto mb-4" />
          <p className="text-[#94A3B8]">No hay logros en esta categoría</p>
        </div>
      )}

      {/* Motivational footer */}
      <div className="text-center text-sm text-[#64748B] pt-4 border-t border-slate-800/50">
        💪 Sigue apostando para desbloquear más logros y ganar puntos
      </div>
    </div>
  );
}
