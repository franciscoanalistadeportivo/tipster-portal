'use client';

import { useState, useEffect } from 'react';
import { 
  Trophy, Search, Edit2, Save, X, Check,
  TrendingUp, Target, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuth, adminFetch } from '../layout';

interface Tipster {
  id: number;
  nombre_real: string;
  alias: string;
  deporte: string;
  activo: boolean;
  total_apuestas: number;
  ganadas: number;
  perdidas: number;
}

export default function TipstersAdminPage() {
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const [filteredTipsters, setFilteredTipsters] = useState<Tipster[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ alias: '', deporte: '', activo: true });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { accessToken, csrfToken, refreshCsrf } = useAuth();

  useEffect(() => {
    loadTipsters();
  }, [accessToken]);

  useEffect(() => {
    const filtered = tipsters.filter(t => 
      t.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nombre_real.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.deporte?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTipsters(filtered);
  }, [searchTerm, tipsters]);

  const loadTipsters = async () => {
    if (!accessToken) return;
    
    try {
      const response = await adminFetch('/api/admin/tipsters', {}, accessToken, csrfToken);
      const data = await response.json();
      setTipsters(data);
      setFilteredTipsters(data);
    } catch (error) {
      console.error('Error loading tipsters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (tipster: Tipster) => {
    setEditingId(tipster.id);
    setEditForm({
      alias: tipster.alias,
      deporte: tipster.deporte || '',
      activo: tipster.activo
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ alias: '', deporte: '', activo: true });
  };

  const saveTipster = async (id: number) => {
    if (!accessToken) return;
    
    setIsSaving(true);
    try {
      const newCsrf = await refreshCsrf();
      
      const response = await adminFetch(
        `/api/admin/tipsters/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(editForm)
        },
        accessToken,
        newCsrf
      );

      const data = await response.json();

      if (data.success) {
        // Actualizar lista local
        setTipsters(prev => prev.map(t => 
          t.id === id 
            ? { ...t, alias: editForm.alias, deporte: editForm.deporte, activo: editForm.activo }
            : t
        ));
        setEditingId(null);
      } else {
        alert('Error al guardar');
      }
    } catch (error) {
      console.error('Error saving tipster:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActivo = async (tipster: Tipster) => {
    if (!accessToken) return;
    
    try {
      const newCsrf = await refreshCsrf();
      
      await adminFetch(
        `/api/admin/tipsters/${tipster.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ activo: !tipster.activo })
        },
        accessToken,
        newCsrf
      );

      setTipsters(prev => prev.map(t => 
        t.id === tipster.id ? { ...t, activo: !t.activo } : t
      ));
    } catch (error) {
      console.error('Error toggling tipster:', error);
    }
  };

  const calcularWinRate = (ganadas: number, total: number): number => {
    if (!total) return 0;
    return Math.round((ganadas / total) * 100);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Tipsters</h1>
          <p className="text-gray-400">Administra los tipsters y sus alias públicos</p>
        </div>
        <button
          onClick={loadTipsters}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 font-medium">Protección de Identidad</p>
            <p className="text-amber-400/70 text-sm">Los nombres reales nunca se muestran públicamente. Solo los alias son visibles para los usuarios.</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por alias, nombre o deporte..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{tipsters.length}</div>
              <div className="text-gray-400 text-sm">Total Tipsters</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {tipsters.filter(t => t.activo).length}
              </div>
              <div className="text-gray-400 text-sm">Activos</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {tipsters.reduce((sum, t) => sum + (t.total_apuestas || 0), 0)}
              </div>
              <div className="text-gray-400 text-sm">Total Apuestas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tipsters Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Nombre Real</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Alias Público</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Deporte</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Apuestas</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Win Rate</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Estado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTipsters.map((tipster) => (
                <tr key={tipster.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="px-6 py-4 text-gray-400 font-mono text-sm">{tipster.id}</td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500 text-sm font-mono bg-slate-700/50 px-2 py-1 rounded">
                      {tipster.nombre_real}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === tipster.id ? (
                      <input
                        type="text"
                        value={editForm.alias}
                        onChange={(e) => setEditForm({ ...editForm, alias: e.target.value })}
                        className="px-3 py-1.5 bg-slate-900 border border-teal-500 rounded text-white text-sm w-40"
                      />
                    ) : (
                      <span className="text-white font-medium">{tipster.alias}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === tipster.id ? (
                      <input
                        type="text"
                        value={editForm.deporte}
                        onChange={(e) => setEditForm({ ...editForm, deporte: e.target.value })}
                        className="px-3 py-1.5 bg-slate-900 border border-teal-500 rounded text-white text-sm w-32"
                        placeholder="Ej: Fútbol"
                      />
                    ) : (
                      <span className="text-gray-400">{tipster.deporte || '-'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-mono">{tipster.total_apuestas || 0}</div>
                    <div className="text-xs text-gray-500">
                      {tipster.ganadas || 0}W / {tipster.perdidas || 0}L
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`font-mono font-bold ${
                      calcularWinRate(tipster.ganadas, tipster.total_apuestas) >= 60 
                        ? 'text-emerald-400' 
                        : calcularWinRate(tipster.ganadas, tipster.total_apuestas) >= 50
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}>
                      {calcularWinRate(tipster.ganadas, tipster.total_apuestas)}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActivo(tipster)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        tipster.activo
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      }`}
                    >
                      {tipster.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === tipster.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveTipster(tipster.id)}
                          disabled={isSaving}
                          className="p-2 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(tipster)}
                        className="p-2 bg-slate-700 text-gray-400 rounded hover:bg-slate-600 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTipsters.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No se encontraron tipsters
          </div>
        )}
      </div>
    </div>
  );
}
