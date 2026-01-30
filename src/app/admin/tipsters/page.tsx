'use client';

import { useState, useEffect } from 'react';
import { Trophy, Search, Edit2, Check, X } from 'lucide-react';
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

export default function TipstersPage() {
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ alias: '', deporte: '' });
  const [search, setSearch] = useState('');
  const { accessToken } = useAuth();

  useEffect(() => {
    loadTipsters();
  }, [accessToken]);

  const loadTipsters = async () => {
    if (!accessToken) return;
    try {
      const response = await adminFetch('/api/admin/tipsters/stats', {}, accessToken);
      const data = await response.json();
      setTipsters(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (tipster: Tipster) => {
    setEditingId(tipster.id);
    setEditForm({ alias: tipster.alias, deporte: tipster.deporte || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ alias: '', deporte: '' });
  };

  const saveEdit = async (id: number) => {
    if (!accessToken) return;
    try {
      await adminFetch(
        `/api/admin/tipsters/${id}`,
        { method: 'PUT', body: JSON.stringify(editForm) },
        accessToken
      );
      await loadTipsters();
      setEditingId(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleActive = async (id: number, currentState: boolean) => {
    if (!accessToken) return;
    try {
      await adminFetch(
        `/api/admin/tipsters/${id}`,
        { method: 'PUT', body: JSON.stringify({ activo: !currentState }) },
        accessToken
      );
      await loadTipsters();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredTipsters = tipsters.filter(t => 
    t.alias.toLowerCase().includes(search.toLowerCase()) ||
    t.nombre_real?.toLowerCase().includes(search.toLowerCase()) ||
    t.deporte?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Tipsters</h1>
          <p className="text-gray-400">Administra los tipsters y sus alias públicos</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por alias, nombre o deporte..."
          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-teal-500"
        />
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Nombre Real</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Alias Público</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Deporte</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Apuestas</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Win Rate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredTipsters.map((tipster) => {
              const winRate = tipster.total_apuestas > 0 
                ? ((tipster.ganadas / tipster.total_apuestas) * 100).toFixed(1)
                : '0';
              const isEditing = editingId === tipster.id;

              return (
                <tr key={tipster.id} className="hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-medium">{tipster.nombre_real}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.alias}
                        onChange={(e) => setEditForm({ ...editForm, alias: e.target.value })}
                        className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-sm"
                      />
                    ) : (
                      <span className="text-teal-400">{tipster.alias}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.deporte}
                        onChange={(e) => setEditForm({ ...editForm, deporte: e.target.value })}
                        className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-sm"
                      />
                    ) : (
                      <span className="text-gray-400">{tipster.deporte || '-'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{tipster.total_apuestas}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono ${parseFloat(winRate) >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {winRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(tipster.id, tipster.activo)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        tipster.activo 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {tipster.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => saveEdit(tipster.id)} className="text-emerald-400 hover:text-emerald-300">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEdit} className="text-red-400 hover:text-red-300">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(tipster)} className="text-gray-400 hover:text-teal-400">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
