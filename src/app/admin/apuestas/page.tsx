'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Edit2, Save, X, RefreshCw, CheckCircle, 
  XCircle, Clock, AlertTriangle, Database, Calendar
} from 'lucide-react';
import { useAuth, adminFetch } from '../layout';

interface Apuesta {
  id: number;
  tipster_alias: string;
  tipster_id: number;
  apuesta: string;
  cuota: number;
  stake_ia: number;
  resultado: string;
  fecha: string;
  tipo_mercado: string;
  ganancia_neta: number;
  racha_actual: number;
}

export default function ApuestasAdminPage() {
  const [apuestas, setApuestas] = useState<Apuesta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Apuesta>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResultado, setFilterResultado] = useState<string>('todos');
  const [filterFecha, setFilterFecha] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { accessToken } = useAuth();

  useEffect(() => {
    loadApuestas();
  }, [accessToken, filterResultado, filterFecha]);

  const loadApuestas = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      let url = '/api/admin/apuestas?limit=100';
      if (filterResultado !== 'todos') url += `&resultado=${filterResultado}`;
      if (filterFecha) url += `&fecha=${filterFecha}`;
      
      const response = await adminFetch(url, {}, accessToken);
      const data = await response.json();
      setApuestas(data.apuestas || []);
    } catch (error) {
      console.error('Error loading apuestas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (apuesta: Apuesta) => {
    setEditingId(apuesta.id);
    setEditData({
      fecha: apuesta.fecha?.split('T')[0] || '',
      resultado: apuesta.resultado,
      cuota: apuesta.cuota,
      stake_ia: apuesta.stake_ia,
      tipo_mercado: apuesta.tipo_mercado
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!accessToken || !editingId) return;
    setIsSaving(true);
    try {
      const response = await adminFetch(
        `/api/admin/apuestas/${editingId}`,
        { 
          method: 'PUT', 
          body: JSON.stringify(editData) 
        },
        accessToken
      );
      
      if (response.ok) {
        await loadApuestas();
        setEditingId(null);
        setEditData({});
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteApuesta = async (id: number) => {
    if (!accessToken || !confirm('¿Eliminar esta apuesta?')) return;
    try {
      await adminFetch(`/api/admin/apuestas/${id}`, { method: 'DELETE' }, accessToken);
      await loadApuestas();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const runAudit = async () => {
    if (!accessToken) return;
    setIsAuditing(true);
    setAuditResult(null);
    try {
      const response = await adminFetch(
        '/api/admin/auditar',
        { method: 'POST' },
        accessToken
      );
      const data = await response.json();
      setAuditResult(`✅ Auditoría completada: ${data.rachas_corregidas || 0} rachas corregidas, ${data.stakes_corregidos || 0} stakes actualizados`);
      await loadApuestas();
    } catch (error) {
      setAuditResult('❌ Error en auditoría');
    } finally {
      setIsAuditing(false);
    }
  };

  const filteredApuestas = apuestas.filter(a => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return a.apuesta.toLowerCase().includes(search) || 
             a.tipster_alias?.toLowerCase().includes(search) ||
             a.id.toString().includes(search);
    }
    return true;
  });

  const getResultadoBadge = (resultado: string) => {
    switch (resultado) {
      case 'GANADA':
        return <span className="px-2 py-1 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400">GANADA</span>;
      case 'PERDIDA':
        return <span className="px-2 py-1 text-xs font-bold rounded bg-red-500/20 text-red-400">PERDIDA</span>;
      case 'NULA':
        return <span className="px-2 py-1 text-xs font-bold rounded bg-gray-500/20 text-gray-400">NULA</span>;
      default:
        return <span className="px-2 py-1 text-xs font-bold rounded bg-amber-500/20 text-amber-400">PENDIENTE</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Apuestas</h1>
          <p className="text-gray-400">{filteredApuestas.length} apuestas encontradas</p>
        </div>
        
        <button
          onClick={runAudit}
          disabled={isAuditing}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {isAuditing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          {isAuditing ? 'Auditando...' : '🔄 Auditar BD'}
        </button>
      </div>

      {/* Audit Result */}
      {auditResult && (
        <div className={`p-4 rounded-lg ${auditResult.includes('✅') ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
          <p className={auditResult.includes('✅') ? 'text-emerald-400' : 'text-red-400'}>{auditResult}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ID, tipster, apuesta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-teal-500"
            />
          </div>

          {/* Filter Resultado */}
          <select
            value={filterResultado}
            onChange={(e) => setFilterResultado(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-teal-500"
          >
            <option value="todos">Todos los resultados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="GANADA">Ganadas</option>
            <option value="PERDIDA">Perdidas</option>
            <option value="NULA">Nulas</option>
          </select>

          {/* Filter Fecha */}
          <input
            type="date"
            value={filterFecha}
            onChange={(e) => setFilterFecha(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-teal-500"
          />

          {/* Reload */}
          <button
            onClick={loadApuestas}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tipster</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Apuesta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Cuota</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Stake</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Resultado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Racha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredApuestas.map((apuesta) => (
                <tr key={apuesta.id} className="hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono">#{apuesta.id}</td>
                  
                  {/* Fecha */}
                  <td className="px-4 py-3">
                    {editingId === apuesta.id ? (
                      <input
                        type="date"
                        value={editData.fecha || ''}
                        onChange={(e) => setEditData({...editData, fecha: e.target.value})}
                        className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-sm w-32"
                      />
                    ) : (
                      <span className="text-sm text-gray-300">
                        {apuesta.fecha ? new Date(apuesta.fecha).toLocaleDateString('es-CL') : '-'}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-4 py-3 text-sm text-teal-400">{apuesta.tipster_alias}</td>
                  <td className="px-4 py-3 text-sm text-white max-w-xs truncate" title={apuesta.apuesta}>
                    {apuesta.apuesta}
                  </td>
                  
                  {/* Cuota */}
                  <td className="px-4 py-3">
                    {editingId === apuesta.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.cuota || ''}
                        onChange={(e) => setEditData({...editData, cuota: parseFloat(e.target.value)})}
                        className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-sm w-20"
                      />
                    ) : (
                      <span className="text-sm text-white font-mono">@{apuesta.cuota}</span>
                    )}
                  </td>
                  
                  {/* Stake */}
                  <td className="px-4 py-3">
                    {editingId === apuesta.id ? (
                      <input
                        type="number"
                        value={editData.stake_ia || ''}
                        onChange={(e) => setEditData({...editData, stake_ia: parseInt(e.target.value)})}
                        className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-sm w-24"
                      />
                    ) : (
                      <span className="text-sm text-gray-300 font-mono">${apuesta.stake_ia?.toLocaleString()}</span>
                    )}
                  </td>
                  
                  {/* Tipo Mercado */}
                  <td className="px-4 py-3">
                    {editingId === apuesta.id ? (
                      <select
                        value={editData.tipo_mercado || ''}
                        onChange={(e) => setEditData({...editData, tipo_mercado: e.target.value})}
                        className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-sm"
                      >
                        <option value="OVER GOLES">OVER GOLES</option>
                        <option value="UNDER GOLES">UNDER GOLES</option>
                        <option value="AMBOS MARCAN">AMBOS MARCAN</option>
                        <option value="GANADOR">GANADOR</option>
                        <option value="HANDICAP">HANDICAP</option>
                        <option value="OVER CORNERS">OVER CORNERS</option>
                        <option value="UNDER CORNERS">UNDER CORNERS</option>
                        <option value="OVER TARJETAS">OVER TARJETAS</option>
                        <option value="UNDER TARJETAS">UNDER TARJETAS</option>
                        <option value="COMBINADAS">COMBINADAS</option>
                        <option value="TENIS">TENIS</option>
                        <option value="NBA">NBA</option>
                      </select>
                    ) : (
                      <span className="text-xs text-gray-400">{apuesta.tipo_mercado}</span>
                    )}
                  </td>
                  
                  {/* Resultado */}
                  <td className="px-4 py-3">
                    {editingId === apuesta.id ? (
                      <select
                        value={editData.resultado || ''}
                        onChange={(e) => setEditData({...editData, resultado: e.target.value})}
                        className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-sm"
                      >
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="GANADA">GANADA</option>
                        <option value="PERDIDA">PERDIDA</option>
                        <option value="NULA">NULA</option>
                      </select>
                    ) : (
                      getResultadoBadge(apuesta.resultado)
                    )}
                  </td>
                  
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                    {apuesta.racha_actual > 0 ? '+' : ''}{apuesta.racha_actual || 0}
                  </td>
                  
                  {/* Actions */}
                  <td className="px-4 py-3">
                    {editingId === apuesta.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={isSaving}
                          className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"
                        >
                          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(apuesta)}
                          className="p-1.5 bg-slate-700 text-gray-300 rounded hover:bg-slate-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteApuesta(apuesta.id)}
                          className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredApuestas.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No se encontraron apuestas</p>
          </div>
        )}
      </div>
    </div>
  );
}
