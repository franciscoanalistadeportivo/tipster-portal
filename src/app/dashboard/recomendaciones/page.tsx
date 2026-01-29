'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, TrendingUp, TrendingDown, AlertTriangle, Brain, Star, ChevronRight, Sparkles } from 'lucide-react';
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
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Error al cargar recomendaciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Brain className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Análisis IA</h1>
          <p className="text-slate-500 text-sm">Recomendaciones basadas en rendimiento</p>
        </div>
      </div>

      {/* Top Tipster Destacado */}
      {data.top_tipsters.length > 0 && (
        <div className="card-featured animate-fadeInUp">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-400" />
            <span className="text-amber-400 font-semibold text-sm">TOP PERFORMER DEL MES</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/30">
                <span className="text-2xl font-bold text-amber-400">
                  {data.top_tipsters[0].alias.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{data.top_tipsters[0].alias}</h3>
                <p className="text-sm text-slate-500">{data.top_tipsters[0].deporte}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase">Apuestas</p>
                <p className="text-xl font-bold text-white font-mono">{data.top_tipsters[0].apuestas_mes}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase">Ganadas</p>
                <p className="text-xl font-bold text-emerald-400 font-mono">{data.top_tipsters[0].ganadas}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase">Ganancia</p>
                <p className="text-xl font-bold text-emerald-400 font-mono flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  ${data.top_tipsters[0].ganancia_mes.toLocaleString()}
                </p>
              </div>
              <Link 
                href={`/dashboard/tipsters/${data.top_tipsters[0].id}`}
                className="btn-outline text-sm hidden sm:flex items-center gap-1"
              >
                Ver Perfil
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ranking Top Tipsters */}
        <div className="card-ops animate-fadeInUp stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-amber-400" />
            <h2 className="font-semibold text-white">Ranking del Mes</h2>
          </div>
          
          {data.top_tipsters.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No hay datos suficientes</p>
          ) : (
            <div className="space-y-2">
              {data.top_tipsters.slice(1).map((tipster, index) => (
                <Link
                  key={tipster.id}
                  href={`/dashboard/tipsters/${tipster.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors table-row-hover"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {index + 2}
                    </span>
                    <div>
                      <p className="font-medium text-white text-sm">{tipster.alias}</p>
                      <p className="text-xs text-slate-500">{tipster.deporte}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-mono font-bold text-sm">
                      +${tipster.ganancia_mes.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">{tipster.ganadas}W / {tipster.apuestas_mes}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Apuestas Seguras */}
        <div className="card-ops animate-fadeInUp stagger-2">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h2 className="font-semibold text-white">Picks de Alta Confianza</h2>
          </div>
          
          {data.apuestas_seguras.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No hay picks disponibles hoy</p>
          ) : (
            <div className="space-y-3">
              {data.apuestas_seguras.map((apuesta, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge-success text-[10px]">ALTA CONFIANZA</span>
                    <span className="text-lg font-bold text-white font-mono">
                      @{apuesta.cuota}
                    </span>
                  </div>
                  <p className="text-white font-medium text-sm mb-1">{apuesta.apuesta}</p>
                  <p className="text-xs text-slate-500">
                    por <span className="text-emerald-400">{apuesta.tipster}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tipsters a Evitar */}
      {data.evitar.length > 0 && (
        <div className="card-ops border-l-4 border-l-red-500 animate-fadeInUp stagger-3">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h2 className="font-semibold text-white">Zona de Riesgo</h2>
            <span className="badge-danger ml-auto">Evitar</span>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.evitar.map((alerta, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10"
              >
                <span className="text-sm text-slate-300">{alerta.alias}</span>
                <span className="font-mono text-sm text-red-400 flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {alerta.racha}
                </span>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-slate-500 mt-4">
            💡 Reducir exposición hasta que recuperen racha positiva
          </p>
        </div>
      )}

      {/* Info Panel - Cómo funciona */}
      <div className="info-panel animate-fadeInUp stagger-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">¿Cómo funciona el análisis IA?</h3>
        </div>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            Evaluación de rendimiento en los últimos 30 días
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            Cálculo de probabilidades reales vs cuotas (Expected Value)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            Identificación de patrones de rachas y consistencia
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            Los picks "Alta Confianza" son aprobados por IA de tipsters top
          </li>
        </ul>
      </div>
    </div>
  );
}
