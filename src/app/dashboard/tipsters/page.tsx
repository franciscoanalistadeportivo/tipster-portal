'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, Filter } from 'lucide-react';
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

  // Filtrar tipsters
  useEffect(() => {
    let filtered = tipsters;

    // Filtro por búsqueda
    if (search) {
      filtered = filtered.filter((t) =>
        t.alias.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtro por deporte
    if (deporteFilter !== 'Todos') {
      filtered = filtered.filter((t) => t.deporte === deporteFilter);
    }

    setFilteredTipsters(filtered);
  }, [search, deporteFilter, tipsters]);

  // Obtener deportes únicos
  const deportes = ['Todos', ...Array.from(new Set(tipsters.map((t) => t.deporte)))];

  // Función para obtener el color según el porcentaje
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Función para obtener badge de deporte
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tipsters</h1>
        <p className="text-gray-600">Explora y analiza el rendimiento de cada tipster</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tipster..."
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={deporteFilter}
            onChange={(e) => setDeporteFilter(e.target.value)}
            className="input-field pl-10 pr-8 appearance-none cursor-pointer"
          >
            {deportes.map((deporte) => (
              <option key={deporte} value={deporte}>
                {deporte}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Tipsters */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTipsters.map((tipster) => (
          <Link
            key={tipster.id}
            href={`/dashboard/tipsters/${tipster.id}`}
            className="card hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{tipster.alias}</h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getDeporteBadge(tipster.deporte)}`}>
                  {tipster.deporte}
                </span>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-bold ${getPercentageColor(tipster.porcentaje_acierto)}`}>
                  {tipster.porcentaje_acierto}%
                </span>
                <p className="text-xs text-gray-500">Aciertos</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{tipster.total_apuestas}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{tipster.ganadas}</p>
                <p className="text-xs text-gray-500">Ganadas</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">{tipster.perdidas}</p>
                <p className="text-xs text-gray-500">Perdidas</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Ganancia Total</span>
              <span className={`text-lg font-bold flex items-center gap-1 ${tipster.ganancia_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tipster.ganancia_total >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                ${Math.abs(tipster.ganancia_total).toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filteredTipsters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron tipsters</p>
        </div>
      )}
    </div>
  );
}
