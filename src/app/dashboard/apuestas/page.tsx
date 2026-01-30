'use client';

import { useState, useEffect } from 'react';
import { Calendar, Search, Filter, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface Apuesta {
  id: number;
  tipster_alias: string;
  fecha: string;
  apuesta: string;
  cuota: number;
  stake_tipster: number;
  stake_grok: number;
  resultado: 'PENDIENTE' | 'GANADA' | 'PERDIDA';
  ganancia_neta: number;
  filtro_claude: string;
  analisis: string;
}

export default function AdminApuestasPage() {
  const [apuestas, setApuestas] = useState<Apuesta[]>([]);
  const [filteredApuestas, setFilteredApuestas] = useState<Apuesta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroResultado, setFiltroResultado] = useState<string>('TODOS');
  const [filtroTipster, setFiltroTipster] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [tipsters, setTipsters] = useState<string[]>([]);

  useEffect(() => {
    fetchApuestas();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [apuestas, filtroResultado, filtroTipster, busqueda]);

  const fetchApuestas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/apuestas`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const todas = data.apuestas || [];
        setApuestas(todas);

        // FIX: Usar Array.from() en lugar de spread operator con Set
        // Esto evita el error de TypeScript "Set can only be iterated with --downlevelIteration"
        const tipsterSet = new Set<string>();
        todas.forEach((a: Apuesta) => {
          if (a.tipster_alias) {
            tipsterSet.add(a.tipster_alias);
          }
        });
        const uniqueTipsters = Array.from(tipsterSet).sort();
        setTipsters(uniqueTipsters);
      }
    } catch (error) {
      console.error('Error fetching apuestas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtered = [...apuestas];

    if (filtroResultado !== 'TODOS') {
      filtered = filtered.filter(a => a.resultado === filtroResultado);
    }

    if (filtroTipster !== 'TODOS') {
      filtered = filtered.filter(a => a.tipster_alias === filtroTipster);
    }

    if (busqueda) {
      const search = busqueda.toLowerCase();
      filtered = filtered.filter(a => 
        a.apuesta.toLowerCase().includes(search) ||
        (a.tipster_alias && a.tipster_alias.toLowerCase().includes(search))
      );
    }

    setFilteredApuestas(filtered);
  };

  const actualizarResultado = async (id: number, resultado: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/apuestas/${id}/resultado`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ resultado })
        }
      );

      if (response.ok) {
        // Refrescar datos
        fetchApuestas();
      }
    } catch (error) {
      console.error('Error actualizando resultado:', error);
    }
  };

  const getResultadoIcon = (resultado: string) => {
    switch (resultado) {
      case 'GANADA':
        return <CheckCircle className="h-5 w-5 text-[#00FF88]" />;
      case 'PERDIDA':
        return <XCircle className="h-5 w-5 text-[#EF4444]" />;
      default:
        return <Clock className="h-5 w-5 text-[#FFD700]" />;
    }
  };

  const getResultadoClass = (resultado: string) => {
    switch (resultado) {
      case 'GANADA':
        return 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20';
      case 'PERDIDA':
        return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20';
      default:
        return 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20';
    }
  };

  // Estadísticas
  const totalApuestas = filteredApuestas.length;
  const ganadas = filteredApuestas.filter(a => a.resultado === 'GANADA').length;
  const perdidas = filteredApuestas.filter(a => a.resultado === 'PERDIDA').length;
  const pendientes = filteredApuestas.filter(a => a.resultado === 'PENDIENTE').length;
  const gananciaNeta = filteredApuestas.reduce((sum, a) => sum + (a.ganancia_neta || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[#00FF88]/30 border-t-[#00FF88] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[#00FF88]" />
            Gestión de Apuestas
          </h1>
          <p className="text-[#94A3B8] mt-1">Administra y actualiza resultados</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
          <p className="text-[#94A3B8] text-sm">Total</p>
          <p className="text-2xl font-bold text-white font-mono">{totalApuestas}</p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
          <p className="text-[#94A3B8] text-sm">Ganadas</p>
          <p className="text-2xl font-bold text-[#00FF88] font-mono">{ganadas}</p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
          <p className="text-[#94A3B8] text-sm">Perdidas</p>
          <p className="text-2xl font-bold text-[#EF4444] font-mono">{perdidas}</p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
          <p className="text-[#94A3B8] text-sm">Pendientes</p>
          <p className="text-2xl font-bold text-[#FFD700] font-mono">{pendientes}</p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
          <p className="text-[#94A3B8] text-sm">Ganancia Neta</p>
          <p className={`text-2xl font-bold font-mono ${gananciaNeta >= 0 ? 'text-[#00FF88]' : 'text-[#EF4444]'}`}>
            {gananciaNeta >= 0 ? '+' : ''}${gananciaNeta.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Buscar apuesta..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded pl-10 pr-4 py-2 text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]/50"
            />
          </div>

          {/* Filtro Resultado */}
          <select
            value={filtroResultado}
            onChange={(e) => setFiltroResultado(e.target.value)}
            className="bg-[#050505] border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50"
          >
            <option value="TODOS">Todos los resultados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="GANADA">Ganadas</option>
            <option value="PERDIDA">Perdidas</option>
          </select>

          {/* Filtro Tipster */}
          <select
            value={filtroTipster}
            onChange={(e) => setFiltroTipster(e.target.value)}
            className="bg-[#050505] border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-[#00FF88]/50"
          >
            <option value="TODOS">Todos los tipsters</option>
            {tipsters.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Apuestas */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">Fecha</th>
                <th className="text-left text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">Tipster</th>
                <th className="text-left text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">Apuesta</th>
                <th className="text-center text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">Cuota</th>
                <th className="text-center text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">Resultado</th>
                <th className="text-right text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">Ganancia</th>
                <th className="text-center text-[#94A3B8] text-xs font-medium uppercase tracking-wider px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredApuestas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-[#94A3B8] py-8">
                    No hay apuestas que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                filteredApuestas.map((apuesta) => (
                  <tr key={apuesta.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-white font-mono">{apuesta.fecha}</td>
                    <td className="px-4 py-3 text-sm text-white">{apuesta.tipster_alias || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-[#94A3B8] max-w-xs truncate">{apuesta.apuesta}</td>
                    <td className="px-4 py-3 text-sm text-white font-mono text-center">@{apuesta.cuota}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${getResultadoClass(apuesta.resultado)}`}>
                        {getResultadoIcon(apuesta.resultado)}
                        {apuesta.resultado}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-mono text-right ${(apuesta.ganancia_neta || 0) >= 0 ? 'text-[#00FF88]' : 'text-[#EF4444]'}`}>
                      {(apuesta.ganancia_neta || 0) >= 0 ? '+' : ''}${(apuesta.ganancia_neta || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {apuesta.resultado === 'PENDIENTE' && (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => actualizarResultado(apuesta.id, 'GANADA')}
                            className="p-1.5 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 rounded text-[#00FF88] transition"
                            title="Marcar como ganada"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => actualizarResultado(apuesta.id, 'PERDIDA')}
                            className="p-1.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 rounded text-[#EF4444] transition"
                            title="Marcar como perdida"
                          >
                            <TrendingDown className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
