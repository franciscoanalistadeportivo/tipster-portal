'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Zap, Star, TrendingUp, TrendingDown, Target, AlertTriangle,
  CheckCircle, XCircle, Clock, Flame, ChevronRight, Sparkles,
  BarChart3, Shield
} from 'lucide-react';
import { tipstersAPI, apuestasAPI, bancaAPI } from '@/lib/api';

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

interface Apuesta {
  id: number;
  tipster_alias: string;
  apuesta: string;
  cuota: number;
  stake_ia: number;
  resultado: string;
  filtro_claude: string;
}

interface RecomendacionTipster {
  tipster: Tipster;
  score: number;
  racha: number;
  tendencia: 'up' | 'down' | 'stable';
  motivo: string;
}

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

const calcularScore = (tipster: Tipster): number => {
  const winRate = tipster.porcentaje_acierto;
  const rentabilidad = tipster.ganancia_total > 0 ? 1 : 0;
  const volumen = Math.min(tipster.total_apuestas / 100, 1);
  
  return Math.round((winRate * 0.5 + rentabilidad * 30 + volumen * 20));
};

export default function RecomendacionesPage() {
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const [apuestasHoy, setApuestasHoy] = useState<Apuesta[]>([]);
  const [banca, setBanca] = useState(500000);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tipstersData, apuestasData, bancaData] = await Promise.all([
          tipstersAPI.getAll(),
          apuestasAPI.getHoy(),
          bancaAPI.get().catch(() => ({ banca: 500000 }))
        ]);
        
        setTipsters(tipstersData.tipsters || []);
        setApuestasHoy(apuestasData.apuestas || []);
        setBanca(bancaData.banca || 500000);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcular recomendaciones
  const recomendacionesSeguir: RecomendacionTipster[] = tipsters
    .filter(t => t.porcentaje_acierto >= 55 && t.ganancia_total > 0)
    .map(t => {
      const tendencia: 'up' | 'down' | 'stable' = t.ganancia_total > 0 ? 'up' : 'stable';
      return {
        tipster: t,
        score: calcularScore(t),
        racha: 0,
        tendencia,
        motivo: t.porcentaje_acierto >= 65 
          ? `Win rate excepcional (${t.porcentaje_acierto}%)` 
          : `Rentabilidad consistente (+$${t.ganancia_total.toLocaleString()})`
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const recomendacionesEvitar: RecomendacionTipster[] = tipsters
    .filter(t => t.porcentaje_acierto < 50 || t.ganancia_total < -50000)
    .map(t => {
      const tendencia: 'up' | 'down' | 'stable' = 'down';
      return {
        tipster: t,
        score: calcularScore(t),
        racha: 0,
        tendencia,
        motivo: t.porcentaje_acierto < 45 
          ? `Win rate bajo (${t.porcentaje_acierto}%)` 
          : `Pérdidas acumuladas ($${Math.abs(t.ganancia_total).toLocaleString()})`
      };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const apuestasIAAprobadas = apuestasHoy.filter(a => 
    a.filtro_claude === 'APROBADA' && a.resultado === 'PENDIENTE'
  );

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
            <Sparkles className="h-6 w-6 text-[#FFDD57]" />
            Recomendaciones IA
          </h1>
          <p className="text-[#94A3B8] mt-1">
            Análisis inteligente basado en rendimiento
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <span className="w-2 h-2 bg-[#00D1B2] rounded-full animate-pulse"></span>
          Actualizado ahora
        </div>
      </div>

      {/* Picks del día aprobados por IA */}
      {apuestasIAAprobadas.length > 0 && (
        <div className="card-premium animate-fadeInUp">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-[#FFDD57]" />
            <h2 className="font-bold text-white">Picks IA del Día</h2>
            <span className="ml-auto badge-ia">{apuestasIAAprobadas.length} activos</span>
          </div>
          
          <div className="space-y-3">
            {apuestasIAAprobadas.slice(0, 5).map((apuesta) => (
              <div 
                key={apuesta.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A] border border-[#FFDD57]/10"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-[#00D1B2] font-medium">{apuesta.tipster_alias}</span>
                    <span className="badge-ia text-[10px]">
                      <Star className="h-3 w-3" />
                      Aprobada
                    </span>
                  </div>
                  <p className="text-white text-sm truncate">{apuesta.apuesta}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xl font-bold text-white font-mono">@{apuesta.cuota}</p>
                  <p className="text-xs text-[#00D1B2]">${apuesta.stake_ia?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Link 
            href="/dashboard/apuestas"
            className="mt-4 flex items-center justify-center gap-2 text-[#FFDD57] text-sm hover:underline"
          >
            Ver todas las apuestas del día
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Tipsters recomendados */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Seguir */}
        <div className="card-elite border-[#00D1B2]/20 animate-fadeInUp">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-[#00D1B2]/10">
              <TrendingUp className="h-5 w-5 text-[#00D1B2]" />
            </div>
            <div>
              <h2 className="font-bold text-white">Tipsters para Seguir</h2>
              <p className="text-xs text-[#94A3B8]">Alto rendimiento comprobado</p>
            </div>
          </div>

          {recomendacionesSeguir.length > 0 ? (
            <div className="space-y-3">
              {recomendacionesSeguir.map((rec, index) => (
                <Link
                  key={rec.tipster.id}
                  href={`/dashboard/tipsters/${rec.tipster.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#00D1B2]/5 border border-[#00D1B2]/10 hover:border-[#00D1B2]/30 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-[#FFDD57]/10 text-[#FFDD57]' : 'bg-[#1E293B] text-[#64748B]'
                  }`}>
                    {index === 0 ? '🥇' : `#${index + 1}`}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getDeporteIcon(rec.tipster.deporte)}</span>
                      <span className="text-white font-medium truncate">{rec.tipster.alias}</span>
                    </div>
                    <p className="text-xs text-[#94A3B8]">{rec.motivo}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[#00D1B2] font-bold font-mono">{rec.tipster.porcentaje_acierto}%</p>
                    <p className="text-xs text-[#64748B]">Win Rate</p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-[#64748B] group-hover:text-[#00D1B2] transition-all" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[#94A3B8] text-sm text-center py-8">
              No hay suficientes datos para generar recomendaciones
            </p>
          )}
        </div>

        {/* Evitar */}
        <div className="card-elite border-[#EF4444]/20 animate-fadeInUp stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-[#EF4444]/10">
              <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
            </div>
            <div>
              <h2 className="font-bold text-white">Zona de Riesgo</h2>
              <p className="text-xs text-[#94A3B8]">Considerar evitar o reducir stake</p>
            </div>
          </div>

          {recomendacionesEvitar.length > 0 ? (
            <div className="space-y-3">
              {recomendacionesEvitar.map((rec) => (
                <Link
                  key={rec.tipster.id}
                  href={`/dashboard/tipsters/${rec.tipster.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#EF4444]/5 border border-[#EF4444]/10 hover:border-[#EF4444]/30 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-[#EF4444]" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getDeporteIcon(rec.tipster.deporte)}</span>
                      <span className="text-white font-medium truncate">{rec.tipster.alias}</span>
                    </div>
                    <p className="text-xs text-[#EF4444]">{rec.motivo}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[#EF4444] font-bold font-mono">{rec.tipster.porcentaje_acierto}%</p>
                    <p className="text-xs text-[#64748B]">Win Rate</p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-[#64748B] group-hover:text-[#EF4444] transition-all" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-10 w-10 text-[#00D1B2] mx-auto mb-2" />
              <p className="text-[#94A3B8] text-sm">
                ¡Excelente! Todos los tipsters están rindiendo bien
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Consejos generales */}
      <div className="card-elite animate-fadeInUp stagger-2">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-[#FFDD57]" />
          <h2 className="font-bold text-white">Consejos del Sistema</h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0F172A]">
            <p className="text-[#00D1B2] font-medium mb-1">📊 Diversifica</p>
            <p className="text-sm text-[#94A3B8]">
              No apuestes más del 30% de tu banca en un solo tipster
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0F172A]">
            <p className="text-[#FFDD57] font-medium mb-1">🎯 Sigue las rachas</p>
            <p className="text-sm text-[#94A3B8]">
              Aumenta stake en tipsters con racha positiva W3+
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0F172A]">
            <p className="text-[#EF4444] font-medium mb-1">⚠️ Gestiona riesgo</p>
            <p className="text-sm text-[#94A3B8]">
              Reduce o pausa tipsters con racha negativa L3+
            </p>
          </div>
        </div>
      </div>

      {/* Tu banca */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[#1E293B] border border-[#334155]">
        <div>
          <p className="text-[#94A3B8] text-sm">Tu banca actual</p>
          <p className="text-2xl font-bold text-white font-mono">${banca.toLocaleString()}</p>
        </div>
        <Link
          href="/dashboard/mi-banca"
          className="px-4 py-2 rounded-lg bg-[#00D1B2]/10 text-[#00D1B2] font-medium hover:bg-[#00D1B2]/20 transition-all"
        >
          Ver Mi Banca →
        </Link>
      </div>
    </div>
  );
}
