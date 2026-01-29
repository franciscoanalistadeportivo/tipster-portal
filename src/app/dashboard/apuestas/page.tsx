'use client';

import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apuestasAPI } from '@/lib/api';

interface Apuesta {
  id: number;
  tipster_alias: string;
  deporte: string;
  apuesta: string;
  cuota: number;
  stake_tipster: number;
  stake_grok: number;
  resultado: string;
  filtro_claude: string;
  analisis: string;
}

export default function ApuestasPage() {
  const [apuestas, setApuestas] = useState<Apuesta[]>([]);
  const [fecha, setFecha] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'aprobadas' | 'pendientes'>('todas');

  useEffect(() => {
    const fetchApuestas = async () => {
      try {
        const response = await apuestasAPI.getHoy();
        setApuestas(response.apuestas || []);
        setFecha(response.fecha);
      } catch (error) {
        console.error('Error fetching apuestas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApuestas();
  }, []);

  const filteredApuestas = apuestas.filter((a) => {
    if (filter === 'aprobadas') return a.filtro_claude === 'APROBADA';
    if (filter === 'pendientes') return a.resultado === 'PENDIENTE';
    return true;
  });

  const getResultadoIcon = (resultado: string) => {
    switch (resultado) {
      case 'GANADA':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PERDIDA':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getDeporteBadge = (deporte: string) => {
    const colors: { [key: string]: string } = {
      Futbol: 'bg-green-100 text-green-800',
      Tenis: 'bg-yellow-100 text-yellow-800',
      NBA: 'bg-orange-100 text-orange-800',
      Voleibol: 'bg-blue-100 text-blue-800',
      Mixto: 'bg-purple-100 text-purple-800',
    };
    return colors[deporte] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apuestas del Día</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {fecha ? new Date(fecha).toLocaleDateString('es-CL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'Hoy'}
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('todas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'todas' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({apuestas.length})
          </button>
          <button
            onClick={() => setFilter('aprobadas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'aprobadas' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aprobadas IA
          </button>
          <button
            onClick={() => setFilter('pendientes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pendientes' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{apuestas.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Aprobadas IA</p>
          <p className="text-2xl font-bold text-green-600">
            {apuestas.filter((a) => a.filtro_claude === 'APROBADA').length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">
            {apuestas.filter((a) => a.resultado === 'PENDIENTE').length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Ganadas Hoy</p>
          <p className="text-2xl font-bold text-green-600">
            {apuestas.filter((a) => a.resultado === 'GANADA').length}
          </p>
        </div>
      </div>

      {/* Lista de Apuestas */}
      {filteredApuestas.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay apuestas {filter !== 'todas' ? 'con este filtro' : 'para hoy'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApuestas.map((apuesta) => (
            <div key={apuesta.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Info principal */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeporteBadge(apuesta.deporte)}`}>
                      {apuesta.deporte}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm font-medium text-primary-600">{apuesta.tipster_alias}</span>
                  </div>
                  <p className="text-lg font-medium text-gray-900">{apuesta.apuesta}</p>
                </div>

                {/* Cuota */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Cuota</p>
                    <p className="text-xl font-bold text-primary-600">{apuesta.cuota}</p>
                  </div>

                  {/* Stake */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Stake Grok</p>
                    <p className="text-lg font-bold text-gray-900">${apuesta.stake_grok.toLocaleString()}</p>
                  </div>

                  {/* Estado */}
                  <div className="flex items-center gap-2">
                    {getResultadoIcon(apuesta.resultado)}
                    <span className={`text-sm font-medium ${
                      apuesta.resultado === 'GANADA' ? 'text-green-600' :
                      apuesta.resultado === 'PERDIDA' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {apuesta.resultado}
                    </span>
                  </div>

                  {/* Filtro IA */}
                  <div>
                    <span className={apuesta.filtro_claude === 'APROBADA' ? 'badge-success' : 'badge-danger'}>
                      {apuesta.filtro_claude === 'APROBADA' ? '✓ IA' : '✗ IA'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Análisis IA */}
              {apuesta.analisis && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Análisis IA:</span> {apuesta.analisis}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
