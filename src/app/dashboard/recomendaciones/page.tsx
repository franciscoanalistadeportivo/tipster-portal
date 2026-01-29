'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, TrendingUp, TrendingDown, AlertTriangle, Zap, Star, 
  ChevronRight, Brain, Target, Sparkles 
} from 'lucide-react';
import { recomendacionesAPI } from '@/lib/api';

interface TopTipster {
  id: number;
  alias: string;
  deporte: string;
  apuestas_mes: number;
  ganadas: number;
  ganancia_mes: number;
}

interface Alerta {
  alias: string;
  racha: number;
}

interface ApuestaSegura {
  apuesta: string;
  cuota: number;
  tipster: string;
  analisis: string;
}

interface Recomendaciones {
  top_tipsters: TopTipster[];
  evitar: Alerta[];
  apuestas_seguras: ApuestaSegura[];
}

export default function RecomendacionesPage() {
  const [data, setData] = useState<Recomendaciones | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecomendaciones = async () => {
      try {
        const response = await recomendacionesAPI.get();
        setData(response);
      } catch (error) {
        console.error('Error fetching recomendaciones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecomendaciones();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-[#94A3B8]">Error al cargar recomendaciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#FFDD57]/10">
          <Zap className="h-6 w-6 text-[#FFDD57]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Análisis IA</h1>
          <p className="text-[#94A3B8]">Picks de alta confianza powered by AI</p>
        </div>
      </div>

      {/* Top Performer Hero Card */}
      {data.top_tipsters.length > 0 && (
        <div className="card-premium animate-fadeInUp relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFDD57]/5 to-transparent rounded-2xl"></div>
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-[#FFDD57]" />
              <span className="text-[#FFDD57] font-bold text-sm uppercase tracking-wider">Top Performer del Mes</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFDD57]/20 to-[#FFDD57]/5 flex items-center justify-center border border-[#FFDD57]/30">
                  <span className="text-3xl font-bold text-[#FFDD57]">
                    {data.top_tipsters[0].alias.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{data.top_tipsters[0].alias}</h2>
                  <p className="text-[#94A3B8]">{data.top_tipsters[0].deporte}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-[#94A3B8]">Apuestas</p>
                  <p className="text-2xl font-bold text-white font-mono">{data.top_tipsters[0].apuestas_mes}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[#94A3B8]">Ganadas</p>
                  <p className="text-2xl font-bold text-[#00D1B2] font-mono">{data.top_tipsters[0].ganadas}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[#94A3B8]">Ganancia</p>
                  <p className="text-2xl font-bold text-[#00D1B2] font-mono flex items-center gap-1">
                    <TrendingUp className="h-5 w-5" />
                    +${data.top_tipsters[0].ganancia_mes.toLocaleString()}
                  </p>
                </div>
                <Link 
                  href={`/dashboard/tipsters/${data.top_tipsters[0].id}`}
                  className="btn-outline hidden md:flex items-center gap-2"
                >
                  Ver Perfil
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Picks de Alta Confianza */}
        <div className="card-elite animate-fadeInUp stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-[#00D1B2]" />
            <h2 className="font-bold text-white">Picks de Alta Confianza</h2>
          </div>
          
          {data.apuestas_seguras.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-10 w-10 text-[#334155] mx-auto mb-3" />
              <p className="text-[#94A3B8]">No hay picks disponibles hoy</p>
              <p className="text-xs text-[#64748B] mt-1">Próximos picks en unas horas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.apuestas_seguras.map((pick, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-xl border border-[#00D1B2]/20 bg-[#00D1B2]/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge-ia">
                      <Star className="h-3 w-3" />
                      ALTA CONFIANZA
                    </span>
                    <span className="text-xl font-bold text-white font-mono">
                      @{pick.cuota}
                    </span>
                  </div>
                  <p className="text-white font-medium mb-1">{pick.apuesta}</p>
                  <p className="text-xs text-[#94A3B8]">
                    por <span className="text-[#00D1B2]">{pick.tipster}</span>
                  </p>
                  {pick.analisis && (
                    <p className="text-xs text-[#64748B] mt-2 pt-2 border-t border-[#334155]">
                      {pick.analisis}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ranking Tipsters */}
        <div className="card-elite animate-fadeInUp stagger-2">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-[#FFDD57]" />
            <h2 className="font-bold text-white">Ranking del Mes</h2>
          </div>
          
          {data.top_tipsters.length <= 1 ? (
            <p className="text-[#94A3B8] text-center py-8">No hay datos suficientes</p>
          ) : (
            <div className="space-y-2">
              {data.top_tipsters.slice(1, 6).map((tipster, index) => (
                <Link
                  key={tipster.id}
                  href={`/dashboard/tipsters/${tipster.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] transition-colors table-row-hover"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-slate-400/20 text-slate-400' :
                      index === 1 ? 'bg-amber-600/20 text-amber-600' : 'bg-[#334155] text-[#94A3B8]'
                    }`}>
                      {index + 2}
                    </span>
                    <div>
                      <p className="font-medium text-white text-sm">{tipster.alias}</p>
                      <p className="text-xs text-[#64748B]">{tipster.deporte}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00D1B2] font-mono font-bold text-sm">
                      +${tipster.ganancia_mes.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#64748B]">{tipster.ganadas}W / {tipster.apuestas_mes}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zona de Riesgo */}
      {data.evitar.length > 0 && (
        <div className="card-elite border-l-4 border-l-[#EF4444] animate-fadeInUp stagger-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
              <h2 className="font-bold text-white">Zona de Riesgo</h2>
            </div>
            <span className="badge-danger">EVITAR</span>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.evitar.map((alerta, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-xl bg-[#EF4444]/5 border border-[#EF4444]/10"
              >
                <span className="text-sm text-white">{alerta.alias}</span>
                <span className="font-mono text-sm text-[#EF4444] flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {alerta.racha}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#64748B] mt-4">
            💡 Reducir exposición hasta recuperar racha positiva
          </p>
        </div>
      )}

      {/* Info Panel - Cómo funciona */}
      <div className="card-elite bg-[#1E293B]/50 animate-fadeInUp stagger-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-[#3B82F6]" />
          <h3 className="font-bold text-white">¿Cómo funciona el análisis IA?</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#00D1B2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[#00D1B2] text-xs font-bold">1</span>
            </div>
            <p className="text-[#94A3B8]">Evaluación de rendimiento últimos 30 días</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#00D1B2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[#00D1B2] text-xs font-bold">2</span>
            </div>
            <p className="text-[#94A3B8]">Cálculo de probabilidades reales vs cuotas (EV+)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#00D1B2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[#00D1B2] text-xs font-bold">3</span>
            </div>
            <p className="text-[#94A3B8]">Identificación de patrones y rachas</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#00D1B2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[#00D1B2] text-xs font-bold">4</span>
            </div>
            <p className="text-[#94A3B8]">Picks "Alta Confianza" = aprobados por IA de top tipsters</p>
          </div>
        </div>
      </div>
    </div>
  );
}
