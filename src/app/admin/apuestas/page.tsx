'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Edit2, Save, X, RefreshCw, Database, Download, AlertTriangle
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

const TIPOS_MERCADO = [
  'OVER GOLES', 'UNDER GOLES', 'AMBOS MARCAN', 'GANADOR', 'HANDICAP',
  'OVER CORNERS', 'UNDER CORNERS', 'OVER TARJETAS', 'UNDER TARJETAS',
  'COMBINADAS', 'TENIS', 'NBA', 'OTRO'
];

const RESULTADOS = ['PENDIENTE', 'GANADA', 'PERDIDA', 'NULA'];

const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export default function ApuestasAdminPage() {
  const [apuestas, setApuestas] = useState<Apuesta[]>([]);
  const [allApuestas, setAllApuestas] = useState<Apuesta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Apuesta>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResultado, setFilterResultado] = useState<string>('todos');
  const [filterFecha, setFilterFecha] = useState<string>('');
  const [filterTipster, setFilterTipster] = useState<string>('todos');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [tipsters, setTipsters] = useState<string[]>([]);
  const { accessToken } = useAuth();

  const loadApuestas = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const response = await adminFetch(`/api/admin/apuestas?limit=1000`, {}, accessToken);
      if (!response.ok) throw new Error('Error al cargar');
      const data = await response.json();
      const todas = data.apuestas || [];
      setAllApuestas(todas);
      
      const uniqueTipsters = Array.from(new Set(todas.map((a: Apuesta) => a.tipster_alias))).filter(Boolean).sort();
      setTipsters(uniqueTipsters as string[]);
      
      let filtered = todas;
      if (filterResultado !== 'todos') {
        filtered = filtered.filter((a: Apuesta) => a.resultado === filterResultado);
      }
      if (filterFecha) {
        filtered = filtered.filter((a: Apuesta) => a.fecha?.startsWith(filterFecha));
      }
      if (filterTipster !== 'todos') {
        filtered = filtered.filter((a: Apuesta) => a.tipster_alias === filterTipster);
      }
      
      setApuestas(filtered.slice(0, 100));
    } catch (error) {
      console.error('Error:', error);
      setApuestas([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, filterResultado, filterFecha, filterTipster]);

  useEffect(() => {
    loadApuestas();
  }, [loadApuestas]);

  const startEdit = (apuesta: Apuesta) => {
    setEditingId(apuesta.id);
    setEditData({
      fecha: apuesta.fecha?.split('T')[0] || '',
      resultado: apuesta.resultado || 'PENDIENTE',
      cuota: apuesta.cuota || 0,
      stake_ia: apuesta.stake_ia || 0,
      tipo_mercado: apuesta.tipo_mercado || 'OTRO'
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
        { method: 'PUT', body: JSON.stringify(editData) },
        accessToken
      );
      if (response.ok) {
        await loadApuestas();
        setEditingId(null);
        setEditData({});
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteApuesta = async (id: number) => {
    if (!accessToken || !confirm(`¿Eliminar apuesta #${id}?`)) return;
    try {
      await adminFetch(`/api/admin/apuestas/${id}`, { method: 'DELETE' }, accessToken);
      await loadApuestas();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const runAudit = async () => {
    if (!accessToken || !confirm('¿Recalcular rachas y ganancias?')) return;
    setIsAuditing(true);
    setAuditResult(null);
    try {
      const response = await adminFetch('/api/admin/auditar', { method: 'POST' }, accessToken);
      const data = await response.json();
      setAuditResult(`✅ ${data.rachas_corregidas} rachas, ${data.stakes_corregidos} ganancias actualizadas`);
      await loadApuestas();
    } catch (error) {
      setAuditResult('❌ Error');
    } finally {
      setIsAuditing(false);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    const BOM = '\uFEFF';
    const csv = BOM + data.map(row => Object.values(row).map(escapeCSV).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAll = () => {
    if (allApuestas.length === 0) return;
    setIsExporting(true);
    try {
      const headers = { ID: 'ID', Fecha: 'Fecha', Tipster: 'Tipster', Apuesta: 'Apuesta', Cuota: 'Cuota', Stake: 'Stake', Tipo: 'Tipo', Resultado: 'Resultado', Ganancia: 'Ganancia', Racha: 'Racha' };
      const data = [headers, ...allApuestas.map(a => ({
        ID: a.id,
        Fecha: a.fecha ? new Date(a.fecha).toLocaleDateString('es-CL') : '',
        Tipster: a.tipster_alias || '',
        Apuesta: a.apuesta || '',
        Cuota: a.cuota || 0,
        Stake: a.stake_ia || 0,
        Tipo: a.tipo_mercado || '',
        Resultado: a.resultado || 'PENDIENTE',
        Ganancia: a.ganancia_neta || 0,
        Racha: a.racha_actual || 0
      }))];
      downloadCSV(data, `apuestas_todas_${new Date().toISOString().split('T')[0]}.csv`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportResumen = () => {
    if (allApuestas.length === 0) return;
    const tipsterGroups = allApuestas.reduce((acc: Record<string, Apuesta[]>, a) => {
      const key = a.tipster_alias || 'Sin Tipster';
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
      return acc;
    }, {});
    
    const headers = { Tipster: 'Tipster', Total: 'Total', Ganadas: 'Ganadas', Perdidas: 'Perdidas', Pendientes: 'Pendientes', WinRate: 'Win Rate %', Ganancia: 'Ganancia Total' };
    const data = [headers, ...Object.entries(tipsterGroups).map(([tipster, apuestas]) => {
      const ganadas = apuestas.filter(a => a.resultado === 'GANADA').length;
      const perdidas = apuestas.filter(a => a.resultado === 'PERDIDA').length;
      const pendientes = apuestas.filter(a => a.resultado === 'PENDIENTE').length;
      const gananciaTotal = apuestas.reduce((sum, a) => sum + (a.ganancia_neta || 0), 0);
      return {
        Tipster: tipster,
        Total: apuestas.length,
        Ganadas: ganadas,
        Perdidas: perdidas,
        Pendientes: pendientes,
        WinRate: ((ganadas / (ganadas + perdidas || 1)) * 100).toFixed(1),
        Ganancia: gananciaTotal.toFixed(0)
      };
    })];
    downloadCSV(data, `resumen_tipsters_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportPendientes = () => {
    const pendientes = allApuestas.filter(a => a.resultado === 'PENDIENTE');
    if (pendientes.length === 0) { alert('No hay pendientes'); return; }
    const headers = { ID: 'ID', Fecha: 'Fecha', Tipster: 'Tipster', Apuesta: 'Apuesta', Cuota: 'Cuota', Stake: 'Stake', Tipo: 'Tipo' };
    const data = [headers, ...pendientes.map(a => ({
      ID: a.id,
      Fecha: a.fecha ? new Date(a.fecha).toLocaleDateString('es-CL') : '',
      Tipster: a.tipster_alias || '',
      Apuesta: a.apuesta || '',
      Cuota: a.cuota || 0,
      Stake: a.stake_ia || 0,
      Tipo: a.tipo_mercado || ''
    }))];
    downloadCSV(data, `pendientes_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const filteredApuestas = apuestas.filter(a => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return a.apuesta?.toLowerCase().includes(s) || 
           a.tipster_alias?.toLowerCase().includes(s) ||
           a.id.toString().includes(s) ||
           a.tipo_mercado?.toLowerCase().includes(s);
  });

  const getBadge = (resultado: string) => {
    const styles: Record<string, string> = {
      'GANADA': 'bg-emerald-500/20 text-emerald-400',
      'PERDIDA': 'bg-red-500/20 text-red-400',
      'NULA': 'bg-gray-500/20 text-gray-400',
      'PENDIENTE': 'bg-amber-500/20 text-amber-400'
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded ${styles[resultado] || styles['PENDIENTE']}`}>{resultado}</span>;
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Apuestas</h1>
          <p className="text-gray-400">{filteredApuestas.length} mostradas / {allApuestas.length} total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportAll} disabled={isExporting || allApuestas.length === 0}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50">
            <Download className="w-4 h-4" /> Todas
          </button>
          <button onClick={exportResumen} disabled={allApuestas.length === 0}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50">
            <Download className="w-4 h-4" /> Resumen
          </button>
          <button onClick={exportPendientes} disabled={allApuestas.length === 0}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50">
            <Download className="w-4 h-4" /> Pendientes
          </button>
          <button onClick={runAudit} disabled={isAuditing}
            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50">
            {isAuditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Auditar BD
          </button>
        </div>
      </div>

      {auditResult && (
        <div className={`p-4 rounded-lg ${auditResult.includes('✅') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
          {auditResult}
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white" />
        </div>
        <select value={filterTipster} onChange={(e) => setFilterTipster(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white">
          <option value="todos">Todos Tipsters</option>
          {tipsters.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterResultado} onChange={(e) => setFilterResultado(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white">
          <option value="todos">Todos Resultados</option>
          {RESULTADOS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input type="date" value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white" />
        <button onClick={loadApuestas} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Recargar
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400">ID</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400">Fecha</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400">Tipster</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400">Apuesta</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400">Cuota</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400">Stake</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400">Tipo</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400">Resultado</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400">Racha</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredApuestas.map((a) => (
              <tr key={a.id} className="hover:bg-slate-700/30">
                <td className="px-3 py-2 text-sm text-gray-300 font-mono">#{a.id}</td>
                <td className="px-3 py-2">
                  {editingId === a.id ? (
                    <input type="date" value={editData.fecha || ''} onChange={(e) => setEditData({...editData, fecha: e.target.value})}
                      className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-sm w-32" />
                  ) : (
                    <span className="text-sm text-gray-300">{a.fecha ? new Date(a.fecha).toLocaleDateString('es-CL') : '-'}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-sm text-teal-400">{a.tipster_alias}</td>
                <td className="px-3 py-2 text-sm text-white max-w-[200px] truncate" title={a.apuesta}>{a.apuesta}</td>
                <td className="px-3 py-2">
                  {editingId === a.id ? (
                    <input type="number" step="0.01" value={editData.cuota || ''} onChange={(e) => setEditData({...editData, cuota: parseFloat(e.target.value)})}
                      className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-sm w-16" />
                  ) : (
                    <span className="text-sm text-white font-mono">@{a.cuota}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {editingId === a.id ? (
                    <input type="number" value={editData.stake_ia || ''} onChange={(e) => setEditData({...editData, stake_ia: parseInt(e.target.value)})}
                      className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-sm w-20" />
                  ) : (
                    <span className="text-sm text-gray-300 font-mono">${a.stake_ia?.toLocaleString()}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {editingId === a.id ? (
                    <select value={editData.tipo_mercado || ''} onChange={(e) => setEditData({...editData, tipo_mercado: e.target.value})}
                      className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-xs">
                      {TIPOS_MERCADO.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : (
                    <span className="text-xs text-gray-400">{a.tipo_mercado}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {editingId === a.id ? (
                    <select value={editData.resultado || ''} onChange={(e) => setEditData({...editData, resultado: e.target.value})}
                      className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-xs">
                      {RESULTADOS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    getBadge(a.resultado)
                  )}
                </td>
                <td className="px-3 py-2 text-sm text-gray-300 font-mono">
                  {a.racha_actual > 0 ? '+' : ''}{a.racha_actual || 0}
                </td>
                <td className="px-3 py-2">
                  {editingId === a.id ? (
                    <div className="flex gap-1">
                      <button onClick={saveEdit} disabled={isSaving} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30">
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </button>
                      <button onClick={cancelEdit} className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(a)} className="p-1.5 bg-slate-700 text-gray-300 rounded hover:bg-slate-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteApuesta(a.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredApuestas.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay apuestas</p>
          </div>
        )}
      </div>
    </div>
  );
}
