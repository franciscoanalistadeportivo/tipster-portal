'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, TrendingUp, TrendingDown, AlertTriangle, Target, Star } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error al cargar recomendaciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="h-7 w-7 text-primary-600" />
          Recomendaciones IA
        </h1>
        <p className="text-gray-600">Análisis inteligente basado en rendimiento</p>
      </div>

      {/* Top Tipsters del Mes */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Tipsters del Mes
        </h2>
        
        {data.top_tipsters.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay datos suficientes</p>
        ) : (
          <div className="space-y-4">
            {data.top_tipsters.map((tipster, index) => (
              <div 
                key={tipster.id} 
                className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                  index === 1 ? 'bg-gray-50 border border-gray-200' :
                  index === 2 ? 'bg-orange-50 border border-orange-200' : 'bg-white border'
                }`}
              >
                <div className="flex items-center gap-4 mb-3 md:mb-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-300 text-orange-800' : 'bg-primary-100 text-primary-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{tipster.alias}</p>
                    <p className="text-sm text-gray-500">{tipster.deporte}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Apuestas</p>
                    <p className="font-bold text-gray-900">{tipster.apuestas_mes}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Ganadas</p>
                    <p className="font-bold text-green-600">{tipster.ganadas}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Ganancia</p>
                    <p className="font-bold text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      ${tipster.ganancia_mes.toLocaleString()}
                    </p>
                  </div>
                  <Link 
                    href={`/dashboard/tipsters/${tipster.id}`}
                    className="btn-primary text-sm"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apuestas Más Seguras Hoy */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-green-500" />
          Apuestas Más Seguras Hoy
        </h2>
        
        {data.apuestas_seguras.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay apuestas seguras disponibles hoy</p>
        ) : (
          <div className="space-y-4">
            {data.apuestas_seguras.map((apuesta, index) => (
              <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="badge-success">Alta Confianza</span>
                    <span className="text-sm font-medium text-gray-600">
                      por {apuesta.tipster}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-primary-600">
                    Cuota {apuesta.cuota}
                  </span>
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">{apuesta.apuesta}</p>
                {apuesta.analisis && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Análisis:</span> {apuesta.analisis}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tipsters a Evitar */}
      {data.evitar.length > 0 && (
        <div className="card border-l-4 border-red-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Tipsters en Mala Racha (Precaución)
          </h2>
          
          <div className="space-y-3">
            {data.evitar.map((alerta, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-900">{alerta.alias}</span>
                <span className="badge-danger flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  Racha {alerta.racha}
                </span>
              </div>
            ))}
          </div>
          
          <p className="mt-4 text-sm text-gray-600">
            💡 Recomendamos reducir el stake o evitar temporalmente estos tipsters hasta que recuperen su racha.
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="card bg-primary-50 border border-primary-200">
        <h3 className="font-bold text-primary-900 mb-2">¿Cómo funciona el análisis IA?</h3>
        <ul className="text-sm text-primary-800 space-y-1">
          <li>• Evaluamos el rendimiento de los últimos 30 días</li>
          <li>• Calculamos probabilidades reales vs cuotas (EV+)</li>
          <li>• Identificamos patrones de rachas y consistencia</li>
          <li>• Las apuestas seguras son las aprobadas por IA de tipsters top</li>
        </ul>
      </div>
    </div>
  );
}
