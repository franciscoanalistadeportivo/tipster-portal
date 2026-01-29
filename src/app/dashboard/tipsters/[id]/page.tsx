'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Target, Trophy, AlertTriangle } from 'lucide-react';
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
    stake_grok: number;
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tipster no encontrado</p>
        <Link href="/dashboard/tipsters" className="text-primary-600 hover:underline mt-2 inline-block">
          Volver a tipsters
        </Link>
      </div>
    );
  }

  const { tipster, estadisticas, historial } = data;

  const getRachaColor = (racha: number) => {
    if (racha >= 3) return 'text-green-600 bg-green-100';
    if (racha >= 0) return 'text-blue-600 bg-blue-100';
    if (racha >= -2) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getResultadoBadge = (resultado: string) => {
    switch (resultado) {
      case 'GANADA':
        return 'badge-success';
      case 'PERDIDA':
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Button */}
      <Link 
        href="/dashboard/tipsters" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Volver a Tipsters</span>
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tipster.alias}</h1>
            <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
              {tipster.deporte}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg ${getRachaColor(estadisticas.racha_actual)}`}>
              <p className="text-sm font-medium">Racha Actual</p>
              <p className="text-2xl font-bold">{estadisticas.racha_actual >= 0 ? '+' : ''}{estadisticas.racha_actual}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Total Apuestas</p>
          <p className="text-2xl font-bold text-gray-900">{estadisticas.total_apuestas}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Ganadas</p>
          <p className="text-2xl font-bold text-green-600">{estadisticas.ganadas}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Perdidas</p>
          <p className="text-2xl font-bold text-red-600">{estadisticas.perdidas}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">% Acierto</p>
          <p className="text-2xl font-bold text-primary-600">{estadisticas.porcentaje_acierto}%</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Mejor Racha</p>
          <p className="text-2xl font-bold text-green-600">+{estadisticas.mejor_racha}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Ganancia Total</p>
          <p className={`text-2xl font-bold ${estadisticas.ganancia_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(estadisticas.ganancia_total).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Historial */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Apuestas</h2>
        
        {historial.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay apuestas registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 text-sm font-medium text-gray-500">Fecha</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Apuesta</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Cuota</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Resultado</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Ganancia</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">IA</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {historial.map((apuesta, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900">
                      {new Date(apuesta.fecha).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-3 text-sm text-gray-900 max-w-xs truncate" title={apuesta.apuesta}>
                      {apuesta.apuesta}
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-900">
                      {apuesta.cuota}
                    </td>
                    <td className="py-3">
                      <span className={getResultadoBadge(apuesta.resultado)}>
                        {apuesta.resultado}
                      </span>
                    </td>
                    <td className={`py-3 text-sm font-medium ${apuesta.ganancia_neta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {apuesta.ganancia_neta >= 0 ? '+' : ''}${apuesta.ganancia_neta.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className={apuesta.filtro_claude === 'APROBADA' ? 'badge-success' : 'badge-danger'}>
                        {apuesta.filtro_claude}
                      </span>
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
