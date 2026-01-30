'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Target, Trophy, Zap } from 'lucide-react';
import { tipstersAPI } from '@/lib/api';

interface TipsterDetail {
  tipster: {
    id: number;
    alias: string;
    deporte: string;
  };
  estadisticas: {
    total_apuestas: number;
    ganadas: number;
    perdidas: number;
    porcentaje_acierto: number;
    ganancia_total: number;
    mejor_racha: number;
    racha_actual: number;
  };
  historial: {
    fecha: string;
    apuesta: string;
    cuota: number;
    stake_tipster: number;
    stake_ia: number;
    resultado: string;
    ganancia_neta: number;
    filtro_claude: string;
    analisis: string;
  }[];
}

export default function TipsterDetailPage() {
  const params = useParams();
  const tipsterId = params.id as string;
  
  const [data, setData] = useState<TipsterDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTipster = async () => {
      try {
        const response = await tipstersAPI.getById(parseInt(tipsterId));
        setData(response);
      } catch (error) {
        console.error('Error fetching tipster:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (tipsterId) {
      fetchTipster();
    }
  }, [tipsterId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-[#94A3B8]">Tipster no encontrado</p>
        <Link href="/dashboard/tipsters" className="text-[#00D1B2] hover:underline mt-2 inline-block">
          Volver a tipsters
        </Link>
      </div>
    );
  }

  const { tipster, estadisticas, historial } = data;

  const getRachaColor = (racha: number) => {
    if (racha >= 3) return 'text-[#00D1B2] bg-[#00D1B2]/20 border border-[#00D1B2]/30';
    if (racha >= 0) return 'text-[#3B82F6] bg-[#3B82F6]/20 border border-[#3B82F6]/30';
    if (racha >= -2) return 'text-[#FFDD57] bg-[#FFDD57]/20 border border-[#FFDD57]/30';
    return 'text-[#EF4444] bg-[#EF4444]/20 border border-[#EF4444]/30';
  };

  const getResultadoBadge = (resultado: string) => {
    switch (resultado) {
      case 'GANADA':
        return 'px-3 py-1 rounded-full text-xs font-bold bg-[#00D1B2]/20 text-[#00D1B2] border border-[#00D1B2]/30';
      case 'PERDIDA':
        return 'px-3 py-1 rounded-full text-xs font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30';
      default:
        return 'px-3 py-1 rounded-full text-xs font-bold bg-[#FFDD57]/20 text-[#FFDD57] border border-[#FFDD57]/30';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Button */}
      <Link 
        href="/dashboard/tipsters" 
        className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Volver a Tipsters</span>
      </Link>

      {/* Header Card */}
      <div className="card-elite">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] flex items-center justify-center border border-[#334155]">
              <span className="text-2xl font-bold text-white">
                {tipster.alias.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{tipster.alias}</h1>
              <span className="inline-block mt-1 px-3 py-1 bg-[#1E293B] text-[#94A3B8] rounded-full text-sm font-medium border border-[#334155]">
                {tipster.deporte}
              </span>
            </div>
          </div>
          <div className={`px-5 py-3 rounded-xl ${getRachaColor(estadisticas.racha_actual)}`}>
            <p className="text-xs font-medium opacity-80">Racha Actual</p>
            <p className="text-2xl font-bold font-mono">
              {estadisticas.racha_actual >= 0 ? '+' : ''}{estadisticas.racha_actual}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card-elite text-center">
          <Target className="h-5 w-5 text-[#94A3B8] mx-auto mb-2" />
          <p className="text-xs text-[#94A3B8] mb-1">Total Apuestas</p>
          <p className="text-2xl font-bold text-white font-mono">{estadisticas.total_apuestas}</p>
        </div>
        <div className="card-elite text-center">
          <TrendingUp className="h-5 w-5 text-[#00D1B2] mx-auto mb-2" />
          <p className="text-xs text-[#94A3B8] mb-1">Ganadas</p>
          <p className="text-2xl font-bold text-[#00D1B2] font-mono">{estadisticas.ganadas}</p>
        </div>
        <div className="card-elite text-center">
          <TrendingDown className="h-5 w-5 text-[#EF4444] mx-auto mb-2" />
          <p className="text-xs text-[#94A3B8] mb-1">Perdidas</p>
          <p className="text-2xl font-bold text-[#EF4444] font-mono">{estadisticas.perdidas}</p>
        </div>
        <div className="card-elite text-center">
          <div className="w-5 h-5 rounded-full bg-[#3B82F6]/20 flex items-center justify-center mx-auto mb-2">
            <span className="text-[#3B82F6] text-xs font-bold">%</span>
          </div>
          <p className="text-xs text-[#94A3B8] mb-1">% Acierto</p>
          <p className="text-2xl font-bold text-[#3B82F6] font-mono">{estadisticas.porcentaje_acierto}%</p>
        </div>
        <div className="card-elite text-center">
          <Trophy className="h-5 w-5 text-[#FFDD57] mx-auto mb-2" />
          <p className="text-xs text-[#94A3B8] mb-1">Mejor Racha</p>
          <p className="text-2xl font-bold text-[#FFDD57] font-mono">+{estadisticas.mejor_racha}</p>
        </div>
        <div className="card-elite text-center">
          <Zap className="h-5 w-5 text-[#00D1B2] mx-auto mb-2" />
          <p className="text-xs text-[#94A3B8] mb-1">Ganancia Total</p>
          <p className={`text-2xl font-bold font-mono ${estadisticas.ganancia_total >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            ${Math.abs(estadisticas.ganancia_total).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Historial de Apuestas */}
      <div className="card-elite">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Historial de Apuestas</h2>
          <span className="text-sm text-[#94A3B8] font-mono">{historial.length} registros</span>
        </div>
        
        {historial.length === 0 ? (
          <p className="text-[#94A3B8] text-center py-8">No hay apuestas registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="pb-4 text-left text-sm font-semibold text-[#94A3B8]">Fecha</th>
                  <th className="pb-4 text-left text-sm font-semibold text-[#94A3B8]">Apuesta</th>
                  <th className="pb-4 text-left text-sm font-semibold text-[#94A3B8]">Cuota</th>
                  <th className="pb-4 text-left text-sm font-semibold text-[#94A3B8]">Resultado</th>
                  <th className="pb-4 text-left text-sm font-semibold text-[#94A3B8]">Ganancia</th>
                  <th className="pb-4 text-left text-sm font-semibold text-[#94A3B8]">IA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {historial.map((apuesta, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-[#1E293B]/50 transition-colors"
                  >
                    <td className="py-4 text-sm text-white font-mono">
                      {new Date(apuesta.fecha).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-4 text-sm text-white max-w-xs">
                      <span className="block truncate" title={apuesta.apuesta}>
                        {apuesta.apuesta}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-bold text-[#FFDD57] font-mono">
                      {apuesta.cuota}
                    </td>
                    <td className="py-4">
                      <span className={getResultadoBadge(apuesta.resultado)}>
                        {apuesta.resultado}
                      </span>
                    </td>
                    <td className={`py-4 text-sm font-bold font-mono ${apuesta.ganancia_neta >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
                      {apuesta.ganancia_neta >= 0 ? '+' : ''}${apuesta.ganancia_neta.toLocaleString()}
                    </td>
                    <td className="py-4">
                      {apuesta.filtro_claude === 'APROBADA' ? (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#00D1B2]/20 text-[#00D1B2] border border-[#00D1B2]/30">
                          ✓ IA
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30">
                          ✗ IA
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
